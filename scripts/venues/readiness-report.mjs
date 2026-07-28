import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from './cli.mjs'
import { SOURCE_DIR, readSources } from './lib.mjs'

const REPORT_PATH = path.resolve('data/venue-readiness/tokyo-wave-1.json')
const READINESS = new Set(['R1', 'R2', 'R3', 'R4', 'R5'])

const calculatedSeatCount = (ranges) => (Array.isArray(ranges) ? ranges : []).reduce((total, range) => {
  if (!range || !Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from > range.to) return total
  return total + range.to - range.from + 1 - (Array.isArray(range.excluded) ? range.excluded.length : 0)
}, 0)

export const readinessReport = async (options = {}) => {
  const report = JSON.parse(await readFile(options.reportPath ?? REPORT_PATH, 'utf8'))
  const sources = options.sources ?? await readSources(options.sourceDir ?? SOURCE_DIR)
  const byId = new Map(sources.map(({ data }) => [data?.id, data]))
  const errors = []
  const seen = new Set()
  const lines = [
    `Readiness report: ${report.scope}`,
    `Baseline date: ${report.baselineDate}`,
    `Venues: ${report.venues.length}`,
    'venue ID | 会場名 | readiness | range進捗 | calculated | expected | 第2パス | 阻害要因 | 次の具体作業',
  ]
  for (const item of report.venues) {
    const source = byId.get(item.venueId)
    if (seen.has(item.venueId)) errors.push(`duplicate readiness venueId: ${item.venueId}`)
    seen.add(item.venueId)
    if (!source) errors.push(`missing source for readiness venueId: ${item.venueId}`)
    if (!READINESS.has(item.readiness)) errors.push(`unknown readiness ${item.readiness}: ${item.venueId}`)
    if (typeof item.nextAction !== 'string' || !item.nextAction.trim()) errors.push(`nextAction is required: ${item.venueId}`)
    const ranges = Array.isArray(source?.ranges) ? source.ranges.length : 0
    const calculated = calculatedSeatCount(source?.ranges)
    const expected = source?.representativePattern?.expectedSeatCount ?? 'null'
    lines.push([
      item.venueId,
      source?.name ?? '(missing)',
      item.readiness,
      `${ranges} ranges`,
      calculated,
      expected,
      item.secondPass,
      item.blocker || '(none)',
      item.nextAction,
    ].join(' | '))
  }
  const counts = new Map()
  for (const item of report.venues) counts.set(item.readiness, (counts.get(item.readiness) ?? 0) + 1)
  lines.splice(3, 0, `Summary: ${[...READINESS].map((key) => `${key}=${counts.get(key) ?? 0}`).join(', ')}`)
  if (report.venues.length !== 30) errors.push(`readiness report must contain the baseline 30 venues; found ${report.venues.length}`)
  lines.push('Validation errors:', ...(errors.length ? errors.map((error) => `  ${error}`) : ['  (none)']))
  return { text: lines.join('\n'), errors }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    parseArgs(process.argv.slice(2), new Map())
    const result = await readinessReport()
    console.log(result.text)
    if (result.errors.length) process.exitCode = 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
