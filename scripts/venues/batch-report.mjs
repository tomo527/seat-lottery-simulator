import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, requireArgs } from './cli.mjs'
import { formatBatchReport, readBatches, resolveBatch, validateBatches } from './batches.mjs'
import { readInventories, validateInventories } from './inventory.mjs'
import { readSources } from './lib.mjs'

export const batchReport = async (batchId, options = {}) => {
  const sources = options.sources ?? await readSources(options.sourceDir)
  const inventories = options.inventories ?? await readInventories(options.inventoryDir)
  const inventoryValidation = validateInventories(inventories, sources, options.validationOptions)
  const batches = options.batches ?? await readBatches(options.batchDir)
  const batchValidation = validateBatches(batches, inventoryValidation.items, sources)
  const resolved = resolveBatch(batchId, batches, inventoryValidation.items)
  return {
    text: formatBatchReport(resolved, batchValidation),
    errors: [...inventoryValidation.errors, ...batchValidation.errors],
    resolved,
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const args = parseArgs(process.argv.slice(2), new Map([['batch', 'value']]))
    requireArgs(args, ['batch'])
    const report = await batchReport(args.batch)
    console.log(report.text)
    if (report.errors.length) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
