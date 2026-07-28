import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { assertValidSources } from './validation.mjs'
import { buildOutputs, CATALOG_PATH, compactJsonText, DETAIL_DIR, jsonText, readSources } from './lib.mjs'
import { readInventories, validateInventories } from './inventory.mjs'

const pathExists = async (target, fs = { readFile }) => {
  try {
    await fs.readFile(target)
    return true
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') return error.code === 'EISDIR'
    throw error
  }
}

const directoryExists = async (target, fs) => {
  try {
    const entries = await fs.readdir(target)
    return Array.isArray(entries)
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

const callHook = async (hooks, name, context) => {
  if (typeof hooks?.[name] === 'function') await hooks[name](context)
}

export const writeGeneratedDatabaseAtomically = async (
  outputs,
  options = {},
) => {
  const catalogPath = options.catalogPath ?? CATALOG_PATH
  const detailDir = options.detailDir ?? DETAIL_DIR
  const fs = options.fs ?? { mkdir, mkdtemp, readFile, readdir: (await import('node:fs/promises')).readdir, rename, rm, writeFile }
  const stageParent = options.stageParent ?? path.dirname(catalogPath)
  await fs.mkdir(stageParent, { recursive: true })
  await fs.mkdir(path.dirname(detailDir), { recursive: true })
  const transactionDir = await fs.mkdtemp(path.join(stageParent, '.venue-build-'))
  const stagedCatalog = path.join(transactionDir, 'catalog.generated.json')
  const stagedDetails = path.join(transactionDir, 'venues')
  const backupCatalog = path.join(transactionDir, 'catalog.backup.json')
  const backupDetails = path.join(transactionDir, 'venues.backup')
  let hadCatalog = false
  let hadDetails = false
  let catalogReplaced = false
  let detailsBackedUp = false
  let detailsReplaced = false
  try {
    await fs.mkdir(stagedDetails, { recursive: true })
    await fs.writeFile(stagedCatalog, jsonText(outputs.catalog), 'utf8')
    await callHook(options.hooks, 'afterStageCatalog', { transactionDir })
    for (const [id, detail] of outputs.details) {
      await fs.writeFile(path.join(stagedDetails, `${id}.json`), compactJsonText(detail), 'utf8')
    }
    await callHook(options.hooks, 'afterStageDetails', { transactionDir })

    hadCatalog = await pathExists(catalogPath, fs)
    hadDetails = await directoryExists(detailDir, fs)
    await callHook(options.hooks, 'beforeCommit', { transactionDir })
    if (hadCatalog) await fs.rename(catalogPath, backupCatalog)
    await fs.rename(stagedCatalog, catalogPath)
    catalogReplaced = true
    await callHook(options.hooks, 'afterCatalogReplace', { transactionDir })
    if (hadDetails) {
      await fs.rename(detailDir, backupDetails)
      detailsBackedUp = true
    }
    await callHook(options.hooks, 'afterDetailBackup', { transactionDir })
    await fs.rename(stagedDetails, detailDir)
    detailsReplaced = true
    await callHook(options.hooks, 'afterDetailsReplace', { transactionDir })
    await fs.rm(transactionDir, { recursive: true, force: true })
  } catch (error) {
    const rollbackErrors = []
    const attempt = async (operation) => {
      try {
        await operation()
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }
    if (detailsReplaced) await attempt(() => fs.rm(detailDir, { recursive: true, force: true }))
    if (detailsBackedUp) await attempt(() => fs.rename(backupDetails, detailDir))
    if (catalogReplaced) await attempt(() => fs.rm(catalogPath, { force: true }))
    if (hadCatalog) await attempt(() => fs.rename(backupCatalog, catalogPath))
    await attempt(() => fs.rm(transactionDir, { recursive: true, force: true }))
    if (rollbackErrors.length) {
      throw new AggregateError([error, ...rollbackErrors], `Venue database transaction failed and rollback was incomplete: ${error.message}`)
    }
    throw error
  }
}

export const buildVenueDatabase = async (options = {}) => {
  const sources = options.sources ?? await readSources(options.sourceDir)
  const validation = assertValidSources(sources, options.validationOptions)
  const inventories = options.inventories ?? await readInventories(options.inventoryDir)
  if (inventories.length) {
    const inventoryValidation = validateInventories(inventories, sources, options.validationOptions)
    if (inventoryValidation.errors.length) throw new Error(inventoryValidation.errors.join('\n'))
  }
  const outputs = buildOutputs(sources)
  await writeGeneratedDatabaseAtomically(outputs, options)
  return { ...outputs, validation }
}
