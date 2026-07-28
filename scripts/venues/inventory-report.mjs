import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readSources } from './lib.mjs'
import { readInventories, summarizeInventory, validateInventories } from './inventory.mjs'

const formatCounts = (title, counts) => [
  `${title}:`,
  ...([...counts].length ? [...counts].map(([key, count]) => `  ${key}: ${count}`) : ['  (none)']),
]

export const inventoryReport = async (options = {}) => {
  const sources = options.sources ?? await readSources(options.sourceDir)
  const inventories = options.inventories ?? await readInventories(options.inventoryDir)
  const validation = validateInventories(inventories, sources, options.validationOptions)
  const summary = summarizeInventory(validation)
  const lines = [
    `Inventory venues: ${summary.total}`,
    `Active: ${summary.active}`,
    ...formatCounts('Eligibility', summary.byEligibility),
    ...formatCounts('Research status', summary.byResearchStatus),
    `Assessment coverage: ${(summary.assessmentCoverage * 100).toFixed(1)}%`,
    `Eligible production coverage: ${(summary.eligibleProductionCoverage * 100).toFixed(1)}%`,
    `Provisional qualified coverage: ${(summary.provisionalQualifiedCoverage * 100).toFixed(1)}%`,
    ...formatCounts('By city', summary.byCity),
    ...formatCounts('By venue type', summary.byVenueType),
    ...formatCounts('By capacity', summary.byCapacityBand),
    ...formatCounts('By operational status', summary.byOperationalStatus),
    ...formatCounts('Priority outstanding (not-started/source-located)', summary.outstandingByPriority),
    'Duplicate candidates:',
    ...(summary.duplicates.length
      ? summary.duplicates.map((item) => `  ${item.kind} "${item.normalized}": ${item.inventoryIds.join(', ')}`)
      : ['  (none)']),
    'Inventory/source errors:',
    ...(validation.errors.length ? validation.errors.map((error) => `  ${error}`) : ['  (none)']),
    'Inventory warnings:',
    ...(validation.warnings.length ? validation.warnings.map((warning) => `  ${warning}`) : ['  (none)']),
  ]
  return { text: lines.join('\n'), validation, summary }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const report = await inventoryReport()
    console.log(report.text)
    if (report.validation.errors.length) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
