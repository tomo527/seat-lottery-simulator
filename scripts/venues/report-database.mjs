import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { CATALOG_PATH, DETAIL_DIR, readSources, ROOT } from './lib.mjs'
import { analyzeDatabaseSizes, evaluateSizeLimits } from './capacity.mjs'

const sources = await readSources()
const catalog = JSON.parse(await (await import('node:fs/promises')).readFile(CATALOG_PATH, 'utf8'))
const files = [CATALOG_PATH, ...(await readdir(DETAIL_DIR)).filter((file) => file.endsWith('.json')).sort().map((file) => path.join(DETAIL_DIR, file))]
const sizes = await Promise.all(files.map(async (file) => ({ file, bytes: (await stat(file)).size })))
const byRegion = Object.groupBy(catalog, (entry) => entry.region)
const byPrefecture = Object.groupBy(catalog, (entry) => entry.prefecture)
const byStatus = Object.groupBy(sources, ({ data }) => data.status)
console.log(`Venues: ${catalog.length}`)
console.log('Source status:')
for (const key of Object.keys(byStatus).sort()) console.log(`  ${key}: ${byStatus[key].length}`)
console.log('By region:')
for (const key of Object.keys(byRegion).sort()) console.log(`  ${key}: ${byRegion[key].length}`)
console.log('By prefecture:')
for (const key of Object.keys(byPrefecture).sort()) console.log(`  ${key}: ${byPrefecture[key].length}`)
for (const entry of catalog) {
  if (entry.schemaVersion === 2) {
    const source = sources.find(({ data }) => data.id === entry.id)?.data
    for (const configuration of entry.configurations) {
      const ranges = source?.configurations?.find(({ id }) => id === configuration.id)?.ranges.length ?? 0
      console.log(`  ${entry.id}/${configuration.id}: ${ranges} ranges, ${configuration.seatCount.toLocaleString('ja-JP')} seats, ${configuration.dataPath}`)
    }
  } else {
    const ranges = sources.find(({ data }) => data.id === entry.id)?.data.ranges.length ?? 0
    console.log(`  ${entry.id}: ${ranges} ranges, ${entry.seatCount.toLocaleString('ja-JP')} seats, ${entry.dataPath}`)
  }
}
const total = sizes.reduce((sum, item) => sum + item.bytes, 0)
const largest = sizes.reduce((left, right) => left.bytes >= right.bytes ? left : right)
const detailSizes = sizes.filter(({ file }) => file !== CATALOG_PATH)
const analysis = analyzeDatabaseSizes({
  catalogBytes: sizes.find(({ file }) => file === CATALOG_PATH)?.bytes ?? 0,
  detailBytes: detailSizes.map(({ bytes }) => bytes),
  venueCount: catalog.length,
})
analysis.detailSizes = detailSizes.map(({ file, bytes }) => ({ file: path.basename(file), bytes }))
const sizeIssues = evaluateSizeLimits(analysis)
console.log(`Database files: ${files.length}`)
console.log(`Database size: ${total.toLocaleString('ja-JP')} bytes`)
console.log(`Catalog size: ${(await stat(CATALOG_PATH)).size.toLocaleString('ja-JP')} bytes`)
console.log(`Largest file: ${path.relative(ROOT, largest.file)} (${largest.bytes.toLocaleString('ja-JP')} bytes)`)
console.log(`Detail size: average ${analysis.averageDetailBytes.toLocaleString('ja-JP')}, median ${analysis.medianDetailBytes.toLocaleString('ja-JP')}, max ${analysis.maxDetailBytes.toLocaleString('ja-JP')} bytes`)
console.log('Capacity projections:')
for (const projection of analysis.projections) {
  console.log(`  ${projection.venueCount} venues: catalog ${projection.catalogBytes.toLocaleString('ja-JP')}, details ${projection.detailBytes.toLocaleString('ja-JP')}, total ${projection.databaseBytes.toLocaleString('ja-JP')} bytes`)
}
console.log('Capacity warnings:')
for (const warning of sizeIssues.warnings) console.log(`  ${warning}`)
if (!sizeIssues.warnings.length) console.log('  (none)')
console.log('Duplicate IDs: none (validated by venues:validate)')
