import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildOutputs, canonicalAreaId } from './lib.mjs'
import { createVenueSource } from './new-venue.mjs'
import { reviewVenues } from './review-venue.mjs'
import { dateInTokyo, productionGateIssues, validateSources } from './validation.mjs'

const TODAY = '2026-07-24'
const temporaryDirectories = []
const source = (overrides = {}) => ({
  schemaVersion: 1,
  status: 'production',
  id: 'test-hall-standard',
  name: 'Test Hall',
  prefecture: '東京都',
  city: '渋谷区',
  aliases: ['テストホール'],
  venueType: 'hall',
  representativePattern: {
    id: 'standard',
    name: '通常座席',
    coverage: 'complete',
    expectedSeatCount: 3,
    selectionReason: '公式の標準座席表を採用。',
    notIncludedPatterns: [],
  },
  sources: [{
    id: 'official-seat-map',
    official: true,
    roles: ['seat-structure', 'seat-count'],
    publisher: '施設運営者',
    title: '座席表',
    url: 'https://example.com/seats',
    checkedAt: TODAY,
  }],
  registeredScope: '標準座席表の全席。',
  completenessBasis: '公式座席表と総席数を照合。',
  transformation: '連続番号をrangeへ転記。',
  knownLimitations: [],
  verification: {
    status: 'verified',
    checkedAt: TODAY,
    method: 'independent-official-source-review',
    seatStructure: 'matched',
    seatCount: 'matched',
    unresolvedIssues: [],
  },
  ranges: [{ areaId: 'main', areaLabel: 'メイン', rowLabel: 'A', from: 1, to: 3 }],
  ...overrides,
})
const configurationV2 = (overrides = {}) => ({
  id: 'standard',
  canonicalName: '通常配置',
  issuerDefinedCondition: '施設運営者が通常配置として公開した座席図を使用する場合。',
  definitionAuthority: 'issuer',
  sourceGeneration: '2026-07 official seat map',
  sourceIds: ['official-seat-map'],
  differenceBasisSourceIds: [],
  status: 'production',
  selectable: true,
  numberedSeatSetComplete: true,
  capacityFitting: false,
  repositoryInventedDifferences: false,
  expectedSeatCount: 3,
  scope: {
    kind: 'full-venue',
    issuerDefined: true,
    containsEventDependentSeatIds: false,
  },
  scopeDisclosure: '',
  wheelchairSemantics: {
    status: 'resolved',
    description: '公式座席図上に車いす置換席はない。',
    sourceIds: ['official-seat-map'],
  },
  verification: {
    status: 'verified',
    checkedAt: TODAY,
    method: 'independent-official-source-review',
    seatStructure: 'matched',
    seatCount: 'matched',
    rangeDiff: 0,
    unresolvedIssues: [],
  },
  ranges: [{ areaId: 'main', areaLabel: 'メイン', rowLabel: 'A', from: 1, to: 3 }],
  ...overrides,
})
const sourceV2 = (overrides = {}) => ({
  schemaVersion: 2,
  status: 'production',
  id: 'test-hall-v2',
  name: 'Test Hall V2',
  prefecture: '東京都',
  city: '渋谷区',
  aliases: ['テストホールV2'],
  venueType: 'hall',
  sources: source().sources,
  configurations: [configurationV2()],
  ...overrides,
})
const unfinishedSource = (status, id) => source({
  status,
  id,
  representativePattern: {
    id: '',
    name: '',
    coverage: 'draft',
    expectedSeatCount: null,
    selectionReason: '',
    notIncludedPatterns: [],
  },
  sources: [],
  registeredScope: '',
  completenessBasis: '',
  transformation: '',
  knownLimitations: [],
  verification: {
    status: 'pending',
    checkedAt: null,
    method: '',
    seatStructure: 'pending',
    seatCount: 'pending',
    unresolvedIssues: [],
  },
  ranges: [],
  ...(status === 'rejected' ? { rejectionReason: '公式資料が不十分。' } : {}),
})
const wrapped = (data, file = `${data.id}.json`) => [{ file, data }]
const resultFor = (data, file, options = {}) => validateSources(wrapped(data, file), { today: TODAY, ...options })
const errorsFor = (data, file, options) => resultFor(data, file, options).errors.join('\n')

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('venue source validation', () => {
  it('accepts valid draft, rejected, and production sources', () => {
    expect(errorsFor(unfinishedSource('draft', 'draft-hall'))).toBe('')
    expect(errorsFor(unfinishedSource('rejected', 'rejected-hall'))).toBe('')
    expect(errorsFor(source())).toBe('')
  })

  it('rejects unknown status and filename/ID mismatch', () => {
    expect(errorsFor(source({ status: 'mystery' }))).toMatch(/unknown or missing status/)
    expect(errorsFor(source(), 'other.json')).toMatch(/filename must match/)
  })

  it('validates representativePattern and verification structure for every status', () => {
    const broken = unfinishedSource('draft', 'draft-hall')
    broken.representativePattern = []
    broken.verification = { status: 'unknown', checkedAt: 'bad', method: 1, seatStructure: 'bad', seatCount: 'bad', unresolvedIssues: [''] }
    const errors = errorsFor(broken)
    expect(errors).toMatch(/representativePattern must be a plain object/)
    expect(errors).toMatch(/verification.status has unknown value/)
    expect(errors).toMatch(/verification.checkedAt must be null or a valid/)
    expect(errors).toMatch(/verification.method must be a string/)
    expect(errors).toMatch(/verification.unresolvedIssues 0 is missing/)
  })

  it('rejects normalized alias duplicates and cross-venue search collisions', () => {
    expect(errorsFor(source({ aliases: ['ＡＢＣ', 'abc'] }))).toMatch(/duplicate normalized aliases/)
    const other = source({ id: 'other-hall', name: 'Other Hall', aliases: ['test hall'] })
    expect(validateSources([...wrapped(source()), ...wrapped(other)], { today: TODAY }).errors.join('\n')).toMatch(/collides/)
  })

  it('rejects invalid source URL, venue type, exclusions, and range overlap', () => {
    const invalid = source({ venueType: 'club' })
    invalid.sources[0].url = 'http://example.com'
    invalid.ranges = [
      { rowLabel: 'A', from: 1, to: 3, excluded: [2, 2] },
      { rowLabel: 'A', from: 3, to: 4, excluded: [5] },
    ]
    const errors = errorsFor(invalid)
    expect(errors).toMatch(/URL must use HTTPS/)
    expect(errors).toMatch(/unknown venueType/)
    expect(errors).toMatch(/duplicate exclusion/)
    expect(errors).toMatch(/outside the range/)
    expect(errors).toMatch(/overlaps range/)
  })

  it('accepts an issuer-owned seat number 0 but rejects negative seat IDs', () => {
    const numberedZero = sourceV2({ configurations: [configurationV2({
      expectedSeatCount: 4,
      ranges: [{ areaId: 'main', areaLabel: '客席', rowLabel: '左1', from: 0, to: 3, excluded: [] }],
    })] })
    expect(errorsFor(numberedZero)).toBe('')
    numberedZero.configurations[0].ranges[0].from = -1
    expect(errorsFor(numberedZero)).toMatch(/non-negative/)
  })

  it('rejects count mismatch, incomplete verification, and incomplete coverage', () => {
    const mismatch = source({ representativePattern: { ...source().representativePattern, expectedSeatCount: 4 } })
    expect(errorsFor(mismatch)).toMatch(/expected 4, calculated 3/)
    const verification = source()
    verification.verification.status = 'pending'
    expect(errorsFor(verification)).toMatch(/verification.status must be verified/)
    const coverage = source()
    coverage.representativePattern.coverage = 'partial'
    expect(errorsFor(coverage)).toMatch(/coverage must be complete/)
  })
})

describe('schema v2 configuration validation and output', () => {
  it('accepts one configuration, multiple issuer-defined configurations, and fixed-only configurations', () => {
    expect(errorsFor(sourceV2())).toBe('')
    const multi = sourceV2({ configurations: [
      configurationV2({ differenceBasisSourceIds: ['official-seat-map'] }),
      configurationV2({
        id: 'with-pit',
        canonicalName: 'オーケストラピット使用時',
        issuerDefinedCondition: '施設運営者がピット使用時として公開した座席図を使用する場合。',
        differenceBasisSourceIds: ['official-seat-map'],
        expectedSeatCount: 2,
        ranges: [{ areaId: 'main', areaLabel: 'メイン', rowLabel: 'B', from: 1, to: 2 }],
      }),
    ] })
    expect(errorsFor(multi)).toBe('')
    const fixedOnly = sourceV2({ configurations: [configurationV2({
      id: 'fixed-only',
      canonicalName: '固定席のみ',
      issuerDefinedCondition: '施設運営者が独立した恒久固定席として定義した範囲。',
      scope: {
        kind: 'fixed-only',
        issuerDefined: true,
        containsEventDependentSeatIds: false,
        excludesDynamicAreas: true,
        maximumCapacity: false,
        excludedAreas: ['アリーナ・floor席'],
        exactSubtotal: 3,
      },
      scopeDisclosure: '固定席のみ。アリーナ／floor席を含まず、会場最大収容配置ではありません。',
    })] })
    expect(errorsFor(fixedOnly)).toBe('')
  })

  it('keeps a complete configuration selectable when an incomplete official variant is non-selectable', () => {
    const data = sourceV2({ configurations: [
      configurationV2({ differenceBasisSourceIds: ['official-seat-map'] }),
      configurationV2({
        id: 'future-variant',
        canonicalName: '公式別配置（保留）',
        issuerDefinedCondition: '施設運営者が別配置として公開した場合。',
        differenceBasisSourceIds: ['official-seat-map'],
        status: 'draft',
        selectable: false,
        numberedSeatSetComplete: false,
        expectedSeatCount: null,
        verification: { status: 'pending', checkedAt: null, method: '', seatStructure: 'pending', seatCount: 'pending', rangeDiff: null, unresolvedIssues: ['番号範囲未公開'] },
        ranges: [],
      }),
    ] })
    expect(errorsFor(data)).toBe('')
    const outputs = buildOutputs(wrapped(data))
    expect(outputs.catalog[0].configurations.map(({ id }) => id)).toEqual(['standard'])
    expect([...outputs.details.keys()]).toEqual(['test-hall-v2--standard'])
  })

  it.each([
    ['repository-created configuration', (data) => { data.configurations[0].definitionAuthority = 'repository' }, /definitionAuthority|repository-created/],
    ['missing issuer condition', (data) => { data.configurations[0].issuerDefinedCondition = '' }, /issuerDefinedCondition/],
    ['event-dependent permanent IDs', (data) => { data.configurations[0].scope.containsEventDependentSeatIds = true }, /event-dependent floor seats/],
    ['capacity fitting', (data) => { data.configurations[0].capacityFitting = true }, /capacity fitting/],
    ['incomplete production configuration', (data) => { data.configurations[0].numberedSeatSetComplete = false }, /numbered seat set must be complete/],
    ['count mismatch', (data) => { data.configurations[0].expectedSeatCount = 4 }, /expected 4, calculated 3|does not match calculated/],
    ['unresolved wheelchair semantics', (data) => { data.configurations[0].wheelchairSemantics.status = 'unresolved' }, /wheelchair semantics must be resolved/],
    ['missing source generation', (data) => { data.configurations[0].sourceGeneration = '' }, /sourceGeneration/],
    ['incomplete verification', (data) => { data.configurations[0].verification.status = 'pending' }, /verification.status must be verified/],
  ])('rejects %s', (_name, mutate, expected) => {
    const data = sourceV2()
    mutate(data)
    expect(errorsFor(data)).toMatch(expected)
  })

  it('rejects duplicate IDs, ungrounded duplicate seat sets, and configurations without difference evidence', () => {
    const duplicateId = sourceV2({ configurations: [
      configurationV2({ differenceBasisSourceIds: ['official-seat-map'] }),
      configurationV2({ differenceBasisSourceIds: ['official-seat-map'] }),
    ] })
    expect(errorsFor(duplicateId)).toMatch(/duplicate configuration ID/)
    expect(errorsFor(duplicateId)).toMatch(/duplicate a physical seat set without issuer evidence/)
    const noDifferenceEvidence = sourceV2({ configurations: [
      configurationV2(),
      configurationV2({ id: 'variant', ranges: [{ areaId: 'main', areaLabel: 'メイン', rowLabel: 'B', from: 1, to: 3 }] }),
    ] })
    expect(errorsFor(noDifferenceEvidence)).toMatch(/requires issuer evidence for configuration differences/)
  })

  it('rejects fixed-only configurations without complete scope disclosure', () => {
    const data = sourceV2({ configurations: [configurationV2({
      id: 'fixed-only',
      canonicalName: '固定席のみ',
      scope: { kind: 'fixed-only', issuerDefined: true, containsEventDependentSeatIds: false, excludesDynamicAreas: true, maximumCapacity: false, excludedAreas: ['floor'], exactSubtotal: 3 },
      scopeDisclosure: '',
    })] })
    expect(errorsFor(data)).toMatch(/fixed-only scopeDisclosure is required/)
  })
})

describe('placeholder and status-specific range gates', () => {
  it('allows empty ranges for draft and rejected but not production', () => {
    expect(errorsFor(unfinishedSource('draft', 'draft-hall'))).toBe('')
    expect(errorsFor(unfinishedSource('rejected', 'rejected-hall'))).toBe('')
    const production = source({ ranges: [], representativePattern: { ...source().representativePattern, expectedSeatCount: 1 } })
    expect(errorsFor(production)).toMatch(/production has no selectable seats|at least one selectable seat/)
  })

  it('requires rejectionReason and never generates rejected or draft sources', () => {
    const rejected = unfinishedSource('rejected', 'rejected-hall')
    delete rejected.rejectionReason
    expect(errorsFor(rejected)).toMatch(/rejectionReason is missing/)
    const outputs = buildOutputs([
      ...wrapped(source()),
      ...wrapped(unfinishedSource('draft', 'draft-hall')),
      ...wrapped(unfinishedSource('rejected', 'rejected-hall')),
    ])
    expect(outputs.catalog.map(({ id }) => id)).toEqual(['test-hall-standard'])
    expect([...outputs.details.keys()]).toEqual(['test-hall-standard'])
  })

  it('rejects placeholder tokens in row, area, source, and descriptive fields', () => {
    const row = source({ ranges: [{ areaId: 'main', areaLabel: 'メイン', rowLabel: 'TODO', from: 1, to: 3 }] })
    expect(errorsFor(row)).toMatch(/placeholder token is forbidden at ranges.0.rowLabel/)
    const area = source({ ranges: [{ areaId: 'main', areaLabel: '未設定', rowLabel: 'A', from: 1, to: 3 }] })
    expect(errorsFor(area)).toMatch(/placeholder token is forbidden at ranges.0.areaLabel/)
    const metadata = source()
    metadata.sources[0].title = 'TBD'
    metadata.completenessBasis = 'placeholder'
    const errors = errorsFor(metadata)
    expect(errors).toMatch(/placeholder token is forbidden at sources.0.title/)
    expect(errors).toMatch(/placeholder token is forbidden at completenessBasis/)
  })

  it('does not misclassify ordinary Japanese prose containing similar text', () => {
    const data = source({ registeredScope: '未設定項目が存在しないことを確認した全席。' })
    expect(errorsFor(data)).toBe('')
  })
})

describe('runtime main-area canonicalization', () => {
  it('rejects mixing implicit and explicit main because runtime merges them', () => {
    const mixed = source({
      representativePattern: { ...source().representativePattern, expectedSeatCount: 6 },
      ranges: [
        { rowLabel: 'A', from: 1, to: 3 },
        { areaId: 'main', areaLabel: 'メイン', rowLabel: 'B', from: 1, to: 3 },
      ],
    })
    expect(errorsFor(mixed)).toMatch(/cannot be mixed because both resolve to runtime area main/)
  })

  it('detects overlap for implicit, explicit main, and explicit named areas', () => {
    const cases = [
      [
        { rowLabel: 'A', from: 1, to: 3 },
        { rowLabel: 'A', from: 3, to: 4 },
      ],
      [
        { areaId: 'main', areaLabel: 'メイン', rowLabel: 'A', from: 1, to: 3 },
        { areaId: 'main', areaLabel: 'メイン', rowLabel: 'A', from: 3, to: 4 },
      ],
      [
        { areaId: 'floor', areaLabel: 'フロア', rowLabel: 'A', from: 1, to: 3 },
        { areaId: 'floor', areaLabel: 'フロア', rowLabel: 'A', from: 3, to: 4 },
      ],
    ]
    cases.forEach((ranges) => expect(errorsFor(source({ ranges }))).toMatch(/overlaps range/))
  })

  it('uses the same canonical main key in helpers and review output', async () => {
    const implicit = source({ ranges: [{ rowLabel: 'A', from: 1, to: 3 }] })
    expect(canonicalAreaId(implicit.ranges[0])).toBe('main')
    const output = await reviewVenues({ id: implicit.id }, { sources: wrapped(implicit), validationOptions: { today: TODAY } })
    expect(output).toContain('0: main / A / 1')
    expect(output).toContain('main ((none)): 3 seats')
  })
})

describe('Asia/Tokyo calendar validation', () => {
  it('uses the Tokyo date when UTC is still the previous day', () => {
    const boundary = new Date('2026-07-23T15:30:00Z')
    expect(boundary.toISOString().slice(0, 10)).toBe('2026-07-23')
    expect(dateInTokyo(boundary)).toBe('2026-07-24')
    expect(validateSources(wrapped(source()), { now: boundary }).errors).toEqual([])
  })

  it('allows today and rejects tomorrow for source and verification dates', () => {
    expect(errorsFor(source())).toBe('')
    const tomorrow = source()
    tomorrow.sources[0].checkedAt = '2026-07-25'
    tomorrow.verification.checkedAt = '2026-07-25'
    const errors = errorsFor(tomorrow)
    expect(errors).toMatch(/source 0 checkedAt is in the future/)
    expect(errors).toMatch(/verification.checkedAt is in the future/)
  })

  it('warns only after the 365-day boundary', () => {
    const boundary = source()
    boundary.sources[0].checkedAt = '2025-07-24'
    expect(resultFor(boundary).warnings).toEqual([])
    const stale = source()
    stale.sources[0].checkedAt = '2025-07-23'
    expect(resultFor(stale).warnings.join('\n')).toMatch(/366 days ago/)
  })
})

describe('canonical strings', () => {
  it('rejects leading/trailing whitespace and CLI arguments do not silently trim', async () => {
    expect(errorsFor(source({ name: ' Test Hall' }))).toMatch(/leading or trailing whitespace/)
    const directory = await mkdtemp(path.join(os.tmpdir(), 'venues-new-'))
    temporaryDirectories.push(directory)
    await expect(createVenueSource({
      id: 'example-hall',
      name: ' Example',
      prefecture: '東京都',
      city: '渋谷区',
      type: 'hall',
    }, { sourceDir: directory })).rejects.toThrow(/leading or trailing whitespace/)
  })

  it('rejects NFKC-equivalent row and area duplicates', () => {
    const row = source({
      representativePattern: { ...source().representativePattern, expectedSeatCount: 4 },
      ranges: [
        { areaId: 'main', areaLabel: 'メイン', rowLabel: 'A', from: 1, to: 2 },
        { areaId: 'main', areaLabel: 'メイン', rowLabel: 'Ａ', from: 3, to: 4 },
      ],
    })
    expect(errorsFor(row)).toMatch(/duplicates normalized rowLabel/)
    const area = source({
      representativePattern: { ...source().representativePattern, expectedSeatCount: 4 },
      ranges: [
        { areaId: 'main', areaLabel: 'メイン', rowLabel: 'A', from: 1, to: 2 },
        { areaId: 'ｍａｉｎ', areaLabel: '別エリア', rowLabel: 'B', from: 1, to: 2 },
      ],
    })
    expect(errorsFor(area)).toMatch(/duplicates normalized areaId/)
  })
})

describe('venue authoring and review helpers', () => {
  it('creates a basic-valid, zero-seat draft that remains blocked from production', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'venues-new-'))
    temporaryDirectories.push(directory)
    const target = await createVenueSource({
      id: 'example-hall-standard',
      name: 'Example Hall',
      prefecture: '東京都',
      city: '渋谷区',
      type: 'hall',
    }, { sourceDir: directory })
    const data = JSON.parse(await readFile(target, 'utf8'))
    expect(data.status).toBe('draft')
    expect(data.ranges).toEqual([])
    expect(data.representativePattern.expectedSeatCount).toBeNull()
    expect(validateSources(wrapped(data), { today: TODAY }).errors).toEqual([])
    expect(productionGateIssues(data).length).toBeGreaterThan(0)
  })

  it('refuses overwrite and invalid arguments', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'venues-new-'))
    temporaryDirectories.push(directory)
    const values = { id: 'example-hall', name: 'Example', prefecture: '東京都', city: '渋谷区', type: 'hall' }
    await createVenueSource(values, { sourceDir: directory })
    await expect(createVenueSource(values, { sourceDir: directory })).rejects.toThrow(/Refusing to overwrite/)
    await expect(createVenueSource({ ...values, id: 'Bad_ID' }, { sourceDir: directory })).rejects.toThrow(/Invalid --id/)
    await expect(createVenueSource({ ...values, type: 'club' }, { sourceDir: directory })).rejects.toThrow(/Invalid --type/)
    await expect(createVenueSource({ ...values, prefecture: '不明県' }, { sourceDir: directory })).rejects.toThrow(/Unknown --prefecture/)
  })

  it('reviews malformed authoring ranges without throwing and shows every error/blocker', async () => {
    const broken = unfinishedSource('draft', 'broken-draft')
    broken.representativePattern = []
    broken.verification = null
    broken.ranges = [null, { rowLabel: 'B', from: 1 }, { rowLabel: 'A', from: 1, to: 2, excluded: 'bad' }]
    const output = await reviewVenues({ id: broken.id }, { sources: wrapped(broken), validationOptions: { today: TODAY } })
    expect(output).toContain('unavailable due to validation errors')
    expect(output).toContain('range 0 must be an object')
    expect(output).toContain('representativePattern must be a plain object')
    expect(output).toContain('verification must be a plain object')
    expect(output).toContain('Production blockers:')
  })

  it('reviews zero-seat draft and rejected sources normally and deterministically', async () => {
    for (const data of [unfinishedSource('draft', 'draft-hall'), unfinishedSource('rejected', 'rejected-hall')]) {
      const first = await reviewVenues({ id: data.id }, { sources: wrapped(data), validationOptions: { today: TODAY } })
      const second = await reviewVenues({ id: data.id }, { sources: wrapped(data), validationOptions: { today: TODAY } })
      expect(second).toBe(first)
      expect(first).toContain('calculated=0')
      expect(first).toContain('Production blockers:')
    }
  })

  it('clearly reports missing IDs and invalid JSON', async () => {
    await expect(reviewVenues({ id: 'missing' }, { sources: wrapped(source()) })).rejects.toThrow(/Venue source not found/)
    const directory = await mkdtemp(path.join(os.tmpdir(), 'venues-review-'))
    temporaryDirectories.push(directory)
    await writeFile(path.join(directory, 'broken.json'), '{bad', 'utf8')
    await expect(reviewVenues({ all: true }, { sourceDir: directory })).rejects.toThrow(/broken.json: invalid JSON/)
  })
})
