import path from 'node:path'
import {
  CONFIDENCE_LEVELS,
  CONFIGURATION_AUTHORITIES,
  CONFIGURATION_SCOPES,
  PATTERN_COVERAGES,
  SOURCE_ROLES,
  SOURCE_STATUSES,
  SUPPORTED_SCHEMA_VERSIONS,
  VENUE_TYPES,
  VERIFICATION_RESULTS,
  VERIFICATION_STATUSES,
  WHEELCHAIR_STATUSES,
  WARNING_LIMITS,
} from './constants.mjs'
import { canonicalAreaId } from './lib.mjs'
import { regionForPrefecture } from './regions.mjs'

export const normalizeSearchText = (value) =>
  typeof value === 'string' ? value.normalize('NFKC').trim().toLocaleLowerCase('ja-JP') : ''

export const normalizeSeatText = (value) =>
  typeof value === 'string' ? value.normalize('NFKC').trim() : ''

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const asciiPlaceholderPattern = /(?<![\p{L}\p{N}])(?:todo|tbd|placeholder)(?![\p{L}\p{N}])/u
const japanesePlaceholderPattern = /(?:^|[\s()[\]{}<>「」『』【】,，、:：;；/|_\-。.!！?？])未設定(?:$|[\s()[\]{}<>「」『』【】,，、:：;；/|_\-。.!！?？])/u
const incompleteDataPattern = /(?<![\p{L}\p{N}])(?:demo|sample|partial)(?![\p{L}\p{N}])/u

const parseDate = (value) => {
  if (!datePattern.test(value ?? '')) return undefined
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? undefined : date
}

export const dateInTokyo = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]))
  return `${value.year}-${value.month}-${value.day}`
}

const issueCollector = () => {
  const errors = []
  const warnings = []
  return {
    errors,
    warnings,
    error: (message) => errors.push(message),
    warn: (message) => warnings.push(message),
  }
}

const validateString = (value, label, issues, options = {}) => {
  if (typeof value !== 'string') {
    issues.error(options.nonEmpty && (value === undefined || value === null) ? `${label} is missing` : `${label} must be a string`)
    return false
  }
  if (value !== value.trim()) issues.error(`${label} must not have leading or trailing whitespace`)
  if (options.nonEmpty && value.trim().length === 0) issues.error(`${label} is missing`)
  if (options.nfkc && value !== value.normalize('NFKC')) issues.error(`${label} must be stored in NFKC form`)
  return true
}

const validateStringArray = (value, label, issues, options = {}) => {
  if (!Array.isArray(value)) {
    issues.error(`${label} must be an array`)
    return
  }
  value.forEach((item, index) => validateString(item, `${label} ${index}`, issues, options))
}

const containsPlaceholderToken = (value) => {
  if (typeof value !== 'string') return false
  const normalized = value.normalize('NFKC').trim().toLocaleLowerCase('ja-JP')
  return asciiPlaceholderPattern.test(normalized) || japanesePlaceholderPattern.test(normalized)
}

const collectProductionStrings = (value, pathParts = [], output = []) => {
  if (typeof value === 'string') {
    if (pathParts.at(-1) !== 'rejectionReason') output.push({ path: pathParts.join('.'), value })
    return output
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectProductionStrings(item, [...pathParts, String(index)], output))
  } else if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, item]) => collectProductionStrings(item, [...pathParts, key], output))
  }
  return output
}

const validateRepresentativePattern = (data, label, issues) => {
  const pattern = data.representativePattern
  if (!isPlainObject(pattern)) {
    issues.error(`${label} representativePattern must be a plain object`)
    return
  }
  validateString(pattern.id, `${label} representativePattern.id`, issues)
  validateString(pattern.name, `${label} representativePattern.name`, issues)
  validateString(pattern.selectionReason, `${label} representativePattern.selectionReason`, issues)
  if (!PATTERN_COVERAGES.has(pattern.coverage)) {
    issues.error(`${label} representativePattern.coverage has unknown value ${String(pattern.coverage)}`)
  }
  const expectedIsValid = pattern.expectedSeatCount === null ||
    (Number.isSafeInteger(pattern.expectedSeatCount) && pattern.expectedSeatCount > 0)
  if (!expectedIsValid) {
    issues.error(`${label} representativePattern.expectedSeatCount must be null or a positive safe integer`)
  }
  validateStringArray(pattern.notIncludedPatterns, `${label} representativePattern.notIncludedPatterns`, issues, { nonEmpty: true })
}

const validateConfidence = (value, label, issues) => {
  if (value !== undefined && !CONFIDENCE_LEVELS.has(value)) issues.error(`${label} has unknown value ${String(value)}`)
}

const validateVerification = (data, label, today, issues) => {
  const verification = data.verification
  if (!isPlainObject(verification)) {
    issues.error(`${label} verification must be a plain object`)
    return
  }
  if (!VERIFICATION_STATUSES.has(verification.status)) {
    issues.error(`${label} verification.status has unknown value ${String(verification.status)}`)
  }
  validateString(verification.method, `${label} verification.method`, issues)
  if (!VERIFICATION_RESULTS.has(verification.seatStructure)) {
    issues.error(`${label} verification.seatStructure has unknown value ${String(verification.seatStructure)}`)
  }
  if (!VERIFICATION_RESULTS.has(verification.seatCount)) {
    issues.error(`${label} verification.seatCount has unknown value ${String(verification.seatCount)}`)
  }
  validateStringArray(verification.unresolvedIssues, `${label} verification.unresolvedIssues`, issues, { nonEmpty: true })
  if (verification.checkedAt !== null) {
    const checkedAt = parseDate(verification.checkedAt)
    if (!checkedAt) issues.error(`${label} verification.checkedAt must be null or a valid YYYY-MM-DD date`)
    else if (checkedAt > today) issues.error(`${label} verification.checkedAt is in the future`)
  }
}

const validateSourceMetadata = (data, label, today, issues) => {
  if (!Array.isArray(data.sources)) {
    issues.error(`${label} sources must be an array`)
    return
  }
  const sourceIds = new Set()
  for (const [index, source] of data.sources.entries()) {
    const prefix = `${label} source ${index}`
    if (!isPlainObject(source)) {
      issues.error(`${prefix} must be an object`)
      continue
    }
    validateString(source.id, `${prefix} id`, issues, { nonEmpty: true })
    if (!slugPattern.test(source.id ?? '')) issues.error(`${prefix} has an invalid source ID`)
    else if (sourceIds.has(source.id)) issues.error(`${prefix} duplicates source ID ${source.id}`)
    else sourceIds.add(source.id)
    if (source.official !== true && source.official !== false) issues.error(`${prefix} official must be a boolean`)
    validateString(source.publisher, `${prefix} publisher`, issues, { nonEmpty: true })
    validateString(source.title, `${prefix} title`, issues, { nonEmpty: true })
    let url
    try {
      url = new URL(source.url)
    } catch {
      // Handled below.
    }
    if (!url || url.protocol !== 'https:') issues.error(`${prefix} URL must use HTTPS`)
    const checkedAt = parseDate(source.checkedAt)
    if (!checkedAt) issues.error(`${prefix} checkedAt must be a valid YYYY-MM-DD date`)
    else {
      if (checkedAt > today) issues.error(`${prefix} checkedAt is in the future`)
      const ageDays = Math.floor((today - checkedAt) / 86_400_000)
      if (ageDays > WARNING_LIMITS.sourceAgeDays) issues.warn(`${prefix} was checked ${ageDays} days ago`)
    }
    if (!Array.isArray(source.roles) || source.roles.length === 0) {
      issues.error(`${prefix} roles must be a non-empty array`)
    } else {
      const uniqueRoles = new Set()
      for (const role of source.roles) {
        if (!SOURCE_ROLES.has(role)) issues.error(`${prefix} has unknown role ${String(role)}`)
        if (uniqueRoles.has(role)) issues.error(`${prefix} duplicates role ${role}`)
        uniqueRoles.add(role)
      }
    }
  }
}

export const validRangeSeatCount = (range) => {
  if (
    !isPlainObject(range) ||
    !Number.isSafeInteger(range.from) ||
    !Number.isSafeInteger(range.to) ||
    range.from < 0 ||
    range.to < range.from ||
    !Array.isArray(range.excluded ?? [])
  ) return undefined
  const excluded = range.excluded ?? []
  if (excluded.some((number) => !Number.isSafeInteger(number) || number < 0 || number < range.from || number > range.to)) return undefined
  if (new Set(excluded).size !== excluded.length) return undefined
  return range.to - range.from + 1 - excluded.length
}

const validateRanges = (data, label, issues) => {
  if (!Array.isArray(data.ranges)) {
    issues.error(`${label} ranges must be an array`)
    return 0
  }
  const areaIdToLabel = new Map()
  const areaLabelToId = new Map()
  const normalizedAreaIds = new Map()
  const normalizedAreaLabels = new Map()
  const canonicalRowLabels = new Map()
  const rowGroups = new Map()
  const fragmentedRows = []
  let calculatedSeatCount = 0
  let hasImplicitMain = false
  let hasExplicitMain = false

  for (const [index, range] of data.ranges.entries()) {
    const prefix = `${label} range ${index}`
    if (!isPlainObject(range)) {
      issues.error(`${prefix} must be an object`)
      continue
    }
    validateString(range.rowLabel, `${prefix} rowLabel`, issues, { nonEmpty: true })
    if (![range.from, range.to].every(Number.isSafeInteger)) issues.error(`${prefix} from/to must be safe integers`)
    if (Number.isSafeInteger(range.from) && range.from < 0) issues.error(`${prefix} from must be non-negative`)
    if (Number.isSafeInteger(range.to) && range.to < 0) issues.error(`${prefix} to must be non-negative`)
    if (Number.isSafeInteger(range.from) && Number.isSafeInteger(range.to) && range.from > range.to) {
      issues.error(`${prefix} has from > to`)
    }

    const excluded = range.excluded ?? []
    if (!Array.isArray(excluded)) issues.error(`${prefix} excluded must be an array`)
    else {
      const seenExcluded = new Set()
      for (const number of excluded) {
        if (!Number.isSafeInteger(number) || number < 0) issues.error(`${prefix} excluded must contain safe non-negative integers`)
        if (seenExcluded.has(number)) issues.error(`${prefix} has duplicate exclusion ${number}`)
        seenExcluded.add(number)
        if (Number.isSafeInteger(range.from) && Number.isSafeInteger(range.to) && (number < range.from || number > range.to)) {
          issues.error(`${prefix} exclusion ${number} is outside the range`)
        }
      }
    }

    const hasAreaId = range.areaId !== undefined
    const hasAreaLabel = range.areaLabel !== undefined
    if (hasAreaId) validateString(range.areaId, `${prefix} areaId`, issues, { nonEmpty: true })
    if (hasAreaLabel) validateString(range.areaLabel, `${prefix} areaLabel`, issues, { nonEmpty: true })
    if (hasAreaLabel && !hasAreaId) issues.error(`${prefix} areaLabel requires areaId`)
    if (data.status === 'production' && hasAreaId && !hasAreaLabel) {
      issues.error(`${prefix} production areaId requires a displayable areaLabel`)
    }

    const runtimeArea = canonicalAreaId(range)
    const normalizedArea = normalizeSeatText(runtimeArea)
    const normalizedRow = normalizeSeatText(range.rowLabel)
    if (!hasAreaId) hasImplicitMain = true
    if (hasAreaId && runtimeArea === 'main') hasExplicitMain = true

    if (typeof runtimeArea === 'string') {
      const previousRawArea = normalizedAreaIds.get(normalizedArea)
      if (previousRawArea !== undefined && previousRawArea !== runtimeArea) {
        issues.error(`${prefix} areaId ${runtimeArea} duplicates normalized areaId ${previousRawArea}`)
      } else if (previousRawArea === undefined) normalizedAreaIds.set(normalizedArea, runtimeArea)
    }

    if (hasAreaId && hasAreaLabel && typeof range.areaId === 'string' && typeof range.areaLabel === 'string') {
      const canonicalLabel = normalizeSeatText(range.areaLabel)
      const previousRawLabel = normalizedAreaLabels.get(canonicalLabel)
      if (previousRawLabel !== undefined && previousRawLabel !== range.areaLabel) {
        issues.error(`${prefix} areaLabel ${range.areaLabel} duplicates normalized areaLabel ${previousRawLabel}`)
      } else if (previousRawLabel === undefined) normalizedAreaLabels.set(canonicalLabel, range.areaLabel)
      const previousLabel = areaIdToLabel.get(normalizedArea)
      const previousId = areaLabelToId.get(canonicalLabel)
      if (previousLabel !== undefined && previousLabel !== canonicalLabel) {
        issues.error(`${prefix} areaId ${range.areaId} maps to multiple normalized labels`)
      }
      if (previousId !== undefined && previousId !== normalizedArea) {
        issues.error(`${prefix} areaLabel ${range.areaLabel} maps to multiple normalized IDs`)
      }
      areaIdToLabel.set(normalizedArea, canonicalLabel)
      areaLabelToId.set(canonicalLabel, normalizedArea)
    }

    if (normalizedRow) {
      const rowIdentity = `${normalizedArea}\0${normalizedRow}`
      const previousRaw = canonicalRowLabels.get(rowIdentity)
      if (previousRaw !== undefined && previousRaw !== range.rowLabel) {
        issues.error(`${prefix} rowLabel ${range.rowLabel} duplicates normalized rowLabel ${previousRaw}`)
      } else if (previousRaw === undefined) canonicalRowLabels.set(rowIdentity, range.rowLabel)
    }

    const count = validRangeSeatCount(range)
    if (count !== undefined) calculatedSeatCount += count
    const key = `${runtimeArea}\0${typeof range.rowLabel === 'string' ? range.rowLabel : ''}`
    const intervals = rowGroups.get(key) ?? []
    intervals.push({ from: range.from, to: range.to, index })
    rowGroups.set(key, intervals)
  }

  if (hasImplicitMain && hasExplicitMain) {
    issues.error(`${label} implicit areaId and explicit areaId "main" cannot be mixed because both resolve to runtime area main`)
  }

  for (const [key, intervals] of rowGroups) {
    const sorted = intervals
      .filter(({ from, to }) => Number.isSafeInteger(from) && Number.isSafeInteger(to) && from <= to)
      .sort((left, right) => left.from - right.from || left.to - right.to || left.index - right.index)
    let furthest
    for (const interval of sorted) {
      if (furthest && interval.from <= furthest.to) {
        const [areaId, rowLabel] = key.split('\0')
        issues.error(`${label} range ${interval.index} overlaps range ${furthest.index} in ${areaId}/${rowLabel}`)
      }
      if (!furthest || interval.to > furthest.to) furthest = interval
    }
    if (sorted.length > WARNING_LIMITS.rangesPerRow) {
      const [areaId, rowLabel] = key.split('\0')
      fragmentedRows.push(`${areaId}/${rowLabel} (${sorted.length})`)
    }
  }
  if (fragmentedRows.length) {
    issues.warn(`${label} ${fragmentedRows.length} rows are unusually fragmented; first: ${fragmentedRows.slice(0, 3).join(', ')}`)
  }
  if (data.status === 'production' && calculatedSeatCount < 1) issues.error(`${label} production has no selectable seats`)
  return calculatedSeatCount
}

export const productionGateIssues = (data, label = `${data?.id ?? '(unknown)'}:`) => {
  const blockers = []
  const add = (condition, message) => {
    if (condition) blockers.push(`${label} ${message}`)
  }
  const pattern = data?.representativePattern
  add(!isPlainObject(pattern), 'representativePattern must be one object')
  if (isPlainObject(pattern)) {
    add(typeof pattern.id !== 'string' || !pattern.id.trim(), 'representativePattern.id is missing')
    add(typeof pattern.name !== 'string' || !pattern.name.trim(), 'representativePattern.name is missing')
    add(pattern.coverage !== 'complete', 'coverage must be complete')
    add(typeof pattern.selectionReason !== 'string' || !pattern.selectionReason.trim(), 'selectionReason is missing')
    add(!Array.isArray(pattern.notIncludedPatterns), 'notIncludedPatterns must be an array')
    if (Number.isSafeInteger(pattern.expectedSeatCount) && Array.isArray(data?.ranges)) {
      const counts = data.ranges.map(validRangeSeatCount)
      const calculated = counts.every((count) => count !== undefined) ? counts.reduce((sum, count) => sum + count, 0) : undefined
      add(calculated === undefined, 'seat count cannot be calculated until all ranges are valid')
      add(calculated !== undefined && calculated < 1, 'at least one selectable seat is required')
    }
  }
  add(typeof data?.registeredScope !== 'string' || !data.registeredScope.trim(), 'registeredScope is missing')
  add(typeof data?.completenessBasis !== 'string' || !data.completenessBasis.trim(), 'completenessBasis is missing')
  add(typeof data?.transformation !== 'string' || !data.transformation.trim(), 'transformation is missing')
  add(!Array.isArray(data?.knownLimitations), 'knownLimitations must be an array')

  const officialSources = Array.isArray(data?.sources) ? data.sources.filter((source) => source?.official === true) : []
  add(officialSources.length === 0, 'at least one official source is required')
  const evidenceSources = Array.isArray(data?.sources) ? data.sources : []
  add(!evidenceSources.some((source) => source?.roles?.includes('seat-structure')), 'a seat-structure source is required')
  add(!officialSources.some((source) => source?.roles?.some((role) => ['seat-structure', 'seat-count', 'facility', 'event-layout'].includes(role))), 'an official supporting source is required')
  const usesSecondarySeatStructure = evidenceSources.some((source) => source?.official === false && source?.roles?.includes('seat-structure')) &&
    !evidenceSources.some((source) => source?.official === true && source?.roles?.includes('seat-structure'))
  add(usesSecondarySeatStructure && data?.confidence !== 'approximate', 'secondary-only seat structure requires approximate confidence')

  const verification = data?.verification
  add(!isPlainObject(verification), 'verification must be an object')
  if (isPlainObject(verification)) {
    add(!['reviewed', 'verified'].includes(verification.status), 'verification.status must be reviewed or verified')
    add(!parseDate(verification.checkedAt), 'verification.checkedAt must be a valid YYYY-MM-DD date')
    add(typeof verification.method !== 'string' || !verification.method.trim(), 'verification.method is missing')
    add(verification.seatStructure !== 'matched', 'verification.seatStructure must be matched')
    add(!Array.isArray(verification.unresolvedIssues), 'verification.unresolvedIssues must be an array')
  }

  for (const item of collectProductionStrings(data)) {
    if (containsPlaceholderToken(item.value)) add(true, `placeholder token is forbidden at ${item.path}`)
  }
  const incompleteIdentity = [data?.id, data?.name, pattern?.id, pattern?.name, pattern?.coverage, data?.registeredScope]
    .filter((value) => typeof value === 'string')
    .join(' ')
    .normalize('NFKC')
    .toLocaleLowerCase('ja-JP')
  add(incompleteDataPattern.test(incompleteIdentity), 'demo/sample/partial production data is forbidden')
  return blockers
}

export const configurationProductionGateIssues = (data, configuration, label = `${data?.id ?? '(unknown)'}/${configuration?.id ?? '(unknown)'}:`) => {
  const blockers = []
  const add = (condition, message) => {
    if (condition) blockers.push(`${label} ${message}`)
  }
  add(!CONFIGURATION_AUTHORITIES.has(configuration?.definitionAuthority), 'definitionAuthority is invalid')
  add(configuration?.definitionAuthority !== 'issuer' && !['representative', 'approximate'].includes(configuration?.confidence), 'non-issuer representative selection requires explicit representative or approximate confidence')
  add(![configuration?.issuerDefinedCondition, configuration?.selectionBasis].some((value) => typeof value === 'string' && value.trim()), 'issuerDefinedCondition or selectionBasis is required')
  add(typeof configuration?.sourceGeneration !== 'string' || !configuration.sourceGeneration.trim(), 'sourceGeneration is missing')
  add(configuration?.numberedSeatSetComplete !== true, 'numbered seat set must be complete')
  add(configuration?.capacityFitting === true, 'capacity fitting is forbidden')
  add(configuration?.repositoryInventedDifferences === true, 'repository-invented configuration differences are forbidden')
  add(configuration?.scope?.containsEventDependentSeatIds === true && configuration?.representativeEventLayout !== true, 'event-dependent seat IDs require representativeEventLayout metadata')
  add(!CONFIGURATION_SCOPES.has(configuration?.scope?.kind), 'scope.kind is invalid')
  add(!Array.isArray(configuration?.sourceIds) || configuration.sourceIds.length === 0, 'official sourceIds are required')

  const allSources = Array.isArray(data?.sources) ? data.sources : []
  const referencedSources = allSources.filter((source) => configuration?.sourceIds?.includes(source?.id))
  const officialSources = referencedSources.filter((source) => source?.official === true)
  add(referencedSources.length === 0, 'configuration requires evidence source references')
  add(!referencedSources.some((source) => source?.roles?.includes('seat-structure')), 'configuration requires a seat-structure source')
  add(!officialSources.some((source) => source?.roles?.some((role) => ['seat-structure', 'seat-count', 'facility', 'event-layout'].includes(role))), 'configuration requires an official supporting source')
  if (configuration?.scope?.containsEventDependentSeatIds === true) {
    add(!officialSources.some((source) => source?.roles?.includes('event-layout')), 'representative event layouts require an official event-layout source')
  }
  const usesSecondarySeatStructure = referencedSources.some((source) => source?.official === false && source?.roles?.includes('seat-structure')) &&
    !referencedSources.some((source) => source?.official === true && source?.roles?.includes('seat-structure'))
  add(usesSecondarySeatStructure && configuration?.confidence !== 'approximate', 'secondary-only seat structure requires approximate confidence')
  if (Number.isSafeInteger(configuration?.expectedSeatCount) && Array.isArray(configuration?.ranges)) {
    const counts = configuration.ranges.map(validRangeSeatCount)
    const calculated = counts.every((count) => count !== undefined) ? counts.reduce((sum, count) => sum + count, 0) : undefined
    add(calculated === undefined, 'seat count cannot be calculated until all ranges are valid')
    add(calculated !== undefined && calculated < 1, 'at least one selectable seat is required')
  }

  const wheelchair = configuration?.wheelchairSemantics
  add(!isPlainObject(wheelchair), 'wheelchairSemantics must be an object')
  if (isPlainObject(wheelchair)) {
    add(!WHEELCHAIR_STATUSES.has(wheelchair.status), 'wheelchairSemantics.status is invalid')
    add(typeof wheelchair.description !== 'string' || !wheelchair.description.trim(), 'wheelchairSemantics.description is missing')
    add(!Array.isArray(wheelchair.sourceIds), 'wheelchairSemantics.sourceIds must be an array')
    add(wheelchair.status === 'not-reflected' && wheelchair.accessibilityConversionNotReflected !== true, 'not-reflected wheelchair semantics require accessibilityConversionNotReflected')
  }

  const verification = configuration?.verification
  add(!isPlainObject(verification), 'verification must be an object')
  if (isPlainObject(verification)) {
    add(!['reviewed', 'verified'].includes(verification.status), 'verification.status must be reviewed or verified')
    add(!parseDate(verification.checkedAt), 'verification.checkedAt must be a valid YYYY-MM-DD date')
    add(typeof verification.method !== 'string' || !verification.method.trim(), 'verification.method is missing')
    add(verification.seatStructure !== 'matched', 'verification.seatStructure must be matched')
    add(!Array.isArray(verification.unresolvedIssues), 'verification.unresolvedIssues must be an array')
  }

  if (configuration?.scope?.kind === 'fixed-only') {
    add(typeof configuration?.scopeDisclosure !== 'string' || !configuration.scopeDisclosure.trim(), 'fixed-only scopeDisclosure is required')
    add(typeof configuration?.canonicalName !== 'string' || !configuration.canonicalName.includes('固定'), 'fixed-only canonicalName must identify the fixed-seat limitation')
    add(configuration?.scope?.excludesDynamicAreas !== true, 'fixed-only scope must exclude dynamic arena/floor areas')
    add(configuration?.scope?.maximumCapacity !== false, 'fixed-only scope must disclose that it is not the maximum-capacity layout')
    add(!Array.isArray(configuration?.scope?.excludedAreas) || configuration.scope.excludedAreas.length === 0, 'fixed-only excludedAreas are required')
    const calculated = Array.isArray(configuration?.ranges) && configuration.ranges.every((range) => validRangeSeatCount(range) !== undefined)
      ? configuration.ranges.reduce((sum, range) => sum + validRangeSeatCount(range), 0)
      : undefined
    add(calculated !== undefined && configuration?.scope?.exactSubtotal !== calculated, 'fixed-only exactSubtotal must equal the mapped seat count')
  }

  for (const item of collectProductionStrings(configuration)) {
    if (containsPlaceholderToken(item.value)) add(true, `placeholder token is forbidden at ${item.path}`)
  }
  return blockers
}

const validateConfigurationV2 = (data, configuration, index, label, today, issues) => {
  const prefix = `${label} configuration ${index}`
  if (!isPlainObject(configuration)) {
    issues.error(`${prefix} must be a plain object`)
    return
  }
  validateString(configuration.id, `${prefix}.id`, issues, { nonEmpty: true })
  if (!slugPattern.test(configuration.id ?? '')) issues.error(`${prefix}.id must be a lowercase alphanumeric hyphen slug`)
  validateString(configuration.canonicalName, `${prefix}.canonicalName`, issues, { nonEmpty: true })
  if (configuration.issuerDefinedCondition !== undefined) validateString(configuration.issuerDefinedCondition, `${prefix}.issuerDefinedCondition`, issues, { nonEmpty: true })
  if (configuration.selectionBasis !== undefined) validateString(configuration.selectionBasis, `${prefix}.selectionBasis`, issues, { nonEmpty: true })
  validateString(configuration.sourceGeneration, `${prefix}.sourceGeneration`, issues, { nonEmpty: true })
  const expectedIsValid = configuration.expectedSeatCount === null ||
    (Number.isSafeInteger(configuration.expectedSeatCount) && configuration.expectedSeatCount > 0)
  if (!expectedIsValid) issues.error(`${prefix}.expectedSeatCount must be null or a positive safe integer`)
  if (!CONFIGURATION_AUTHORITIES.has(configuration.definitionAuthority)) issues.error(`${prefix}.definitionAuthority has unknown value ${String(configuration.definitionAuthority)}`)
  if (configuration.capacityFitting !== false) issues.error(`${prefix}.capacityFitting must be false`)
  if (configuration.repositoryInventedDifferences !== false) issues.error(`${prefix}.repositoryInventedDifferences must be false`)
  if (!SOURCE_STATUSES.has(configuration.status)) issues.error(`${prefix}.status has unknown value ${String(configuration.status)}`)
  if (typeof configuration.selectable !== 'boolean') issues.error(`${prefix}.selectable must be boolean`)
  if (configuration.selectable && configuration.status !== 'production') issues.error(`${prefix} selectable configurations must have production status`)
  if (configuration.status === 'production' && configuration.selectable !== true) issues.error(`${prefix} production configurations must be selectable`)
  validateStringArray(configuration.sourceIds, `${prefix}.sourceIds`, issues, { nonEmpty: true })
  if (Array.isArray(configuration.sourceIds) && new Set(configuration.sourceIds).size !== configuration.sourceIds.length) issues.error(`${prefix}.sourceIds must not contain duplicates`)
  validateStringArray(configuration.differenceBasisSourceIds, `${prefix}.differenceBasisSourceIds`, issues, { nonEmpty: true })
  if (!isPlainObject(configuration.scope)) issues.error(`${prefix}.scope must be a plain object`)
  else {
    if (!CONFIGURATION_SCOPES.has(configuration.scope.kind)) issues.error(`${prefix}.scope.kind has unknown value ${String(configuration.scope.kind)}`)
    if (typeof configuration.scope.containsEventDependentSeatIds !== 'boolean') issues.error(`${prefix}.scope.containsEventDependentSeatIds must be boolean`)
    if (configuration.scope.issuerDefined !== undefined && typeof configuration.scope.issuerDefined !== 'boolean') issues.error(`${prefix}.scope.issuerDefined must be boolean when present`)
  }
  validateString(configuration.scopeDisclosure, `${prefix}.scopeDisclosure`, issues)
  if (!isPlainObject(configuration.wheelchairSemantics)) issues.error(`${prefix}.wheelchairSemantics must be a plain object`)
  else {
    validateString(configuration.wheelchairSemantics.status, `${prefix}.wheelchairSemantics.status`, issues, { nonEmpty: true })
    if (!WHEELCHAIR_STATUSES.has(configuration.wheelchairSemantics.status)) issues.error(`${prefix}.wheelchairSemantics.status has unknown value ${String(configuration.wheelchairSemantics.status)}`)
    validateString(configuration.wheelchairSemantics.description, `${prefix}.wheelchairSemantics.description`, issues)
    validateStringArray(configuration.wheelchairSemantics.sourceIds, `${prefix}.wheelchairSemantics.sourceIds`, issues, { nonEmpty: true })
  }
  if (configuration.representativeEventLayout !== undefined && typeof configuration.representativeEventLayout !== 'boolean') issues.error(`${prefix}.representativeEventLayout must be boolean when present`)
  validateConfidence(configuration.confidence, `${prefix}.confidence`, issues)
  validateVerification(configuration, prefix, today, issues)
  if (configuration.verification?.rangeDiff !== undefined && configuration.verification.rangeDiff !== null && !Number.isSafeInteger(configuration.verification.rangeDiff)) {
    issues.error(`${prefix}.verification.rangeDiff must be null or a safe integer`)
  }
  const calculated = validateRanges(configuration, prefix, issues)
  const sourceIds = new Set((data.sources ?? []).map((source) => source?.id))
  for (const sourceId of [...(configuration.sourceIds ?? []), ...(configuration.wheelchairSemantics?.sourceIds ?? [])]) {
    if (!sourceIds.has(sourceId)) issues.error(`${prefix} source reference ${String(sourceId)} does not exist`)
  }
  if (configuration.status === 'production') {
    for (const blocker of configurationProductionGateIssues(data, configuration, prefix)) issues.error(blocker)
    if (Number.isSafeInteger(configuration.expectedSeatCount) && calculated !== configuration.expectedSeatCount) issues.warn(`${prefix} official total ${configuration.expectedSeatCount} differs from mapped seat count ${calculated}`)
  }
}

export const validateSources = (sources, options = {}) => {
  const todayText = options.today ?? dateInTokyo(options.now ?? new Date())
  const today = parseDate(todayText)
  if (!today) throw new Error(`Invalid validation today: ${String(todayText)}`)
  const allIssues = issueCollector()
  const byVenue = new Map()
  const ids = new Map()
  const locations = new Map()
  const searchTerms = new Map()

  const venueIssuesFor = (file) => {
    const existing = byVenue.get(file)
    if (existing) return existing
    const created = issueCollector()
    byVenue.set(file, created)
    return created
  }
  const addError = (file, message) => {
    venueIssuesFor(file).error(message)
    allIssues.error(message)
  }
  const addWarning = (file, message) => {
    venueIssuesFor(file).warn(message)
    allIssues.warn(message)
  }

  for (const { file, data } of sources) {
    const label = `${file}:`
    const local = issueCollector()
    const sourceData = isPlainObject(data) ? data : {}
    if (!isPlainObject(data)) local.error(`${label} source root must be a plain object`)
    const expectedFile = typeof sourceData.id === 'string' && sourceData.id ? `${sourceData.id}.json` : undefined
    if (expectedFile !== file) local.error(`${label} filename must match data.id (${expectedFile ?? 'missing ID'})`)
    if (!SUPPORTED_SCHEMA_VERSIONS.has(sourceData.schemaVersion)) local.error(`${label} unsupported schemaVersion ${String(sourceData.schemaVersion)}`)
    if (!SOURCE_STATUSES.has(sourceData.status)) local.error(`${label} unknown or missing status ${String(sourceData.status)}`)
    validateString(sourceData.id, `${label} id`, local, { nonEmpty: true })
    if (!slugPattern.test(sourceData.id ?? '')) local.error(`${label} id must be a lowercase alphanumeric hyphen slug`)
    for (const field of ['name', 'prefecture', 'city']) validateString(sourceData[field], `${label} ${field}`, local, { nonEmpty: true })
    if (!VENUE_TYPES.has(sourceData.venueType)) local.error(`${label} unknown venueType ${String(sourceData.venueType)}`)
    if (typeof sourceData.prefecture === 'string' && sourceData.prefecture.trim() && !regionForPrefecture(sourceData.prefecture)) {
      local.error(`${label} prefecture ${sourceData.prefecture} has no region mapping`)
    }
    if (!Array.isArray(sourceData.aliases)) local.error(`${label} aliases must be an array`)
    else {
      validateStringArray(sourceData.aliases, `${label} alias`, local, { nonEmpty: true })
      const aliases = sourceData.aliases.map(normalizeSearchText)
      if (new Set(aliases).size !== aliases.length) local.error(`${label} has duplicate normalized aliases`)
      if (aliases.includes(normalizeSearchText(sourceData.name))) local.error(`${label} alias duplicates the venue name`)
    }
    validateSourceMetadata(sourceData, label, today, local)
    if (sourceData.schemaVersion === 1) {
      validateRepresentativePattern(sourceData, label, local)
      validateString(sourceData.registeredScope, `${label} registeredScope`, local)
      validateString(sourceData.completenessBasis, `${label} completenessBasis`, local)
      validateString(sourceData.transformation, `${label} transformation`, local)
      validateStringArray(sourceData.knownLimitations, `${label} knownLimitations`, local, { nonEmpty: true })
      validateVerification(sourceData, label, today, local)
      validateConfidence(sourceData.confidence, `${label} confidence`, local)
      const calculated = validateRanges(sourceData, label, local)
      if (sourceData.status === 'production') {
        for (const blocker of productionGateIssues(sourceData, label)) local.error(blocker)
        if (Number.isSafeInteger(sourceData.representativePattern?.expectedSeatCount) &&
            calculated !== sourceData.representativePattern.expectedSeatCount) {
          local.warn(`${label} official total ${sourceData.representativePattern.expectedSeatCount} differs from mapped seat count ${calculated}`)
        }
      }
    } else if (sourceData.schemaVersion === 2) {
      if (!Array.isArray(sourceData.configurations) || sourceData.configurations.length === 0) {
        local.error(`${label} configurations must be a non-empty array`)
      } else {
        const configurationIds = new Set()
        const physicalSeatSets = new Map()
        for (const [index, configuration] of sourceData.configurations.entries()) {
          validateConfigurationV2(sourceData, configuration, index, label, today, local)
          if (typeof configuration?.id === 'string') {
            if (configurationIds.has(configuration.id)) local.error(`${label} duplicate configuration ID ${configuration.id}`)
            configurationIds.add(configuration.id)
          }
          if (Array.isArray(configuration?.ranges)) {
            const signature = JSON.stringify(configuration.ranges.map((range) => ({
              areaId: range?.areaId ?? 'main',
              rowLabel: range?.rowLabel,
              from: range?.from,
              to: range?.to,
              excluded: [...(range?.excluded ?? [])].sort((left, right) => left - right),
            })).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))))
            const previous = physicalSeatSets.get(signature)
            if (previous) {
              const sourceIds = new Set((sourceData.sources ?? []).map((source) => source?.id))
              if (!Array.isArray(configuration.duplicateSeatSetBasisSourceIds) || configuration.duplicateSeatSetBasisSourceIds.length === 0 ||
                  !configuration.duplicateSeatSetBasisSourceIds.every((id) => sourceIds.has(id))) {
                local.error(`${label} configurations ${previous} and ${configuration.id ?? index} duplicate a physical seat set without source evidence`)
              }
            } else physicalSeatSets.set(signature, configuration.id ?? String(index))
          }
          if (sourceData.configurations.length > 1) {
            if (!Array.isArray(configuration?.differenceBasisSourceIds) || configuration.differenceBasisSourceIds.length === 0) {
              local.error(`${label} configuration ${configuration?.id ?? index} requires issuer evidence for configuration differences`)
            } else {
              const sourceIds = new Set((sourceData.sources ?? []).map((source) => source?.id))
              if (!configuration.differenceBasisSourceIds.every((id) => sourceIds.has(id))) {
                local.error(`${label} configuration ${configuration?.id ?? index} difference basis must reference existing sources`)
              }
            }
          }
        }
        const productionConfigurations = sourceData.configurations.filter((configuration) => configuration?.status === 'production' && configuration?.selectable === true)
        if (sourceData.status === 'production' && productionConfigurations.length === 0) {
          local.error(`${label} production venue requires at least one production/selectable configuration`)
        }
        if (sourceData.status !== 'production' && productionConfigurations.length > 0) {
          local.error(`${label} non-production venue cannot contain a production/selectable configuration`)
        }
      }
    }
    if (sourceData.status === 'rejected') {
      validateString(sourceData.rejectionReason, `${label} rejectionReason`, local, { nonEmpty: true })
    } else if (sourceData.rejectionReason !== undefined) {
      validateString(sourceData.rejectionReason, `${label} rejectionReason`, local)
    }
    for (const message of local.errors) addError(file, message)
    for (const message of local.warnings) addWarning(file, message)

    if (typeof sourceData.id === 'string' && sourceData.id.trim()) {
      const previous = ids.get(sourceData.id)
      if (previous) addError(file, `${label} duplicate venue ID also used by ${previous}`)
      else ids.set(sourceData.id, file)
    }
    const locationKey = [sourceData.name, sourceData.prefecture, sourceData.city].map(normalizeSearchText).join('\0')
    if (!locationKey.startsWith('\0')) {
      const previous = locations.get(locationKey)
      if (previous) addError(file, `${label} duplicate normalized name and location also used by ${previous}`)
      else locations.set(locationKey, file)
    }
  }

  for (const { file, data } of sources) {
    const terms = [
      { value: data?.name, kind: 'name' },
      ...(Array.isArray(data?.aliases) ? data.aliases.map((value) => ({ value, kind: 'alias' })) : []),
    ]
    for (const term of terms) {
      const normalized = normalizeSearchText(term.value)
      if (!normalized) continue
      const previous = searchTerms.get(normalized)
      if (previous && previous.id !== data?.id) {
        addError(file, `${file}: normalized search term "${term.value}" collides with ${previous.file} (${previous.kind})`)
      } else if (!previous) {
        searchTerms.set(normalized, { id: data?.id, file, kind: term.kind })
      }
    }
  }

  return { errors: allIssues.errors, warnings: allIssues.warnings, byVenue, today: todayText }
}

export const assertValidSources = (sources, options) => {
  const result = validateSources(sources, options)
  if (result.errors.length) throw new Error(result.errors.join('\n'))
  return result
}

export const sourceFileLabel = (filePath) => path.basename(filePath)
