import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from './cli.mjs'
import { readInventories } from './inventory.mjs'
import { ROOT, readSources } from './lib.mjs'

const formalHoldStatuses = new Set(['blocked', 'rejected', 'independent-review-mismatch'])
const formalHoldManifestStatuses = new Set(['source-hold', 'policy-hold', 'contradiction', 'independent-review-mismatch'])
const preflightManifestStatuses = new Set([
  'preflight-complete',
  'production',
  'source-hold',
  'policy-hold',
  'contradiction',
  'independent-review-mismatch',
])
const decisionManifestStatuses = new Set([
  'production',
  'source-hold',
  'policy-hold',
  'contradiction',
  'independent-review-mismatch',
])
const manifestStatuses = new Set(['registered', 'source-located', ...preflightManifestStatuses])
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
  if (!manifestStatuses.has(target?.currentStatus)) errors.push(prefix + '.currentStatus has an unsupported release status')
  if (typeof target?.releaseCritical !== 'boolean') errors.push(prefix + '.releaseCritical must be boolean')
  if (ids.has(target?.venueId)) errors.push(prefix + '.venueId duplicates ' + target.venueId)
  ids.add(target?.venueId)
}
if (errors.length) throw new Error(errors.join('\n'))

const coveragePath = manifest.coverageUniverse?.file ? path.resolve(ROOT, manifest.coverageUniverse.file) : null
const coverage = coveragePath ? JSON.parse(await readFile(coveragePath, 'utf8')) : null
if (coverage && !Array.isArray(coverage.candidates)) {
  throw new Error('Coverage universe must contain a candidates array.')
}

const inventories = await readInventories()
const inventoryById = new Map(inventories.flatMap(({ data }) => (data.venues ?? []).map((venue) => [venue.inventoryId, venue])))
const sourceById = new Map((await readSources()).map(({ data }) => [data.id, data]))
const groups = new Map()
const totals = {
  target: 0,
  registered: 0,
  sourceLocated: 0,
  preflightComplete: 0,
  decisionComplete: 0,
  production: 0,
  formalHold: 0,
  notStarted: 0,
  priorityA: 0,
  priorityASourceLocated: 0,
  priorityAPreflightComplete: 0,
  priorityADecisionComplete: 0,
  priorityAProduction: 0,
}
const cityGroups = new Set(['札幌市', '仙台市', '名古屋市', '京都市', '大阪市', '神戸市', '広島市', '福岡市'])

for (const target of manifest.targets) {
  const inventory = inventoryById.get(target.inventoryId)
  const source = sourceById.get(target.venueId)
  const key = cityGroups.has(target.city) ? target.city : target.prefecture
  const group = groups.get(key) ?? { target: 0, registered: 0, sourceLocated: 0, preflightComplete: 0, decisionComplete: 0, production: 0, formalHold: 0, notStarted: 0 }
  const research = inventory?.researchStatus ?? 'not-started'
  const status = target.currentStatus
  const registered = Boolean(inventory) && Boolean(source)
  const sourceLocated = registered && research !== 'not-started' && status !== 'registered'
  const preflightComplete = preflightManifestStatuses.has(status)
  const decisionComplete = decisionManifestStatuses.has(status)
  const production = status === 'production' && research === 'production' && source?.status === 'production'
  const formalHold = formalHoldManifestStatuses.has(status) || formalHoldStatuses.has(research)
  group.target += 1
  group.registered += Number(registered)
  group.sourceLocated += Number(sourceLocated)
  group.preflightComplete += Number(preflightComplete)
  group.decisionComplete += Number(decisionComplete)
  group.production += Number(production)
  group.formalHold += Number(formalHold)
  group.notStarted += Number(status === 'registered' || research === 'not-started')
  totals.target += 1
  totals.registered += Number(registered)
  totals.sourceLocated += Number(sourceLocated)
  totals.preflightComplete += Number(preflightComplete)
  totals.decisionComplete += Number(decisionComplete)
  totals.production += Number(production)
  totals.formalHold += Number(formalHold)
  totals.notStarted += Number(status === 'registered' || research === 'not-started')
  if (target.priority === 'A') {
    totals.priorityA += 1
    totals.priorityASourceLocated += Number(sourceLocated)
    totals.priorityAPreflightComplete += Number(preflightComplete)
    totals.priorityADecisionComplete += Number(decisionComplete)
    totals.priorityAProduction += Number(production)
  }
  groups.set(key, group)
}

const unmet = [...groups].filter(([key, group]) => group.production < (requirements.get(key) ?? 0))
const unassessedPriorityA = manifest.targets.filter((target) => {
  if (target.priority !== 'A') return false
  return !preflightManifestStatuses.has(target.currentStatus)
})
const legacyReleaseReady = !unmet.length && !unassessedPriorityA.length
const coverageReady = coverage ? coverage.releaseGate?.releaseReady === true : true
const releaseReady = legacyReleaseReady && coverageReady

console.log('Manifest: ' + path.relative(ROOT, manifestPath))
console.log('targetCount: ' + totals.target)
console.log('registeredCount: ' + totals.registered)
console.log('sourceLocatedCount: ' + totals.sourceLocated)
console.log('preflightCompleteCount: ' + totals.preflightComplete)
console.log('decisionCompleteCount: ' + totals.decisionComplete)
console.log('productionCount: ' + totals.production)
console.log('formalHoldCount: ' + totals.formalHold)
console.log('notStartedCount: ' + totals.notStarted)
console.log('sourceCoverage: ' + percentage(totals.sourceLocated, totals.target))
console.log('preflightCoverage: ' + percentage(totals.preflightComplete, totals.target))
console.log('decisionCoverage: ' + percentage(totals.decisionComplete, totals.target))
console.log('assessmentCoverage: ' + percentage(totals.decisionComplete, totals.target))
console.log('productionCoverage: ' + percentage(totals.production, totals.target))
console.log('priorityASourceCoverage: ' + percentage(totals.priorityASourceLocated, totals.priorityA))
console.log('priorityAPreflightCoverage: ' + percentage(totals.priorityAPreflightComplete, totals.priorityA))
console.log('priorityADecisionCoverage: ' + percentage(totals.priorityADecisionComplete, totals.priorityA))
console.log('priorityAProductionCoverage: ' + percentage(totals.priorityAProduction, totals.priorityA))
console.log('Regions:')
for (const [key, group] of [...groups].sort(([left], [right]) => left.localeCompare(right, 'ja'))) {
  const requirement = requirements.get(key) ?? 0
  console.log('  ' + key + ': target=' + group.target + ', sourceLocated=' + group.sourceLocated + ', preflightComplete=' + group.preflightComplete + ', decisionComplete=' + group.decisionComplete + ', production=' + group.production + ', formalHold=' + group.formalHold + ', notStarted=' + group.notStarted + ', releaseRequirement=' + requirement + ', shortfall=' + Math.max(0, requirement - group.production))
}
console.log('Unmet regions: ' + (unmet.length ? unmet.map(([key]) => key).join(', ') : '(none)'))
console.log('Unassessed Priority A: ' + (unassessedPriorityA.length ? unassessedPriorityA.map((target) => target.name).join(', ') : '(none)'))
if (coverage) {
  const candidates = coverage.candidates
  const byTier = (tier) => candidates.filter((candidate) => candidate.tier === tier)
  const dispositioned = (items) => items.filter((candidate) => candidate.inventoryState !== '未調査').length
  const production = (items) => items.filter((candidate) => candidate.inventoryState === 'PRODUCTION').length
  const addressableIds = new Set([
    ...candidates.filter((candidate) => candidate.inventoryState === 'PRODUCTION').map((candidate) => candidate.id),
    ...(coverage.coverageMetrics?.schemaAddressableCoverage?.confirmedCurrentSchemaNonProductionIds ?? []),
    ...(coverage.coverageMetrics?.schemaAddressableCoverage?.confirmedSchemaExtensionNonProductionIds ?? []),
  ])
  const addressable = (items) => items.filter((candidate) => addressableIds.has(candidate.id)).length
  console.log('Tokyo coverage contract: ' + path.relative(ROOT, coveragePath))
  for (const [label, items] of [['Tokyo universe', candidates], ['MUST', byTier('MUST')], ['SHOULD', byTier('SHOULD')], ['OPTIONAL', byTier('OPTIONAL')]]) {
    console.log(`  ${label}: researchCompleteness=${percentage(dispositioned(items), items.length)}, userVisibleProductionCoverage=${percentage(production(items), items.length)}, schemaAddressableCoverage=${percentage(addressable(items), items.length)}`)
  }
  const classes = coverage.mustNonProductionBlockerAudit?.classes ?? {}
  console.log('  MUST nonproduction blockers: ' + [
    `A=${classes.A_SCHEMA_UNLOCKABLE?.count ?? 0}`,
    `B=${classes.B_SOURCE_LIMITED?.count ?? 0}`,
    `C=${classes.C_CONTRADICTION?.count ?? 0}`,
    `D=${classes.D_CURRENTNESS_CLOSED?.count ?? 0}`,
  ].join(', '))
  console.log('  Addressable production conversion: MUST=' + percentage(production(byTier('MUST')), addressable(byTier('MUST'))) + ', SHOULD=' + percentage(production(byTier('SHOULD')), addressable(byTier('SHOULD'))))
  console.log('  Coverage contract ready: ' + (coverage.releaseGate?.releaseReady === true ? 'yes' : 'no'))
}
console.log('Legacy regional gate ready: ' + (legacyReleaseReady ? 'yes' : 'no'))
console.log('RELEASE READY: ' + (releaseReady ? 'yes' : 'no'))
