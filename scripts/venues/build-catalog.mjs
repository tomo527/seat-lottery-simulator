import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildOutputs, CATALOG_PATH, compactJsonText, DETAIL_DIR, jsonText, readSources } from './lib.mjs'

const { catalog, details } = buildOutputs(await readSources())
await mkdir(path.dirname(CATALOG_PATH), { recursive: true })
await mkdir(DETAIL_DIR, { recursive: true })
const expectedFiles = new Set([...details.keys()].map((id) => `${id}.json`))
for (const file of await readdir(DETAIL_DIR)) {
  if (file.endsWith('.json') && !expectedFiles.has(file)) await unlink(path.join(DETAIL_DIR, file))
}
await writeFile(CATALOG_PATH, jsonText(catalog), 'utf8')
for (const [id, detail] of details) await writeFile(path.join(DETAIL_DIR, `${id}.json`), compactJsonText(detail), 'utf8')
console.log(`Built catalog for ${catalog.length} production venues.`)
