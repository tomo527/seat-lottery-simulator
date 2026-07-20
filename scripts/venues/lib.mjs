import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const SOURCE_DIR = path.join(ROOT, 'data/venue-sources')
export const CATALOG_PATH = path.join(ROOT, 'src/data/venue-db/catalog.generated.json')
export const DETAIL_DIR = path.join(ROOT, 'public/venue-db/venues')

export const readSources = async () => {
  const files = (await readdir(SOURCE_DIR)).filter((file) => file.endsWith('.json')).sort()
  return Promise.all(files.map(async (file) => ({ file, data: JSON.parse(await readFile(path.join(SOURCE_DIR, file), 'utf8')) })))
}

export const rangeSeatCount = (range) => range.to - range.from + 1 - new Set(range.excluded ?? []).size
export const calculateSeatCount = (ranges) => ranges.reduce((total, range) => total + rangeSeatCount(range), 0)

export const buildOutputs = (sources) => {
  const production = sources.filter(({ data }) => data.status === 'production').sort((left, right) => left.data.id.localeCompare(right.data.id))
  const catalog = production.map(({ data }) => ({
    id: data.id,
    name: data.name,
    prefecture: data.prefecture,
    city: data.city,
    aliases: [...data.aliases].sort((a, b) => a.localeCompare(b, 'ja')),
    venueType: data.venueType,
    representativePatternName: data.representativePattern.name,
    seatCount: calculateSeatCount(data.ranges),
    dataPath: `/venue-db/venues/${data.id}.json`,
  }))
  const details = new Map(production.map(({ data }) => {
    const areas = Object.fromEntries(data.ranges.filter((range) => range.areaId && range.areaLabel).map((range) => [range.areaId, range.areaLabel]))
    const ranges = data.ranges.map(({ areaLabel: _areaLabel, ...range }) => range)
    return [data.id, {
      schemaVersion: 1,
      venueId: data.id,
      patternId: data.representativePattern.id,
      ...(Object.keys(areas).length ? { areas } : {}),
      ranges,
      totalSeatCount: calculateSeatCount(data.ranges),
    }]
  }))
  return { catalog, details }
}

export const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`
export const compactJsonText = (value) => `${JSON.stringify(value)}\n`
export const exists = async (file) => access(file).then(() => true, () => false)
