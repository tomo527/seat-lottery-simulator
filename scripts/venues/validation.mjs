import path from 'node:path'
import {
  INDEPENDENT_VERIFICATION_METHOD,
  LEGACY_PRODUCTION_IDS,
  LEGACY_VERIFICATION_METHOD,
  PATTERN_COVERAGES,
  SOURCE_ROLES,
  SOURCE_STATUSES,
  SUPPORTED_SCHEMA_VERSIONS,
  VENUE_TYPES,
  VERIFICATION_RESULTS,
  VERIFICATION_STATUSES,
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
  if (data.status === 'production' && !(Number.isSafeInteger(pattern.expectedSeatCount) && pattern.expectedSeatCount > 0)) {
    issues.error(`${label} production expectedSeatCount must be a positive safe integer`)
  }
  validateStringArray(pattern.notIncludedPatterns, `${label} representativePattern.notIncludedPatterns`, issues, { nonEmpty: true })
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
    range.from <= 0 ||
    range.to < range.from ||
    !Array.isArray(range.excluded ?? [])
  ) return undefined
  const excluded = range.excluded ?? []
  if (excluded.some((number) => !Number.isSafeInteger(number) || number <= 0 || number < range.from || number > range.to)) return undefined
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
    if (Number.isSafeInteger(range.from) && range.from <= 0) issues.error(`${prefix} from must be positive`)
    if (Number.isSafeInteger(range.to) && range.to <= 0) issues.error(`${prefix} to must be positive`)
    if (Number.isSafeInteger(range.from) && Number.isSafeInteger(range.to) && range.from > range.to) {
      issues.error(`${prefix} has from > to`)
    }

    const excluded = range.excluded ?? []
    if (!Array.isArray(excluded)) issues.error(`${prefix} excluded must be an array`)
    else {
      const seenExcluded = new Set()
      for (const number of excluded) {
        if (!Number.isSafeInteger(number) || number <= 0) issues.error(`${prefix} excluded must contain safe positive integers`)
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
    add(!Number.isSafeInteger(pattern.expectedSeatCount) || pattern.expectedSeatCount < 1, 'expectedSeatCount must be a positive safe integer')
    add(typeof pattern.selectionReason !== 'string' || !pattern.selectionReason.trim(), 'selectionReason is missing')
    add(!Array.isArray(pattern.notIncludedPatterns), 'notIncludedPatterns must be an array')
    if (Number.isSafeInteger(pattern.expectedSeatCount) && Array.isArray(data?.ranges)) {
      const counts = data.ranges.map(validRangeSeatCount)
      const calculated = counts.every((count) => count !== undefined) ? counts.reduce((sum, count) => sum + count, 0) : undefined
      add(calculated === undefined, 'seat count cannot be calculated until all ranges are valid')
      add(calculated !== undefined && calculated !== pattern.expectedSeatCount, `expectedSeatCount ${pattern.expectedSeatCount} does not match calculated ${calculated}`)
      add(calculated !== undefined && calculated < 1, 'at least one selectable seat is required')
    }
  }
  add(typeof data?.registeredScope !== 'string' || !data.registeredScope.trim(), 'registeredScope is missing')
  add(typeof data?.completenessBasis !== 'string' || !data.completenessBasis.trim(), 'completenessBasis is missing')
  add(typeof data?.transformation !== 'string' || !data.transformation.trim(), 'transformation is missing')
  add(!Array.isArray(data?.knownLimitations), 'knownLimitations must be an array')

  const officialSources = Array.isArray(data?.sources) ? data.sources.filter((source) => source?.official === true) : []
  add(officialSources.length === 0, 'at least one official source is required')
  add(!officialSources.some((source) => source?.roles?.includes('seat-structure')), 'an official seat-structure source is required')
  add(!officialSources.some((source) => source?.roles?.includes('seat-count')), 'an official seat-count source is required')

  const verification = data?.verification
  add(!isPlainObject(verification), 'verification must be an object')
  if (isPlainObject(verification)) {
    add(verification.status !== 'verified', 'verification.status must be verified')
    add(!parseDate(verification.checkedAt), 'verification.checkedAt must be a valid YYYY-MM-DD date')
    const allowedMethod =
      verification.method === INDEPENDENT_VERIFICATION_METHOD ||
      (verification.method === LEGACY_VERIFICATION_METHOD && LEGACY_PRODUCTION_IDS.has(data?.id))
    add(!allowedMethod, 'verification.method must record an independent official-source review')
    add(verification.seatStructure !== 'matched', 'verification.seatStructure must be matched')
    add(verification.seatCount !== 'matched', 'verification.seatCount must be matched')
    add(!Array.isArray(verification.unresolvedIssues), 'verification.unresolvedIssues must be an array')
    add(Array.isArray(verification.unresolvedIssues) && verification.unresolvedIssues.length > 0, 'verification has unresolved issues')
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
    validateRepresentativePattern(sourceData, label, local)
    validateSourceMetadata(sourceData, label, today, local)
    validateString(sourceData.registeredScope, `${label} registeredScope`, local)
    validateString(sourceData.completenessBasis, `${label} completenessBasis`, local)
    validateString(sourceData.transformation, `${label} transformation`, local)
    validateStringArray(sourceData.knownLimitations, `${label} knownLimitations`, local, { nonEmpty: true })
    validateVerification(sourceData, label, today, local)
    const calculated = validateRanges(sourceData, label, local)
    if (sourceData.status === 'rejected') {
      validateString(sourceData.rejectionReason, `${label} rejectionReason`, local, { nonEmpty: true })
    } else if (sourceData.rejectionReason !== undefined) {
      validateString(sourceData.rejectionReason, `${label} rejectionReason`, local)
    }
    if (sourceData.status === 'production') {
      for (const blocker of productionGateIssues(sourceData, label)) local.error(blocker)
      if (Number.isSafeInteger(sourceData.representativePattern?.expectedSeatCount) &&
          calculated !== sourceData.representativePattern.expectedSeatCount) {
        local.error(`${label} expected ${sourceData.representativePattern.expectedSeatCount}, calculated ${calculated}`)
      }
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
