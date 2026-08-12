import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { buildOutputs, calculateSeatCount, CATALOG_PATH, DETAIL_DIR, exists, readSources } from './lib.mjs'
import { analyzeDatabaseSizes, evaluateSizeLimits } from './capacity.mjs'
import { regionForPrefecture } from './regions.mjs'
import { validateSources } from './validation.mjs'
import { readInventories, validateInventories } from './inventory.mjs'
import { readBatches, validateBatches } from './batches.mjs'

const sources = await readSources()
const validation = validateSources(sources)
const errors = [...validation.errors]
const inventories = await readInventories()
const inventoryValidation = validateInventories(inventories, sources)
errors.push(...inventoryValidation.errors)
const batches = await readBatches()
errors.push(...validateBatches(batches, inventoryValidation.items, sources).errors)
const { catalog: expectedCatalog, details: expectedDetails } = buildOutputs(sources)
let catalog = []
try {
  catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'))
  if (/sources|checkedAt|verification|completenessBasis|transformation|knownLimitations|publisher|https?:\/\//.test(JSON.stringify(catalog))) {
    errors.push('source/research metadata leaked into generated catalog')
  }
} catch (error) {
  errors.push(`catalog cannot be read: ${error.message}`)
}

const productionIds = new Set(sources.filter(({ data }) => data.status === 'production').map(({ data }) => data.id))
for (const entry of catalog) {
  if (!productionIds.has(entry.id)) errors.push(`${entry.id}: non-production source is present in generated catalog`)
  if (!entry.region || entry.region !== regionForPrefecture(entry.prefecture)) errors.push(`${entry.id}: catalog region is invalid`)
  if (!entry.municipality?.trim()) errors.push(`${entry.id}: catalog municipality is missing`)
  const configurations = entry.schemaVersion === 2 ? entry.configurations : [entry]
  for (const configuration of configurations) {
    const detailId = entry.schemaVersion === 2 ? `${entry.id}--${configuration.id}` : entry.id
    const detailPath = path.join(DETAIL_DIR, `${detailId}.json`)
    if (!(await exists(detailPath))) {
      errors.push(`${detailId}: generated detail file is missing`)
      continue
    }
    try {
      const detail = JSON.parse(await readFile(detailPath, 'utf8'))
      if (detail.totalSeatCount !== configuration.seatCount) errors.push(`${detailId}: catalog/detail count mismatch`)
      if (calculateSeatCount(detail.ranges ?? []) !== detail.totalSeatCount) errors.push(`${detailId}: detail calculated count mismatch`)
      if (detail.schemaVersion === 2 && (detail.venueId !== entry.id || detail.configurationId !== configuration.id)) {
        errors.push(`${detailId}: configuration identity mismatch`)
      }
      if (/source|checkedAt|verification|completenessBasis|transformation|knownLimitations/.test(JSON.stringify(detail))) {
        errors.push(`${detailId}: source/research metadata leaked into runtime detail`)
      }
    } catch (error) {
      errors.push(`${detailId}: generated detail cannot be read: ${error.message}`)
    }
  }
}
if (catalog.length !== expectedCatalog.length || [...expectedDetails.keys()].some((id) => !catalog.some((entry) => entry.id === id || id.startsWith(`${entry.id}--`)))) {
  errors.push('generated catalog production membership is invalid')
}

let catalogSize = 0
try {
  catalogSize = (await stat(CATALOG_PATH)).size
} catch {
  // Read error already reported above.
}
const detailFiles = (await readdir(DETAIL_DIR).catch(() => [])).filter((file) => file.endsWith('.json')).sort()
const detailSizes = []
const expectedDetailIds = new Set(expectedDetails.keys())
for (const file of detailFiles) {
  const fullPath = path.join(DETAIL_DIR, file)
  const size = (await stat(fullPath)).size
  detailSizes.push({ file, bytes: size })
  if (!expectedDetailIds.has(path.basename(file, '.json'))) errors.push(`${file}: non-production generated detail exists`)
}
const sizeAnalysis = analyzeDatabaseSizes({
  catalogBytes: catalogSize,
  detailBytes: detailSizes.map(({ bytes }) => bytes),
  venueCount: catalog.length,
})
sizeAnalysis.detailSizes = detailSizes
const sizeIssues = evaluateSizeLimits(sizeAnalysis)
errors.push(...sizeIssues.errors)

for (const warning of validation.warnings) console.warn(`WARNING: ${warning}`)
for (const warning of inventoryValidation.warnings) console.warn(`WARNING: ${warning}`)
for (const warning of sizeIssues.warnings) console.warn(`WARNING: ${warning}`)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  const configurations = catalog.flatMap((entry) => entry.schemaVersion === 2 ? entry.configurations : [entry])
  const totalSeats = configurations.reduce((sum, item) => sum + item.seatCount, 0)
  console.log(`Validated ${catalog.length} production venues, ${configurations.length} selectable configurations, and ${totalSeats.toLocaleString('ja-JP')} configuration-seat records (${validation.warnings.length + inventoryValidation.warnings.length + sizeIssues.warnings.length} warnings).`)
}
