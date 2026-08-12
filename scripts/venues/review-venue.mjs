import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from './cli.mjs'
import { readBatches, resolveBatch, validateBatches } from './batches.mjs'
import { readInventories, validateInventories } from './inventory.mjs'
import { canonicalAreaId, readSources } from './lib.mjs'
import { configurationProductionGateIssues, productionGateIssues, validRangeSeatCount, validateSources } from './validation.mjs'

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const isReviewableRange = (range) =>
  isPlainObject(range) &&
  typeof range.rowLabel === 'string' &&
  range.rowLabel.trim().length > 0 &&
  (range.areaId === undefined || typeof range.areaId === 'string') &&
  (range.areaLabel === undefined || typeof range.areaLabel === 'string') &&
  validRangeSeatCount(range) !== undefined

const seatAtOffset = (ranges, offset) => {
  if (!Number.isSafeInteger(offset) || offset < 0) return undefined
  let remaining = offset
  for (const range of ranges) {
    const excluded = [...new Set(range.excluded ?? [])].sort((left, right) => left - right)
    const count = validRangeSeatCount(range)
    if (count === undefined) continue
    if (remaining >= count) {
      remaining -= count
      continue
    }
    let number = range.from + remaining
    for (const missing of excluded) {
      if (missing > number) break
      number += 1
    }
    return `${canonicalAreaId(range)} / ${range.rowLabel} / ${number}`
  }
  return undefined
}

const summarizeRows = (ranges) => {
  const areas = new Map()
  const rows = new Map()
  for (const range of ranges) {
    const areaKey = canonicalAreaId(range)
    const area = areas.get(areaKey) ?? { label: range.areaLabel ?? '(none)', seats: 0, rows: new Set(), ranges: 0, excluded: 0 }
    area.seats += validRangeSeatCount(range)
    area.rows.add(range.rowLabel)
    area.ranges += 1
    area.excluded += (range.excluded ?? []).length
    areas.set(areaKey, area)
    const rowKey = `${areaKey}\0${range.rowLabel}`
    const row = rows.get(rowKey) ?? []
    row.push(range)
    rows.set(rowKey, row)
  }
  const discontinuities = []
  const suspiciousGaps = []
  for (const [key, rowRanges] of rows) {
    const sorted = [...rowRanges].sort((left, right) => left.from - right.from || left.to - right.to)
    if (sorted.length > 1) {
      const gaps = []
      for (let index = 1; index < sorted.length; index += 1) {
        if (sorted[index].from > sorted[index - 1].to + 1) gaps.push(`${sorted[index - 1].to + 1}-${sorted[index].from - 1}`)
      }
      if (gaps.length) {
        const displayKey = key.replace('\0', ' / ')
        discontinuities.push(`${displayKey}: ${gaps.join(', ')}`)
        for (const gap of gaps) {
          const [from, to] = gap.split('-').map(Number)
          if (to - from + 1 <= 10) suspiciousGaps.push(`${displayKey}: ${gap}`)
        }
      }
    }
  }
  return { areas, discontinuities, suspiciousGaps }
}

const list = (items, empty = '(none)', limit = 20) => {
  if (!items.length) return [`  ${empty}`]
  const lines = items.slice(0, limit).map((item) => `  ${item}`)
  if (items.length > limit) lines.push(`  ... ${items.length - limit} more`)
  return lines
}

export const formatVenueReview = (source, validation) => {
  const { file } = source
  const data = isPlainObject(source.data) ? source.data : {}
  if (data.schemaVersion === 2) {
    const venueValidation = validation.byVenue.get(file) ?? { errors: [], warnings: [] }
    const configurationReviews = (Array.isArray(data.configurations) ? data.configurations : []).map((configuration) => {
      const rawRanges = Array.isArray(configuration?.ranges) ? configuration.ranges : []
      const ranges = rawRanges.filter(isReviewableRange)
      const calculated = ranges.reduce((sum, range) => sum + validRangeSeatCount(range), 0)
      const blockers = configuration?.status === 'production'
        ? configurationProductionGateIssues(data, configuration, `${file}/${configuration?.id ?? '(missing)'}:`)
        : [`${file}/${configuration?.id ?? '(missing)'}: status must be production/selectable`]
      return [
        `Configuration: ${configuration?.id ?? '(missing)'} | ${configuration?.canonicalName ?? '(missing)'}`,
        `Status: ${configuration?.status ?? '(missing)'} | selectable=${String(configuration?.selectable)}`,
        `Condition: ${configuration?.issuerDefinedCondition ?? '(missing)'}`,
        `Source generation: ${configuration?.sourceGeneration ?? '(missing)'}`,
        `Scope: ${configuration?.scope?.kind ?? '(missing)'}`,
        `Scope disclosure: ${configuration?.scopeDisclosure || '(none)'}`,
        `Seat count: expected=${configuration?.expectedSeatCount ?? '(unconfirmed)'}, calculated=${calculated}`,
        `Verification: ${configuration?.verification?.status ?? '(missing)'} | rangeDiff=${String(configuration?.verification?.rangeDiff ?? '(missing)')}`,
        'Production blockers:',
        ...list(blockers, '(none)', Number.POSITIVE_INFINITY),
      ].join('\n')
    })
    return [
      `ID: ${data.id ?? '(missing)'}`,
      `Schema: v2`,
      `Venue research status: ${data.status ?? '(missing)'}`,
      `Name: ${data.name ?? '(missing)'}`,
      `Configurations: ${configurationReviews.length}`,
      ...configurationReviews,
      'Validation errors:',
      ...list(venueValidation.errors, '(none)', Number.POSITIVE_INFINITY),
      'Validation warnings:',
      ...list(venueValidation.warnings),
    ].join('\n')
  }
  const rawRanges = Array.isArray(data.ranges) ? data.ranges : []
  const ranges = rawRanges.filter(isReviewableRange)
  const skippedRanges = rawRanges.length - ranges.length
  const calculated = ranges.reduce((sum, range) => sum + validRangeSeatCount(range), 0)
  const { areas, discontinuities, suspiciousGaps } = summarizeRows(ranges)
  const samples = skippedRanges > 0
    ? ['(unavailable due to validation errors)']
    : calculated > 0
      ? [0, Math.floor(calculated / 2), calculated - 1].map((offset) => `${offset}: ${seatAtOffset(ranges, offset)}`)
      : []
  const areaLines = [...areas.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, area]) => `${id} (${area.label}): ${area.seats} seats, ${area.rows.size} rows, ${area.ranges} ranges, ${area.excluded} excluded`)
  const sourceLines = (Array.isArray(data.sources) ? data.sources : [])
    .filter((item) => isPlainObject(item) && item.official === true)
    .map((item) => {
      const roles = Array.isArray(item.roles) ? item.roles.join(', ') : 'invalid roles'
      return `${item.id ?? '(missing id)'} [${roles || 'no roles'}] ${item.title ?? '(untitled)'} | ${item.checkedAt ?? '(unchecked)'} | ${item.url ?? '(no URL)'}`
    })
  const venueValidation = validation.byVenue.get(file) ?? { errors: [], warnings: [] }
  const gateIssues = productionGateIssues(data, `${file}:`)
  const blockers = [
    ...(data.status === 'production' ? [] : [`${file}: status must be production`]),
    ...gateIssues,
    ...venueValidation.errors,
  ]
  const missingAreaLabels = ranges
    .filter((range) => range.areaId && !range.areaLabel)
    .map((range) => `${canonicalAreaId(range)} / ${range.rowLabel} / ${range.from}-${range.to}`)
  const excludedCount = ranges.reduce((sum, range) => sum + (range.excluded?.length ?? 0), 0)
  const expected = isPlainObject(data.representativePattern) ? data.representativePattern.expectedSeatCount : '(unavailable due to validation errors)'
  const calculatedText = skippedRanges
    ? `${calculated} partial (${skippedRanges} ranges unavailable due to validation errors)`
    : String(calculated)
  const totalText = Array.isArray(data.ranges)
    ? `${data.ranges.length} ranges (${ranges.length} reviewable), ${excludedCount} excluded`
    : '(unavailable due to validation errors)'
  const aliases = Array.isArray(data.aliases) ? data.aliases.join(', ') : '(unavailable due to validation errors)'
  const pattern = isPlainObject(data.representativePattern) ? data.representativePattern : {}
  const verification = isPlainObject(data.verification) ? data.verification : {}
  return [
    `ID: ${data.id ?? '(missing)'}`,
    `Status: ${data.status ?? '(missing)'}`,
    `Name: ${data.name ?? '(missing)'}`,
    `Location: ${data.prefecture ?? '(missing)'} ${data.city ?? '(missing)'}`,
    `Venue type: ${data.venueType ?? '(missing)'}`,
    `Aliases: ${aliases || '(none)'}`,
    `Representative pattern: ${pattern.name ?? '(missing)'}`,
    `Coverage: ${pattern.coverage ?? '(missing)'}`,
    'Official sources:',
    ...list(sourceLines),
    `Verification: ${verification.status ?? '(missing)'} | ${verification.checkedAt ?? '(unchecked)'} | ${verification.method || '(no method)'}`,
    `Seat count: expected=${expected ?? '(unconfirmed)'}, calculated=${calculatedText}`,
    `Totals: ${totalText}`,
    'Areas:',
    ...list(areaLines),
    'Deterministic offset samples:',
    ...list(samples),
    'Discontinuous rows:',
    ...list(discontinuities),
    'Suspicious small gaps:',
    ...list(suspiciousGaps),
    'Missing area labels:',
    ...list(missingAreaLabels),
    'Validation errors:',
    ...list(venueValidation.errors, '(none)', Number.POSITIVE_INFINITY),
    'Validation warnings:',
    ...list(venueValidation.warnings),
    'Production blockers:',
    ...list([...new Set(blockers)], '(none)', Number.POSITIVE_INFINITY),
  ].join('\n')
}

export const reviewVenues = async ({ id, all, batch } = {}, options = {}) => {
  const selectionCount = Number(Boolean(id)) + Number(Boolean(all)) + Number(Boolean(batch))
  if (selectionCount !== 1) throw new Error('Specify exactly one of --id <venue-id>, --all, or --batch <batch-id>.')
  const sources = options.sources ?? await readSources(options.sourceDir)
  let selected
  let batchMissing = []
  if (batch) {
    const inventories = options.inventories ?? await readInventories(options.inventoryDir)
    const inventoryValidation = validateInventories(inventories, sources, options.validationOptions)
    const batches = options.batches ?? await readBatches(options.batchDir)
    const batchValidation = validateBatches(batches, inventoryValidation.items, sources)
    if (batchValidation.errors.length) throw new Error(batchValidation.errors.join('\n'))
    const resolved = resolveBatch(batch, batches, inventoryValidation.items)
    const sourceIds = new Set(resolved.items.map(({ inventory }) => inventory?.venue.venueSourceId).filter(Boolean))
    const availableSourceIds = new Set(sources.map(({ data }) => data?.id).filter(Boolean))
    selected = sources.filter(({ data }) => sourceIds.has(data?.id))
    batchMissing = resolved.items
      .filter(({ inventory }) => {
        const sourceId = inventory?.venue.venueSourceId
        return !sourceId || !availableSourceIds.has(sourceId)
      })
      .map(({ targetId, inventory }) => {
        const sourceId = inventory?.venue.venueSourceId
        const suffix = sourceId ? ` (planned source ID: ${sourceId})` : ''
        return `${targetId}: ${inventory?.venue.officialDisplayName ?? '(missing inventory)'} has no source JSON${suffix}`
      })
  } else {
    selected = all ? sources : sources.filter(({ data }) => data?.id === id)
  }
  if (!selected.length && !batchMissing.length) throw new Error(`Venue source not found: ${id ?? `batch ${batch}`}`)
  const validation = validateSources(sources, options.validationOptions)
  const reviews = selected.map((source) => formatVenueReview(source, validation))
  if (batchMissing.length) reviews.push(['Batch targets without source:', ...batchMissing.map((item) => `  ${item}`)].join('\n'))
  return reviews.join('\n\n' + '='.repeat(72) + '\n\n')
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const args = parseArgs(process.argv.slice(2), new Map([
      ['id', 'value'],
      ['all', 'boolean'],
      ['batch', 'value'],
    ]))
    console.log(await reviewVenues(args))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
