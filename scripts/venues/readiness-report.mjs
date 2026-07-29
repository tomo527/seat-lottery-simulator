import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { batchMembershipVenueIds, readBatches, resolveBatch } from './batches.mjs'
import { parseArgs } from './cli.mjs'
import { readInventories, validateInventories } from './inventory.mjs'
import { SOURCE_DIR, readSources } from './lib.mjs'

export const reportPathForBatch = (batch) => path.resolve(`data/venue-readiness/${batch}.json`)
const READINESS = new Set(['R1', 'R2', 'R3', 'R4', 'R5'])

const calculatedSeatCount = (ranges) => (Array.isArray(ranges) ? ranges : []).reduce((total, range) => {
  if (!range || !Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from > range.to) return total
  return total + range.to - range.from + 1 - (Array.isArray(range.excluded) ? range.excluded.length : 0)
}, 0)

const currentWorkflowSummary = (items) => {
  const statuses = new Map()
  for (const { inventory } of items) {
    const status = inventory?.venue.researchStatus ?? 'missing'
    statuses.set(status, (statuses.get(status) ?? 0) + 1)
  }
  const production = statuses.get('production') ?? 0
  const blocked = statuses.get('blocked') ?? 0
  const rejected = statuses.get('rejected') ?? 0
  const missing = statuses.get('missing') ?? 0
  return {
    production,
    blocked,
    rejected,
    missing,
    draft: items.length - production - blocked - rejected - missing,
  }
}

const readReport = async (reportPath, batchId) => {
  try {
    return JSON.parse(await readFile(reportPath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Readiness report not found for batch ${batchId ?? '(default)'}: ${reportPath}`)
    }
    throw new Error(`Invalid readiness report for batch ${batchId ?? '(default)'}: ${error.message}`, { cause: error })
  }
}

const resolveBatchContext = async (batchId, options, sources) => {
  if (!batchId) return null
  const batches = options.batches ?? await readBatches(options.batchDir)
  const inventories = options.inventories ?? (options.inventoryItems ? null : await readInventories(options.inventoryDir))
  const inventoryValidation = options.inventoryItems
    ? { items: options.inventoryItems, errors: [] }
    : validateInventories(inventories, sources, options.validationOptions)
  try {
    return {
      resolved: resolveBatch(batchId, batches, inventoryValidation.items),
      inventoryErrors: inventoryValidation.errors,
    }
  } catch (error) {
    if (/^Batch not found:/.test(error.message)) {
      throw new Error(`${error.message}; readiness report cannot be resolved: ${reportPathForBatch(batchId)}`, { cause: error })
    }
    throw error
  }
}

export const readinessReport = async (options = {}) => {
  const batchId = options.batchId
  const reportPath = options.reportPath ?? reportPathForBatch(batchId ?? 'tokyo-wave-1')
  const sources = options.sources ?? await readSources(options.sourceDir ?? SOURCE_DIR)
  const batchContext = await resolveBatchContext(batchId, options, sources)
  const report = options.report ?? await readReport(reportPath, batchId)
  const byId = new Map(sources.map(({ data }) => [data?.id, data]))
  const errors = [...(batchContext?.inventoryErrors ?? [])]
  const seen = new Set()
  const lines = [
    `Readiness report: ${report.scope}`,
    `Baseline date: ${report.baselineDate}`,
    `Venues: ${report.venues.length}`,
    'venue ID | 会場名 | readiness | range進捗 | calculated | expected | 第2パス | 阻害要因 | 次の具体作業',
  ]

  if (batchContext) {
    const { resolved } = batchContext
    const summary = currentWorkflowSummary(resolved.items)
    lines.splice(3, 0,
      `Batch: ${resolved.data.batchId}`,
      `Batch candidates: ${resolved.items.length}`,
      `Supplemental membership: ${resolved.supplementalItems.length}`,
      `Readiness evaluated: ${report.venues.length}`,
      `Current batch workflow: production=${summary.production}, draft=${summary.draft}, blocked=${summary.blocked}, rejected=${summary.rejected}, missing=${summary.missing}`,
    )
    if (report.batchId !== undefined && report.batchId !== batchId) {
      errors.push(`readiness batchId ${String(report.batchId)} does not match requested batch ${batchId}`)
    }
    const allItems = [...resolved.items, ...resolved.supplementalItems]
    const membership = new Map()
    for (const item of allItems) {
      const venue = item.inventory?.venue
      for (const key of [item.targetId, venue?.inventoryId, venue?.venueSourceId].filter(Boolean)) membership.set(key, item)
    }
    for (const item of report.venues) {
      if (!membership.has(item.venueId)) errors.push(`readiness venueId is outside batch ${batchId}: ${item.venueId}`)
    }

    const cohort = report.cohort
    if (cohort !== undefined) {
      const exclusions = Array.isArray(cohort.excluded) ? cohort.excluded : []
      const excludedSeen = new Set()
      const excludedCounts = new Map()
      for (const exclusion of exclusions) {
        const member = membership.get(exclusion?.venueId)
        const canonicalId = member?.inventory?.venue.inventoryId ?? exclusion?.venueId
        if (!member || resolved.supplementalItems.includes(member)) {
          errors.push(`cohort exclusion is outside batch targets ${batchId}: ${String(exclusion?.venueId)}`)
        }
        if (excludedSeen.has(canonicalId)) errors.push(`duplicate cohort exclusion: ${String(exclusion?.venueId)}`)
        excludedSeen.add(canonicalId)
        const status = exclusion?.baselineStatus
        if (!['production', 'blocked'].includes(status)) {
          errors.push(`unknown cohort exclusion baselineStatus ${String(status)}: ${String(exclusion?.venueId)}`)
        }
        if (typeof exclusion?.reason !== 'string' || !exclusion.reason.trim()) {
          errors.push(`cohort exclusion reason is required: ${String(exclusion?.venueId)}`)
        }
        excludedCounts.set(status, (excludedCounts.get(status) ?? 0) + 1)
      }
      if (cohort.batchCandidateCount !== resolved.items.length) {
        errors.push(`cohort batchCandidateCount must be ${resolved.items.length}; found ${String(cohort.batchCandidateCount)}`)
      }
      const expectedEvaluated = new Set(resolved.items
        .map(({ inventory }) => inventory?.venue.inventoryId)
        .filter((id) => id && !excludedSeen.has(id)))
      const actualEvaluated = new Set(report.venues
        .map((item) => membership.get(item.venueId)?.inventory?.venue.inventoryId)
        .filter(Boolean))
      for (const id of expectedEvaluated) {
        if (!actualEvaluated.has(id)) errors.push(`readiness cohort classification missing: ${id}`)
      }
      for (const id of actualEvaluated) {
        if (!expectedEvaluated.has(id)) errors.push(`readiness cohort includes excluded target: ${id}`)
      }
      lines.splice(8, 0,
        `Readiness target exclusions at baseline: production=${excludedCounts.get('production') ?? 0}, blocked=${excludedCounts.get('blocked') ?? 0}`,
        `Readiness cohort: ${cohort.description}`,
      )
    }
  }

  for (const item of report.venues) {
    const source = byId.get(item.venueId)
    if (seen.has(item.venueId)) errors.push(`duplicate readiness venueId: ${item.venueId}`)
    seen.add(item.venueId)
    if (!source) errors.push(`missing source for readiness venueId: ${item.venueId}`)
    if (!READINESS.has(item.readiness)) errors.push(`unknown readiness ${item.readiness}: ${item.venueId}`)
    if (typeof item.nextAction !== 'string' || !item.nextAction.trim()) errors.push(`nextAction is required: ${item.venueId}`)
    const ranges = Array.isArray(source?.ranges) ? source.ranges.length : 0
    const calculated = calculatedSeatCount(source?.ranges)
    const expected = source?.representativePattern?.expectedSeatCount ?? 'null'
    lines.push([
      item.venueId,
      source?.name ?? '(missing)',
      item.readiness,
      `${ranges} ranges`,
      calculated,
      expected,
      item.secondPass,
      item.blocker || '(none)',
      item.nextAction,
    ].join(' | '))
  }
  const counts = new Map()
  for (const item of report.venues) counts.set(item.readiness, (counts.get(item.readiness) ?? 0) + 1)
  lines.splice(batchContext ? (report.cohort ? 10 : 8) : 3, 0, `Summary: ${[...READINESS].map((key) => `${key}=${counts.get(key) ?? 0}`).join(', ')}`)
  const expectedVenueCount = report.expectedVenueCount ?? 30
  if (report.venues.length !== expectedVenueCount) {
    errors.push(`readiness report must contain ${expectedVenueCount} venues; found ${report.venues.length}`)
  }
  lines.push('Validation errors:', ...(errors.length ? errors.map((error) => `  ${error}`) : ['  (none)']))
  return { text: lines.join('\n'), errors }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const args = parseArgs(process.argv.slice(2), new Map([['batch', 'value']]))
    const batchId = args.batch ?? 'tokyo-wave-1'
    const result = await readinessReport({ batchId })
    console.log(result.text)
    if (result.errors.length) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
