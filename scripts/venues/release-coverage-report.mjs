import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from './cli.mjs'
import { readInventories } from './inventory.mjs'
import { ROOT, readSources } from './lib.mjs'

const formalHoldStatuses = new Set(['blocked', 'rejected', 'independent-review-mismatch'])
const canonicalString = (value) => typeof value === 'string' && value.trim() === value && value.length > 0
const percentage = (numerator, denominator) => denominator ? ((numerator / denominator) * 100).toFixed(1) + '%' : '0.0%'
const requirements = new Map([
  ['神奈川県', 6], ['千葉県', 6], ['埼玉県', 6], ['茨城県', 2], ['栃木県', 2], ['群馬県', 2],
  ['札幌市', 3], ['仙台市', 3], ['名古屋市', 3], ['京都市', 3], ['大阪市', 3], ['神戸市', 3], ['広島市', 3], ['福岡市', 3],
])

const args = parseArgs(process.argv.slice(2), new Map([['manifest', 'value']]))
const manifestPath = path.resolve(ROOT, args.manifest ?? 'data/venue-release-targets/release-seed-v1.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
if (!manifest || manifest.releaseTargetVersion !== 1 || !Array.isArray(manifest.targets)) {
  throw new Error('Release target manifest must be version 1 with a targets array.')
}

const errors = []
const ids = new Set()
for (const [index, target] of manifest.targets.entries()) {
  const prefix = 'target ' + index
  for (const field of ['venueId', 'name', 'prefecture', 'city', 'region', 'priority', 'reason', 'inventoryId', 'batchId', 'currentStatus']) {
    if (!canonicalString(target?.[field])) errors.push(prefix + '.' + field + ' must be a canonical non-empty string')
  }
  if (!['A', 'B', 'C'].includes(target?.priority)) errors.push(prefix + '.priority must be A, B, or C')
  if (typeof target?.releaseCritical !== 'boolean') errors.push(prefix + '.releaseCritical must be boolean')
  if (ids.has(target?.venueId)) errors.push(prefix + '.venueId duplicates ' + target.venueId)
  ids.add(target?.venueId)
}
if (errors.length) throw new Error(errors.join('\n'))

const inventories = await readInventories()
const inventoryById = new Map(inventories.flatMap(({ data }) => (data.venues ?? []).map((venue) => [venue.inventoryId, venue])))
const sourceById = new Map((await readSources()).map(({ data }) => [data.id, data]))
const groups = new Map()
const totals = { target: 0, assessed: 0, production: 0, formalHold: 0, notStarted: 0, priorityA: 0, priorityAAssessed: 0 }
const cityGroups = new Set(['札幌市', '仙台市', '名古屋市', '京都市', '大阪市', '神戸市', '広島市', '福岡市'])

for (const target of manifest.targets) {
  const inventory = inventoryById.get(target.inventoryId)
  const source = sourceById.get(target.venueId)
  const key = cityGroups.has(target.city) ? target.city : target.prefecture
  const group = groups.get(key) ?? { target: 0, assessed: 0, production: 0, formalHold: 0, notStarted: 0 }
  const research = inventory?.researchStatus ?? 'not-started'
  const assessed = research !== 'not-started' && Boolean(inventory) && Boolean(source)
  const production = research === 'production' && source?.status === 'production'
  const formalHold = formalHoldStatuses.has(research)
  group.target += 1
  group.assessed += Number(assessed)
  group.production += Number(production)
  group.formalHold += Number(formalHold)
  group.notStarted += Number(research === 'not-started')
  totals.target += 1
  totals.assessed += Number(assessed)
  totals.production += Number(production)
  totals.formalHold += Number(formalHold)
  totals.notStarted += Number(research === 'not-started')
  if (target.priority === 'A') {
    totals.priorityA += 1
    totals.priorityAAssessed += Number(assessed)
  }
  groups.set(key, group)
}

const unmet = [...groups].filter(([key, group]) => group.production < (requirements.get(key) ?? 0))
const unassessedPriorityA = manifest.targets.filter((target) => {
  if (target.priority !== 'A') return false
  const inventory = inventoryById.get(target.inventoryId)
  return !inventory || inventory.researchStatus === 'not-started' || !sourceById.has(target.venueId)
})
const releaseReady = !unmet.length && !unassessedPriorityA.length

console.log('Manifest: ' + path.relative(ROOT, manifestPath))
console.log('targetCount: ' + totals.target)
console.log('assessedCount: ' + totals.assessed)
console.log('productionCount: ' + totals.production)
console.log('formalHoldCount: ' + totals.formalHold)
console.log('notStartedCount: ' + totals.notStarted)
console.log('assessmentCoverage: ' + percentage(totals.assessed, totals.target))
console.log('productionCoverage: ' + percentage(totals.production, totals.target))
console.log('priorityACoverage: ' + percentage(totals.priorityAAssessed, totals.priorityA))
console.log('Regions:')
for (const [key, group] of [...groups].sort(([left], [right]) => left.localeCompare(right, 'ja'))) {
  const requirement = requirements.get(key) ?? 0
  console.log('  ' + key + ': target=' + group.target + ', assessed=' + group.assessed + ', production=' + group.production + ', formalHold=' + group.formalHold + ', notStarted=' + group.notStarted + ', releaseRequirement=' + requirement + ', shortfall=' + Math.max(0, requirement - group.production))
}
console.log('RELEASE READY: ' + (releaseReady ? 'yes' : 'no'))
console.log('Unmet regions: ' + (unmet.length ? unmet.map(([key]) => key).join(', ') : '(none)'))
console.log('Unassessed Priority A: ' + (unassessedPriorityA.length ? unassessedPriorityA.map((target) => target.name).join(', ') : '(none)'))
