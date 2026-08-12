import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { regionForPrefecture } from './regions.mjs'
import { configurationRuntimeId, productionConfigurations } from './source-schema.mjs'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const SOURCE_DIR = path.join(ROOT, 'data/venue-sources')
export const CATALOG_PATH = path.join(ROOT, 'src/data/venue-db/catalog.generated.json')
export const DETAIL_DIR = path.join(ROOT, 'public/venue-db/venues')
export const INVENTORY_DIR = path.join(ROOT, 'data/venue-inventory')
export const BATCH_DIR = path.join(ROOT, 'data/venue-batches')

export const readSources = async (sourceDir = SOURCE_DIR) => {
  const files = (await readdir(sourceDir)).filter((file) => file.endsWith('.json')).sort()
  return Promise.all(files.map(async (file) => {
    try {
      return { file, data: JSON.parse(await readFile(path.join(sourceDir, file), 'utf8')) }
    } catch (error) {
      throw new Error(`${file}: invalid JSON: ${error.message}`, { cause: error })
    }
  }))
}

export const rangeSeatCount = (range) => range.to - range.from + 1 - new Set(range.excluded ?? []).size
export const calculateSeatCount = (ranges) => ranges.reduce((total, range) => total + rangeSeatCount(range), 0)
export const canonicalAreaId = (range) => range.areaId ?? 'main'

export const buildOutputs = (sources) => {
  const production = sources.filter(({ data }) => productionConfigurations(data).length > 0).sort((left, right) => left.data.id.localeCompare(right.data.id))
  const catalog = production.map(({ data }) => data.schemaVersion === 1 ? ({
    id: data.id,
    name: data.name,
    searchAliases: [...(data.aliases ?? [])].sort((a, b) => a.localeCompare(b, 'ja')),
    region: regionForPrefecture(data.prefecture),
    prefecture: data.prefecture,
    municipality: data.city,
    venueType: data.venueType,
    representativePatternName: data.representativePattern.name,
    seatCount: calculateSeatCount(data.ranges),
    dataPath: `/venue-db/venues/${data.id}.json`,
  }) : ({
    schemaVersion: 2,
    id: data.id,
    venueGroupId: data.id,
    name: data.name,
    searchAliases: [...(data.aliases ?? [])].sort((a, b) => a.localeCompare(b, 'ja')),
    region: regionForPrefecture(data.prefecture),
    prefecture: data.prefecture,
    municipality: data.city,
    venueType: data.venueType,
    configurations: productionConfigurations(data).map((configuration) => ({
      id: configuration.id,
      canonicalName: configuration.canonicalName,
      seatCount: calculateSeatCount(configuration.ranges),
      dataPath: `/venue-db/venues/${configurationRuntimeId(data.id, configuration.id)}.json`,
      scope: configuration.scope.kind,
      scopeDisclosure: configuration.scopeDisclosure,
      fixedOnly: configuration.scope.kind === 'fixed-only',
    })),
  }))
  const details = new Map(production.flatMap(({ data }) => {
    if (data.schemaVersion === 2) {
      return productionConfigurations(data).map((configuration) => {
        const areas = Object.fromEntries(configuration.ranges.filter((range) => range.areaId && range.areaLabel).map((range) => [range.areaId, range.areaLabel]))
        const ranges = configuration.ranges.map(({ areaLabel: _areaLabel, ...range }) => range)
        return [configurationRuntimeId(data.id, configuration.id), {
          schemaVersion: 2,
          venueId: data.id,
          venueGroupId: data.id,
          configurationId: configuration.id,
          configurationName: configuration.canonicalName,
          scope: configuration.scope.kind,
          scopeDisclosure: configuration.scopeDisclosure,
          ...(Object.keys(areas).length ? { areas } : {}),
          ranges,
          totalSeatCount: calculateSeatCount(configuration.ranges),
        }]
      })
    }
    const areas = Object.fromEntries(data.ranges.filter((range) => range.areaId && range.areaLabel).map((range) => [range.areaId, range.areaLabel]))
    const ranges = data.ranges.map(({ areaLabel: _areaLabel, ...range }) => range)
    return [[data.id, {
      schemaVersion: 1,
      venueId: data.id,
      patternId: data.representativePattern.id,
      ...(Object.keys(areas).length ? { areas } : {}),
      ranges,
      totalSeatCount: calculateSeatCount(data.ranges),
    }]]
  }))
  return { catalog, details }
}

export const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`
export const compactJsonText = (value) => `${JSON.stringify(value)}\n`
export const exists = async (file) => access(file).then(() => true, () => false)
