import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import {
  INVENTORY_ELIGIBILITIES,
  INVENTORY_CATEGORIES,
  INVENTORY_OPERATIONAL_STATUSES,
  INVENTORY_PRIORITIES,
  INVENTORY_RESEARCH_STATUSES,
} from './constants.mjs'
import { INVENTORY_DIR } from './lib.mjs'
import { dateInTokyo, normalizeSearchText } from './validation.mjs'

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isDate = (value) => {
  if (!datePattern.test(value ?? '')) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}
const canonicalString = (value) => typeof value === 'string' && value.length > 0 && value === value.trim()
const SOURCE_BACKED_RESEARCH_STATUSES = new Set([
  'draft-created',
  'range-entry-in-progress',
  'first-pass-complete',
  'independent-review-pending',
  'independent-review-in-progress',
  'independent-review-mismatch',
  'independent-review-complete',
  'production',
  'rejected',
])

export const readInventories = async (inventoryDir = INVENTORY_DIR) => {
  const files = (await readdir(inventoryDir).catch((error) => {
    if (error.code === 'ENOENT') return []
    throw error
  })).filter((file) => file.endsWith('.json')).sort()
  return Promise.all(files.map(async (file) => {
    try {
      return { file, data: JSON.parse(await readFile(path.join(inventoryDir, file), 'utf8')) }
    } catch (error) {
      throw new Error(`${file}: invalid inventory JSON: ${error.message}`, { cause: error })
    }
  }))
}

const addStringError = (errors, label, value, { optional = false } = {}) => {
  if (optional && (value === null || value === undefined)) return
  if (!canonicalString(value)) errors.push(`${label} must be a non-empty canonical string`)
}

export const inventoryVenueType = (venue) => venue?.venueType ?? venue?.category

export const validateInventories = (inventories, sources = [], options = {}) => {
  const errors = []
  const warnings = []
  const today = options.today ?? dateInTokyo(options.now ?? new Date())
  const inventoryIds = new Map()
  const sourceAssignments = new Map()
  const items = []

  for (const { file, data } of inventories) {
    const label = `${file}:`
    if (!isPlainObject(data)) {
      errors.push(`${label} inventory root must be a plain object`)
      continue
    }
    if (data.inventoryVersion !== 1) errors.push(`${label} unsupported inventoryVersion ${String(data.inventoryVersion)}`)
    addStringError(errors, `${label} jurisdiction`, data.jurisdiction)
    const discovery = data.discoverySource
    if (!isPlainObject(discovery)) errors.push(`${label} discoverySource must be an object`)
    else {
      addStringError(errors, `${label} discoverySource.publisher`, discovery.publisher)
      addStringError(errors, `${label} discoverySource.title`, discovery.title)
      if (!Number.isSafeInteger(discovery.recordCount) || discovery.recordCount <= 0) {
        errors.push(`${label} discoverySource.recordCount must be a positive safe integer`)
      }
      if (discovery.url !== undefined) {
        try {
          if (new URL(discovery.url).protocol !== 'https:') throw new Error()
        } catch {
          errors.push(`${label} discoverySource.url must use HTTPS`)
        }
      }
      if (!isDate(discovery.checkedAt)) errors.push(`${label} discoverySource.checkedAt must be YYYY-MM-DD`)
      else if (discovery.checkedAt > today) errors.push(`${label} discoverySource.checkedAt is in the future`)
    }
    if (!Array.isArray(data.venues)) {
      errors.push(`${label} venues must be an array`)
      continue
    }
    if (Number.isSafeInteger(discovery?.recordCount) &&
        discovery.recordCount > 0 &&
        data.venues.length < discovery.recordCount) {
      errors.push(`${label} venues has ${data.venues.length} records but discoverySource.recordCount is ${discovery.recordCount}; coverage denominator is incomplete`)
    }
    for (const [index, venue] of data.venues.entries()) {
      const prefix = `${label} venue ${index}`
      if (!isPlainObject(venue)) {
        errors.push(`${prefix} must be an object`)
        continue
      }
      items.push({ file, jurisdiction: data.jurisdiction, venue })
      for (const field of ['inventoryId', 'facilityName', 'officialDisplayName', 'prefecture', 'city', 'eligibilityReason']) {
        addStringError(errors, `${prefix}.${field}`, venue[field])
      }
      addStringError(errors, `${prefix}.spaceName`, venue.spaceName, { optional: true })
      if (!slugPattern.test(venue.inventoryId ?? '')) errors.push(`${prefix}.inventoryId must be a lowercase alphanumeric hyphen slug`)
      const previousId = inventoryIds.get(venue.inventoryId)
      if (previousId) errors.push(`${prefix} duplicates inventoryId used by ${previousId}`)
      else if (typeof venue.inventoryId === 'string') inventoryIds.set(venue.inventoryId, prefix)
      if (venue.capacity !== null && (!Number.isSafeInteger(venue.capacity) || venue.capacity <= 0)) {
        errors.push(`${prefix}.capacity must be null or a positive safe integer`)
      }
      const type = inventoryVenueType(venue)
      if (!INVENTORY_CATEGORIES.has(type)) errors.push(`${prefix}.category/venueType has unknown value ${String(type)}`)
      const facilityUrlRequired = venue.eligibility === 'eligible' || venue.researchStatus === 'production'
      if (venue.officialFacilityUrl === null || venue.officialFacilityUrl === undefined) {
        if (facilityUrlRequired) errors.push(`${prefix}.officialFacilityUrl must use HTTPS once eligibility is confirmed`)
      } else {
        try {
          const protocol = new URL(venue.officialFacilityUrl).protocol
          if (!['http:', 'https:'].includes(protocol)) throw new Error()
          if (facilityUrlRequired && protocol !== 'https:') {
            errors.push(`${prefix}.officialFacilityUrl must use HTTPS once eligibility is confirmed`)
          } else if (protocol === 'http:') {
            warnings.push(`${prefix}.officialFacilityUrl still uses HTTP and must be rechecked before eligibility is confirmed`)
          }
        } catch {
          errors.push(`${prefix}.officialFacilityUrl must be null or an HTTP(S) URL`)
        }
      }
      if (!INVENTORY_OPERATIONAL_STATUSES.has(venue.operationalStatus)) errors.push(`${prefix}.operationalStatus has unknown value ${String(venue.operationalStatus)}`)
      if (!INVENTORY_ELIGIBILITIES.has(venue.eligibility)) errors.push(`${prefix}.eligibility has unknown value ${String(venue.eligibility)}`)
      if (!INVENTORY_PRIORITIES.has(venue.priority)) errors.push(`${prefix}.priority has unknown value ${String(venue.priority)}`)
      if (!INVENTORY_RESEARCH_STATUSES.has(venue.researchStatus)) errors.push(`${prefix}.researchStatus has unknown value ${String(venue.researchStatus)}`)
      if (!isDate(venue.lastCheckedAt)) errors.push(`${prefix}.lastCheckedAt must be YYYY-MM-DD`)
      else if (venue.lastCheckedAt > today) errors.push(`${prefix}.lastCheckedAt is in the future`)
      if (venue.venueSourceId !== null && venue.venueSourceId !== undefined) {
        if (!slugPattern.test(venue.venueSourceId)) errors.push(`${prefix}.venueSourceId must be null or a stable slug`)
        const previous = sourceAssignments.get(venue.venueSourceId)
        if (previous) errors.push(`${prefix} duplicates venueSourceId used by ${previous}`)
        else sourceAssignments.set(venue.venueSourceId, prefix)
      }
      if (venue.aliases !== undefined) {
        if (!Array.isArray(venue.aliases)) errors.push(`${prefix}.aliases must be an array`)
        else venue.aliases.forEach((alias, aliasIndex) => addStringError(errors, `${prefix}.aliases ${aliasIndex}`, alias))
      }
      for (const optionalField of ['deduplicationNote', 'blockingReason']) {
        if (venue[optionalField] !== undefined && venue[optionalField] !== null) {
          addStringError(errors, `${prefix}.${optionalField}`, venue[optionalField])
        }
      }
      if (SOURCE_BACKED_RESEARCH_STATUSES.has(venue.researchStatus) && !venue.venueSourceId) {
        errors.push(`${prefix}.venueSourceId is required for researchStatus ${venue.researchStatus}`)
      }
      if (venue.researchStatus === 'first-pass-complete' &&
          (venue.firstPassStatus !== undefined && venue.firstPassStatus !== 'complete')) {
        errors.push(`${prefix}.firstPassStatus must be complete for first-pass-complete`)
      }
      if (venue.researchStatus === 'independent-review-mismatch' &&
          !canonicalString(venue.blockingReason)) {
        errors.push(`${prefix}.blockingReason is required for independent-review-mismatch`)
      }
      if (venue.researchStatus === 'production') {
        if (venue.operationalStatus !== 'active') errors.push(`${prefix} production inventory venue must be active`)
        if (venue.eligibility !== 'eligible') errors.push(`${prefix} production inventory venue must be eligible`)
      }
      if (venue.operationalStatus === 'active' && venue.eligibility === 'eligible' && venue.researchStatus === 'not-started' && isDate(venue.lastCheckedAt)) {
        const ageDays = Math.floor((new Date(`${today}T00:00:00Z`) - new Date(`${venue.lastCheckedAt}T00:00:00Z`)) / 86_400_000)
        if (ageDays > 365) warnings.push(`${prefix} is active and eligible but has remained not-started for ${ageDays} days`)
      }
    }
  }

  const sourceById = new Map(sources.map(({ data }) => [data?.id, data]))
  const inventoryBySourceId = new Map(items.filter(({ venue }) => venue.venueSourceId).map((item) => [item.venue.venueSourceId, item]))
  for (const item of items) {
    const { venue } = item
    if (!venue.venueSourceId) continue
    const source = sourceById.get(venue.venueSourceId)
    if (SOURCE_BACKED_RESEARCH_STATUSES.has(venue.researchStatus) && !source) {
      errors.push(`${item.file}: ${venue.inventoryId} references missing source ${venue.venueSourceId}`)
      continue
    }
    if (venue.researchStatus === 'production' && source?.status !== 'production') {
      errors.push(`${item.file}: ${venue.inventoryId} is production but source ${venue.venueSourceId} is ${source?.status ?? 'missing'}`)
    }
    if (source?.status === 'production' && venue.researchStatus !== 'production') {
      errors.push(`${item.file}: source ${venue.venueSourceId} is production but inventory is ${venue.researchStatus}`)
    }
    if (source?.status === 'rejected' && venue.researchStatus !== 'rejected') {
      errors.push(`${item.file}: source ${venue.venueSourceId} is rejected but inventory is ${venue.researchStatus}`)
    }
    if (venue.researchStatus === 'rejected' && source?.status !== 'rejected') {
      errors.push(`${item.file}: ${venue.inventoryId} is rejected but source ${venue.venueSourceId} is ${source?.status ?? 'missing'}`)
    }
    if (['first-pass-complete', 'independent-review-in-progress', 'independent-review-complete'].includes(venue.researchStatus) && source) {
      const expected = source.representativePattern?.expectedSeatCount
      const ranges = Array.isArray(source.ranges) ? source.ranges : []
      const calculated = ranges.reduce((total, range) => {
        if (!range || !Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from > range.to) return total
        return total + range.to - range.from + 1 - (Array.isArray(range.excluded) ? range.excluded.length : 0)
      }, 0)
      if (source.representativePattern?.coverage !== 'complete' ||
          !Number.isSafeInteger(expected) ||
          expected <= 0 ||
          calculated !== expected) {
        errors.push(`${item.file}: ${venue.inventoryId} cannot be ${venue.researchStatus} until complete ranges match expectedSeatCount`)
      }
    }
    if (venue.researchStatus === 'independent-review-mismatch' && source &&
        (!Array.isArray(source.ranges) || source.ranges.length === 0)) {
      errors.push(`${item.file}: ${venue.inventoryId} cannot be independent-review-mismatch without the first-pass ranges`)
    }
  }
  const jurisdictions = new Set(inventories.map(({ data }) => data?.jurisdiction).filter(Boolean))
  for (const { file, data: source } of sources) {
    if (source?.status !== 'production' || !jurisdictions.has(source.prefecture)) continue
    if (!inventoryBySourceId.has(source.id)) errors.push(`${file}: production source is missing from the ${source.prefecture} inventory`)
  }

  return { errors, warnings, items, today }
}

const countBy = (items, key) => {
  const counts = new Map()
  for (const item of items) {
    const value = typeof key === 'function' ? key(item) : item[key]
    counts.set(value ?? '(unknown)', (counts.get(value ?? '(unknown)') ?? 0) + 1)
  }
  return new Map([...counts].sort(([left], [right]) => String(left).localeCompare(String(right), 'ja')))
}

export const capacityBand = (capacity) => {
  if (!Number.isSafeInteger(capacity)) return 'unknown'
  if (capacity < 300) return 'under-300'
  if (capacity < 500) return '300-499'
  if (capacity < 1_000) return '500-999'
  if (capacity < 2_000) return '1,000-1,999'
  return '2,000+'
}

export const findInventoryDuplicateCandidates = (items) => {
  const groups = new Map()
  const add = (kind, value, item) => {
    const normalized = normalizeSearchText(value)
    if (!normalized) return
    const key = `${kind}\0${normalized}`
    const group = groups.get(key) ?? []
    group.push(item.venue.inventoryId)
    groups.set(key, group)
  }
  for (const item of items) {
    const venue = item.venue
    add('official-name', venue.officialDisplayName, item)
    add('facility-space', `${venue.facilityName} ${venue.spaceName ?? ''}`, item)
    add('official-url', venue.officialFacilityUrl, item)
    for (const alias of Array.isArray(venue.aliases) ? venue.aliases : []) add('alias', alias, item)
  }
  return [...groups.entries()]
    .filter(([, ids]) => new Set(ids).size > 1)
    .map(([key, ids]) => {
      const [kind, normalized] = key.split('\0')
      return { kind, normalized, inventoryIds: [...new Set(ids)].sort() }
    })
    .sort((left, right) => left.kind.localeCompare(right.kind) || left.normalized.localeCompare(right.normalized, 'ja'))
}

export const summarizeInventory = (validation) => {
  const venues = validation.items.map(({ venue }) => venue)
  const total = venues.length
  const assessed = venues.filter((venue) => venue.eligibility !== 'needs-research').length
  const eligible = venues.filter((venue) => venue.eligibility === 'eligible')
  const likelyEligible = venues.filter((venue) => venue.eligibility === 'likely-eligible')
  const production = venues.filter((venue) => venue.researchStatus === 'production').length
  const eligibleProduction = eligible.filter((venue) => venue.researchStatus === 'production').length
  const outstandingByPriority = countBy(
    venues.filter((venue) => ['not-started', 'source-located'].includes(venue.researchStatus)),
    'priority',
  )
  return {
    total,
    active: venues.filter((venue) => venue.operationalStatus === 'active').length,
    byEligibility: countBy(venues, 'eligibility'),
    byResearchStatus: countBy(venues, 'researchStatus'),
    assessmentCoverage: total ? assessed / total : 0,
    eligibleProductionCoverage: eligible.length ? eligibleProduction / eligible.length : 0,
    provisionalQualifiedCoverage: eligible.length + likelyEligible.length
      ? production / (eligible.length + likelyEligible.length)
      : 0,
    byCity: countBy(venues, 'city'),
    byVenueType: countBy(venues, inventoryVenueType),
    byCapacityBand: countBy(venues, (venue) => capacityBand(venue.capacity)),
    byOperationalStatus: countBy(venues, 'operationalStatus'),
    outstandingByPriority,
    duplicates: findInventoryDuplicateCandidates(validation.items),
  }
}
