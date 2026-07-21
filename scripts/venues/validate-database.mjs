import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { buildOutputs, calculateSeatCount, CATALOG_PATH, DETAIL_DIR, exists, readSources } from './lib.mjs'
import { regionForPrefecture } from './regions.mjs'

const errors = []
const sources = await readSources()
const ids = new Set()
const locations = new Set()
const searchAliasOwners = new Map()
const normalizeSearchText = (value) => value.normalize('NFKC').trim().toLocaleLowerCase('ja-JP')

for (const { file, data } of sources) {
  const label = `${file}:`
  if (ids.has(data.id)) errors.push(`${label} duplicate venue ID ${data.id}`)
  ids.add(data.id)
  const locationKey = `${data.name}\0${data.prefecture}\0${data.city}`
  if (locations.has(locationKey)) errors.push(`${label} duplicate name and location`)
  locations.add(locationKey)
  if (data.status !== 'production') continue
  if (data.schemaVersion !== 1) errors.push(`${label} unsupported schemaVersion`)
  if (!data.city?.trim()) errors.push(`${label} municipality is missing`)
  if (!regionForPrefecture(data.prefecture)) errors.push(`${label} prefecture ${data.prefecture} has no region mapping`)
  if (!data.sources?.length || data.sources.some((source) => !source.url?.startsWith('https://') || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt ?? ''))) errors.push(`${label} production source metadata is missing or invalid`)
  const normalizedName = normalizeSearchText(data.name ?? '')
  const normalizedAliases = (data.aliases ?? []).map(normalizeSearchText)
  if (normalizedAliases.some((alias) => !alias)) errors.push(`${label} has an empty search alias`)
  if (new Set(normalizedAliases).size !== normalizedAliases.length) errors.push(`${label} has duplicate search aliases`)
  if (normalizedAliases.includes(normalizedName)) errors.push(`${label} search alias duplicates the venue name`)
  for (const alias of normalizedAliases) {
    const existingOwner = searchAliasOwners.get(alias)
    if (existingOwner) errors.push(`${label} search alias duplicates ${existingOwner}`)
    else searchAliasOwners.set(alias, data.id)
  }
  if (Array.isArray(data.representativePattern)) errors.push(`${label} multiple representative patterns are forbidden`)
  if (data.representativePattern?.coverage !== 'complete') errors.push(`${label} representative pattern is not complete`)
  const productionIdentity = [data.id, data.name, data.representativePattern?.name, data.representativePattern?.coverage, data.registeredScope].join(' ').toLowerCase()
  if (/(?:^|[-_\s])(demo|sample|partial)(?:$|[-_\s])|一部/.test(productionIdentity)) errors.push(`${label} demo/sample/partial production data is forbidden`)
  if (!Array.isArray(data.ranges) || data.ranges.length === 0) errors.push(`${label} has no seat ranges`)
  const seats = new Set()
  for (const [index, range] of (data.ranges ?? []).entries()) {
    const prefix = `${label} range ${index}`
    if (![range.from, range.to].every(Number.isSafeInteger)) errors.push(`${prefix} uses a non-safe integer`)
    if (range.from <= 0 || range.to <= 0) errors.push(`${prefix} uses a non-positive number`)
    if (range.from > range.to) errors.push(`${prefix} has from > to`)
    const excluded = range.excluded ?? []
    if (new Set(excluded).size !== excluded.length) errors.push(`${prefix} has duplicate exclusions`)
    if (excluded.some((number) => !Number.isSafeInteger(number) || number < range.from || number > range.to)) errors.push(`${prefix} has an out-of-range exclusion`)
    const excludedSet = new Set(excluded)
    for (let number = range.from; number <= range.to; number += 1) {
      if (excludedSet.has(number)) continue
      const key = `${range.areaId ?? ''}\0${range.rowLabel}\0${number}`
      if (seats.has(key)) errors.push(`${prefix} duplicates seat ${key.replaceAll('\0', '/')}`)
      seats.add(key)
    }
  }
  const calculated = calculateSeatCount(data.ranges ?? [])
  if (calculated <= 0) errors.push(`${label} has no selectable seats`)
  if (calculated !== data.representativePattern?.expectedSeatCount) errors.push(`${label} expected ${data.representativePattern?.expectedSeatCount}, calculated ${calculated}`)
}

const tokyoCount = sources.filter(({ data }) => data.status === 'production' && data.prefecture === '東京都').length
if (tokyoCount < 10) errors.push(`Tokyo production venue count is ${tokyoCount}; at least 10 are required`)
const { catalog, details } = buildOutputs(sources)
for (const entry of catalog) {
  const detail = details.get(entry.id)
  if (!entry.region || entry.region !== regionForPrefecture(entry.prefecture)) errors.push(`${entry.id}: catalog region is invalid`)
  if (!entry.municipality?.trim()) errors.push(`${entry.id}: catalog municipality is missing`)
  if (!detail || detail.totalSeatCount !== entry.seatCount) errors.push(`${entry.id}: catalog/detail count mismatch`)
  if (!(await exists(path.join(DETAIL_DIR, `${entry.id}.json`)))) errors.push(`${entry.id}: generated detail file is missing`)
}

const catalogSize = (await stat(CATALOG_PATH)).size
if (catalogSize >= 100_000) errors.push(`catalog is ${catalogSize} bytes; limit is under 100,000 bytes`)
const detailFiles = (await readdir(DETAIL_DIR)).filter((file) => file.endsWith('.json'))
let databaseSize = catalogSize
for (const file of detailFiles) {
  const size = (await stat(path.join(DETAIL_DIR, file))).size
  databaseSize += size
  if (size >= 300_000) errors.push(`${file}: ${size} bytes; detail limit is under 300,000 bytes`)
}
if (databaseSize >= 2_000_000) errors.push(`generated database is ${databaseSize} bytes; limit is under 2,000,000 bytes`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Validated ${catalog.length} venues (${tokyoCount} Tokyo) and ${catalog.reduce((sum, item) => sum + item.seatCount, 0).toLocaleString('ja-JP')} seats.`)
}
