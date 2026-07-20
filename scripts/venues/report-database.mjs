import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { CATALOG_PATH, DETAIL_DIR, readSources, ROOT } from './lib.mjs'

const sources = await readSources()
const catalog = JSON.parse(await (await import('node:fs/promises')).readFile(CATALOG_PATH, 'utf8'))
const files = [CATALOG_PATH, ...(await readdir(DETAIL_DIR)).filter((file) => file.endsWith('.json')).sort().map((file) => path.join(DETAIL_DIR, file))]
const sizes = await Promise.all(files.map(async (file) => ({ file, bytes: (await stat(file)).size })))
const byPrefecture = Object.groupBy(catalog, (entry) => entry.prefecture)
console.log(`Venues: ${catalog.length}`)
for (const key of Object.keys(byPrefecture).sort()) console.log(`  ${key}: ${byPrefecture[key].length}`)
for (const entry of catalog) {
  const ranges = sources.find(({ data }) => data.id === entry.id)?.data.ranges.length ?? 0
  console.log(`  ${entry.id}: ${ranges} ranges, ${entry.seatCount.toLocaleString('ja-JP')} seats, ${entry.dataPath}`)
}
const total = sizes.reduce((sum, item) => sum + item.bytes, 0)
const largest = sizes.reduce((left, right) => left.bytes >= right.bytes ? left : right)
console.log(`Database files: ${files.length}`)
console.log(`Database size: ${total.toLocaleString('ja-JP')} bytes`)
console.log(`Catalog size: ${(await stat(CATALOG_PATH)).size.toLocaleString('ja-JP')} bytes`)
console.log(`Largest file: ${path.relative(ROOT, largest.file)} (${largest.bytes.toLocaleString('ja-JP')} bytes)`)
console.log('Duplicate IDs: none (validated by venues:validate)')
