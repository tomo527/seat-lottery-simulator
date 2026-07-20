import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { buildOutputs, CATALOG_PATH, compactJsonText, DETAIL_DIR, jsonText, readSources } from './lib.mjs'

const { catalog, details } = buildOutputs(await readSources())
const stale = []
const compare = async (file, expected) => {
  const actual = await readFile(file, 'utf8').catch(() => '')
  if (actual !== expected) stale.push(path.relative(process.cwd(), file))
}
await compare(CATALOG_PATH, jsonText(catalog))
for (const [id, detail] of details) await compare(path.join(DETAIL_DIR, `${id}.json`), compactJsonText(detail))
const expectedFiles = new Set([...details.keys()].map((id) => `${id}.json`))
for (const file of await readdir(DETAIL_DIR).catch(() => [])) {
  if (file.endsWith('.json') && !expectedFiles.has(file)) stale.push(path.relative(process.cwd(), path.join(DETAIL_DIR, file)))
}
if (stale.length) {
  console.error(`Venue database is stale. Run npm run venues:build:\n${stale.join('\n')}`)
  process.exitCode = 1
} else console.log(`Venue database is synchronized (${catalog.length} venues).`)
