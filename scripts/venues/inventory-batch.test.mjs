import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildVenueDatabase, writeGeneratedDatabaseAtomically } from './atomic-build.mjs'
import { batchReport } from './batch-report.mjs'
import { validateBatches } from './batches.mjs'
import { analyzeDatabaseSizes, evaluateSizeLimits } from './capacity.mjs'
import { inventoryReport } from './inventory-report.mjs'
import { findInventoryDuplicateCandidates, summarizeInventory, validateInventories } from './inventory.mjs'
import { buildOutputs } from './lib.mjs'
import { reviewVenues } from './review-venue.mjs'
import { validateSources } from './validation.mjs'

const TODAY = '2026-07-24'
const temporaryDirectories = []
const inventoryVenue = (overrides = {}) => ({
  inventoryId: 'example-hall',
  facilityName: 'Example Culture Center',
  spaceName: 'Main Hall',
  officialDisplayName: 'Example Hall',
  prefecture: '東京都',
  city: '渋谷区',
  capacity: 1_200,
  category: 'hall',
  officialFacilityUrl: 'https://example.com/hall',
  operationalStatus: 'active',
  eligibility: 'eligible',
  eligibilityReason: '公式座席表と総席数を確認できる。',
  priority: 'A',
  venueSourceId: 'example-hall-standard',
  researchStatus: 'production',
  lastCheckedAt: TODAY,
  ...overrides,
})
const inventory = (venues = [inventoryVenue()]) => [{
  file: 'tokyo.json',
  data: {
    inventoryVersion: 1,
    jurisdiction: '東京都',
    discoverySource: {
      publisher: '東京都',
      title: '都内ホール・劇場等リスト',
      url: 'https://example.metro.tokyo.lg.jp/list.xlsx',
      checkedAt: TODAY,
      recordCount: 1,
    },
    venues,
  },
}]
const sources = (status = 'production') => [{
  file: 'example-hall-standard.json',
  data: { id: 'example-hall-standard', status, prefecture: '東京都' },
}]
const batch = (overrides = {}) => [{
  file: 'tokyo-wave-1.json',
  data: {
    batchId: 'tokyo-wave-1',
    createdAt: TODAY,
    scope: '東京都内の優先固定席会場',
    targetVenueIds: ['example-hall-standard'],
    status: 'in-progress',
    ...overrides,
  },
}]

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('inventory validation and coverage', () => {
  it('validates schema, duplicate inventory IDs, and venueSourceId assignments', () => {
    expect(validateInventories(inventory(), sources(), { today: TODAY }).errors).toEqual([])
    const duplicate = inventory([
      inventoryVenue(),
      inventoryVenue({ inventoryId: 'example-hall', officialDisplayName: 'Other Hall' }),
    ])
    const errors = validateInventories(duplicate, sources(), { today: TODAY }).errors.join('\n')
    expect(errors).toMatch(/duplicates inventoryId/)
    expect(errors).toMatch(/duplicates venueSourceId/)
  })

  it('requires a positive official record count and rejects an incomplete coverage denominator', () => {
    const invalidCount = inventory()
    invalidCount[0].data.discoverySource.recordCount = 0
    expect(validateInventories(invalidCount, sources(), { today: TODAY }).errors.join('\n')).toMatch(/recordCount must be a positive safe integer/)

    const incomplete = inventory()
    incomplete[0].data.discoverySource.recordCount = 1_208
    expect(validateInventories(incomplete, sources(), { today: TODAY }).errors.join('\n')).toMatch(/coverage denominator is incomplete/)

    const supplemented = inventory([
      inventoryVenue(),
      inventoryVenue({
        inventoryId: 'supplemental-hall',
        officialDisplayName: 'Supplemental Hall',
        officialFacilityUrl: 'https://example.com/supplemental',
        venueSourceId: null,
        researchStatus: 'not-started',
        eligibility: 'needs-research',
      }),
    ])
    supplemented[0].data.discoverySource.recordCount = 1
    expect(validateInventories(supplemented, sources(), { today: TODAY }).errors).toEqual([])
  })

  it('allows missing or HTTP facility URLs while unassessed but requires HTTPS for eligible venues', () => {
    const unassessed = inventory([inventoryVenue({
      eligibility: 'needs-research',
      researchStatus: 'not-started',
      venueSourceId: null,
      officialFacilityUrl: null,
    })])
    expect(validateInventories(unassessed, [], { today: TODAY }).errors).toEqual([])
    const legacyHttp = inventory([inventoryVenue({
      eligibility: 'needs-research',
      researchStatus: 'not-started',
      venueSourceId: null,
      officialFacilityUrl: 'http://example.com/hall',
    })])
    expect(validateInventories(legacyHttp, [], { today: TODAY }).warnings.join('\n')).toMatch(/still uses HTTP/)
    const eligibleHttp = inventory([inventoryVenue({ officialFacilityUrl: 'http://example.com/hall' })])
    expect(validateInventories(eligibleHttp, sources(), { today: TODAY }).errors.join('\n')).toMatch(/must use HTTPS/)
  })

  it('detects source status mismatches, closed production, and missing inventory production', () => {
    const mismatched = inventory([inventoryVenue({ operationalStatus: 'closed' })])
    expect(validateInventories(mismatched, sources('draft'), { today: TODAY }).errors.join('\n')).toMatch(/must be active|is production but source/)
    expect(validateInventories([], sources(), { today: TODAY }).errors).toEqual([])
    const otherInventory = inventory([inventoryVenue({ venueSourceId: null, researchStatus: 'not-started' })])
    expect(validateInventories(otherInventory, sources(), { today: TODAY }).errors.join('\n')).toMatch(/production source is missing/)
  })

  it('calculates eligible and assessment coverage and deterministic groupings', () => {
    const validation = validateInventories(inventory([
      inventoryVenue(),
      inventoryVenue({
        inventoryId: 'research-hall',
        officialDisplayName: 'Research Hall',
        venueSourceId: null,
        researchStatus: 'not-started',
        eligibility: 'needs-research',
        city: '立川市',
        category: 'theater',
        capacity: 450,
      }),
      inventoryVenue({
        inventoryId: 'ineligible-hall',
        officialDisplayName: 'Ineligible Hall',
        venueSourceId: null,
        researchStatus: 'blocked',
        eligibility: 'ineligible',
        city: '立川市',
        category: 'theater',
        capacity: null,
      }),
    ]), sources(), { today: TODAY })
    const summary = summarizeInventory(validation)
    expect(summary.assessmentCoverage).toBeCloseTo(2 / 3)
    expect(summary.eligibleProductionCoverage).toBe(1)
    expect(summary.provisionalQualifiedCoverage).toBe(1)
    expect([...summary.byCity]).toEqual([['渋谷区', 1], ['立川市', 2]])
    expect([...summary.byVenueType]).toEqual([['hall', 1], ['theater', 2]])
  })

  it('lists normalized duplicate candidates and formats a stable inventory report', async () => {
    const duplicateInventory = inventory([
      inventoryVenue(),
      inventoryVenue({
        inventoryId: 'example-hall-renamed',
        officialDisplayName: 'Ｅｘａｍｐｌｅ　Ｈａｌｌ',
        officialFacilityUrl: 'https://example.com/other',
        venueSourceId: null,
        researchStatus: 'not-started',
      }),
    ])
    const validation = validateInventories(duplicateInventory, sources(), { today: TODAY })
    expect(findInventoryDuplicateCandidates(validation.items).some(({ kind }) => kind === 'official-name')).toBe(true)
    const first = await inventoryReport({ inventories: duplicateInventory, sources: sources(), validationOptions: { today: TODAY } })
    const second = await inventoryReport({ inventories: duplicateInventory, sources: sources(), validationOptions: { today: TODAY } })
    expect(second.text).toBe(first.text)
    expect(first.text).toContain('Assessment coverage:')
    expect(first.text).toContain('Duplicate candidates:')
  })

  it('handles more than 100 inventory records without expanding seats', () => {
    const venues = Array.from({ length: 120 }, (_, index) => inventoryVenue({
      inventoryId: `venue-${index}`,
      officialDisplayName: `Venue ${index}`,
      officialFacilityUrl: `https://example.com/${index}`,
      venueSourceId: null,
      researchStatus: 'not-started',
      eligibility: 'needs-research',
    }))
    const validation = validateInventories(inventory(venues), [], { today: TODAY })
    expect(validation.errors).toEqual([])
    expect(summarizeInventory(validation).total).toBe(120)
  })

  it('validates more than 100 source records and keeps ranges out of the catalog', () => {
    const sourceRecords = Array.from({ length: 120 }, (_, index) => ({
      file: `synthetic-${index}.json`,
      data: {
        schemaVersion: 1,
        status: 'draft',
        id: `synthetic-${index}`,
        name: `Synthetic ${index}`,
        prefecture: '東京都',
        city: `City ${index}`,
        aliases: [],
        venueType: 'hall',
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
      },
    }))
    expect(validateSources(sourceRecords, { today: TODAY }).errors).toEqual([])
    const outputs = buildOutputs(sourceRecords)
    expect(outputs.catalog).toEqual([])
    expect(outputs.details.size).toBe(0)
  })
})

describe('batch reporting and review', () => {
  it('rejects duplicate batch IDs and unknown venue targets', () => {
    const items = validateInventories(inventory(), sources(), { today: TODAY }).items
    expect(validateBatches([...batch(), ...batch()], items).errors.join('\n')).toMatch(/duplicate batchId/)
    expect(validateBatches(batch({ targetVenueIds: ['missing'] }), items).errors.join('\n')).toMatch(/not present in inventory/)
  })

  it('rejects the same inventory venue across waves unless carry-over is explicit', () => {
    const items = validateInventories(inventory(), sources(), { today: TODAY }).items
    const wave2 = {
      file: 'tokyo-wave-2.json',
      data: {
        ...batch()[0].data,
        batchId: 'tokyo-wave-2',
        targetVenueIds: ['example-hall'],
      },
    }
    expect(validateBatches([...batch(), wave2], items).errors.join('\n')).toMatch(/duplicates inventory venue/)
    wave2.data.carryOvers = [{
      inventoryId: 'example-hall',
      carryOverFrom: 'tokyo-wave-1',
      previousStatus: 'blocked',
      recheckReason: '改修後資料の確認',
      recheckNotBefore: '2027-01-01',
    }]
    expect(validateBatches([...batch(), wave2], items).errors).toEqual([])
  })

  it('requires non-legacy Tokyo production sources to belong to a batch and accepts supplemental membership', () => {
    const items = validateInventories(inventory(), sources(), { today: TODAY }).items
    expect(validateBatches([], items, sources()).errors.join('\n')).toMatch(/is not assigned to any batch/)
    const supplemental = batch({
      targetVenueIds: [],
      supplementalVenueIds: ['example-hall-standard'],
    })
    expect(validateBatches(supplemental, items, sources()).errors).toEqual([])
  })

  it('requires concrete blockers for independent review mismatches', () => {
    const inventories = inventory([inventoryVenue({
      researchStatus: 'independent-review-mismatch',
      eligibility: 'likely-eligible',
      blockingReason: undefined,
    })])
    expect(validateInventories(inventories, sources('draft'), { today: TODAY }).errors.join('\n')).toMatch(/blockingReason is required/)
  })

  it('reports production, draft, and blocked targets deterministically', async () => {
    const venues = [
      inventoryVenue(),
      inventoryVenue({ inventoryId: 'draft', officialDisplayName: 'Draft', venueSourceId: 'draft-source', researchStatus: 'draft-created' }),
      inventoryVenue({ inventoryId: 'blocked', officialDisplayName: 'Blocked', venueSourceId: null, researchStatus: 'blocked' }),
    ]
    const inventories = inventory(venues)
    const sourceMetadata = [...sources(), { file: 'draft-source.json', data: { id: 'draft-source', status: 'draft', prefecture: '東京都' } }]
    const batches = batch({ targetVenueIds: ['example-hall-standard', 'draft-source', 'blocked'] })
    const first = await batchReport('tokyo-wave-1', { inventories, sources: sourceMetadata, batches, validationOptions: { today: TODAY } })
    const second = await batchReport('tokyo-wave-1', { inventories, sources: sourceMetadata, batches, validationOptions: { today: TODAY } })
    expect(second.text).toBe(first.text)
    expect(first.text).toMatch(/production: 1/)
    expect(first.text).toMatch(/draft-created: 1/)
    expect(first.text).toMatch(/blocked: 1/)
  })

  it('reviews a batch and reports inventory targets without source JSON', async () => {
    const blockedVenue = inventoryVenue({
      inventoryId: 'blocked',
      officialDisplayName: 'Blocked',
      venueSourceId: null,
      researchStatus: 'blocked',
    })
    const text = await reviewVenues(
      { batch: 'tokyo-wave-1' },
      {
        inventories: inventory([blockedVenue]),
        sources: [],
        batches: batch({ targetVenueIds: ['blocked'] }),
        validationOptions: { today: TODAY },
      },
    )
    expect(text).toContain('Batch targets without source:')
    expect(text).toContain('blocked: Blocked has no source JSON')
  })

  it('does not hide a batch target whose planned venueSourceId has no source file', async () => {
    const plannedVenue = inventoryVenue({
      inventoryId: 'planned',
      officialDisplayName: 'Planned',
      venueSourceId: 'planned-source',
      researchStatus: 'not-started',
    })
    const text = await reviewVenues(
      { batch: 'tokyo-wave-1' },
      {
        inventories: inventory([plannedVenue]),
        sources: [],
        batches: batch({ targetVenueIds: ['planned-source'] }),
        validationOptions: { today: TODAY },
      },
    )
    expect(text).toContain('planned-source: Planned has no source JSON (planned source ID: planned-source)')
  })
})

describe('database capacity and atomic generation', () => {
  it('projects 100/300/500 venues and separates soft warnings from hard errors', () => {
    const analysis = analyzeDatabaseSizes({ catalogBytes: 12_000, detailBytes: [1_000, 2_000, 3_000], venueCount: 3 })
    expect(analysis.projections.map(({ venueCount }) => venueCount)).toEqual([100, 300, 500])
    const limits = {
      catalogBytes: { soft: 10_000, hard: 1_000_000 },
      detailBytes: { soft: 2_500, hard: 4_000 },
      databaseBytes: { soft: 20_000, hard: 1_000_000 },
    }
    analysis.detailSizes = [{ file: 'large.json', bytes: 3_000 }]
    const issues = evaluateSizeLimits(analysis, limits)
    expect(issues.warnings.join('\n')).toMatch(/catalog|large\.json|projection/)
    const hard = evaluateSizeLimits({ ...analysis, catalogBytes: 1_000_000 }, limits)
    expect(hard.errors.join('\n')).toMatch(/hard limit/)
  })

  it('replaces outputs deterministically and removes stale details', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'venue-atomic-'))
    temporaryDirectories.push(root)
    const catalogPath = path.join(root, 'src', 'catalog.json')
    const detailDir = path.join(root, 'public', 'venues')
    await mkdir(path.dirname(catalogPath), { recursive: true })
    await mkdir(detailDir, { recursive: true })
    await writeFile(catalogPath, 'old catalog', 'utf8')
    await writeFile(path.join(detailDir, 'stale.json'), 'old detail', 'utf8')
    const outputs = { catalog: [{ id: 'new' }], details: new Map([['new', { venueId: 'new' }]]) }
    await writeGeneratedDatabaseAtomically(outputs, { catalogPath, detailDir })
    expect(JSON.parse(await readFile(catalogPath, 'utf8'))).toEqual([{ id: 'new' }])
    expect(await readdir(detailDir)).toEqual(['new.json'])
    const first = await readFile(path.join(detailDir, 'new.json'), 'utf8')
    await writeGeneratedDatabaseAtomically(outputs, { catalogPath, detailDir })
    expect(await readFile(path.join(detailDir, 'new.json'), 'utf8')).toBe(first)
  })

  it('keeps existing generated files unchanged on staging and commit failures', async () => {
    for (const hook of ['afterStageCatalog', 'afterCatalogReplace', 'afterDetailBackup', 'afterDetailsReplace']) {
      const root = await mkdtemp(path.join(os.tmpdir(), 'venue-rollback-'))
      temporaryDirectories.push(root)
      const catalogPath = path.join(root, 'src', 'catalog.json')
      const detailDir = path.join(root, 'public', 'venues')
      await mkdir(path.dirname(catalogPath), { recursive: true })
      await mkdir(detailDir, { recursive: true })
      await writeFile(catalogPath, 'old catalog', 'utf8')
      await writeFile(path.join(detailDir, 'old.json'), 'old detail', 'utf8')
      const outputs = { catalog: [{ id: 'new' }], details: new Map([['new', { venueId: 'new' }]]) }
      await expect(writeGeneratedDatabaseAtomically(outputs, {
        catalogPath,
        detailDir,
        hooks: { [hook]: () => { throw new Error(`simulated ${hook}`) } },
      })).rejects.toThrow(`simulated ${hook}`)
      expect(await readFile(catalogPath, 'utf8')).toBe('old catalog')
      expect(await readdir(detailDir)).toEqual(['old.json'])
      expect(await readFile(path.join(detailDir, 'old.json'), 'utf8')).toBe('old detail')
    }
  })

  it('does not touch generated output when source validation fails', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'venue-validation-'))
    temporaryDirectories.push(root)
    const catalogPath = path.join(root, 'catalog.json')
    const detailDir = path.join(root, 'venues')
    await mkdir(detailDir)
    await writeFile(catalogPath, 'old catalog', 'utf8')
    await writeFile(path.join(detailDir, 'old.json'), 'old detail', 'utf8')
    await expect(buildVenueDatabase({
      sources: [{ file: 'broken.json', data: null }],
      inventories: [],
      catalogPath,
      detailDir,
      validationOptions: { today: TODAY },
    })).rejects.toThrow(/source root must be a plain object/)
    expect(await readFile(catalogPath, 'utf8')).toBe('old catalog')
    expect(await readdir(detailDir)).toEqual(['old.json'])
  })
})
