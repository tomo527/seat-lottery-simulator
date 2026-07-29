import { describe, expect, it } from 'vitest'
import { readinessReport } from './readiness-report.mjs'

const source = (id, expectedSeatCount = 3) => ({
  file: `${id}.json`,
  data: {
    id,
    name: id,
    representativePattern: { expectedSeatCount },
    ranges: expectedSeatCount ? [{ areaId: 'main', row: 'A', from: 1, to: expectedSeatCount }] : [],
  },
})
const inventoryItem = (inventoryId, venueSourceId, researchStatus) => ({
  file: 'tokyo.json',
  jurisdiction: '東京都',
  venue: { inventoryId, venueSourceId, researchStatus, officialDisplayName: inventoryId },
})
const wrappedBatch = (targetVenueIds, supplementalVenueIds = []) => [{
  file: 'tokyo-wave-test.json',
  data: {
    batchId: 'tokyo-wave-test',
    createdAt: '2026-07-29',
    scope: 'test batch',
    targetVenueIds,
    supplementalVenueIds,
    status: 'in-progress',
  },
}]
const readinessItem = (venueId, readiness = 'R3') => ({
  venueId,
  readiness,
  secondPass: 'not-started',
  blocker: 'review required',
  nextAction: 'review official source',
})
const report = (venues, overrides = {}) => ({
  reportVersion: 1,
  batchId: 'tokyo-wave-test',
  baselineDate: '2026-07-29',
  scope: 'test readiness',
  expectedVenueCount: venues.length,
  venues,
  ...overrides,
})

describe('readiness batch reporting', () => {
  it('resolves a valid --batch selection to the matching batch and readiness records', async () => {
    const items = [inventoryItem('inventory-a', 'source-a', 'draft-created')]
    const result = await readinessReport({
      batchId: 'tokyo-wave-test',
      report: report([readinessItem('source-a')]),
      batches: wrappedBatch(['inventory-a']),
      inventoryItems: items,
      sources: [source('source-a')],
    })
    expect(result.errors).toEqual([])
    expect(result.text).toMatch(/Batch: tokyo-wave-test/)
    expect(result.text).toMatch(/source-a \| source-a \| R3/)
  })

  it('fails an unknown --batch with both batch and readiness resolution context', async () => {
    await expect(readinessReport({
      batchId: 'missing-wave',
      report: report([]),
      batches: wrappedBatch([]),
      inventoryItems: [],
      sources: [],
    })).rejects.toThrow(/Batch not found: missing-wave; readiness report cannot be resolved:/)
  })

  it('shows batch candidates, evaluated readiness records, and baseline exclusions', async () => {
    const items = [
      inventoryItem('inventory-a', 'source-a', 'production'),
      inventoryItem('inventory-b', 'source-b', 'blocked'),
      inventoryItem('inventory-c', 'source-c', 'draft-created'),
    ]
    const result = await readinessReport({
      batchId: 'tokyo-wave-test',
      report: report([readinessItem('source-c')], {
        cohort: {
          description: 'baseline draft records only',
          batchCandidateCount: 3,
          excluded: [
            { venueId: 'inventory-a', baselineStatus: 'production', reason: 'already production' },
            { venueId: 'inventory-b', baselineStatus: 'blocked', reason: 'already blocked' },
          ],
        },
      }),
      batches: wrappedBatch(['inventory-a', 'inventory-b', 'inventory-c']),
      inventoryItems: items,
      sources: [source('source-a'), source('source-b'), source('source-c')],
    })
    expect(result.errors).toEqual([])
    expect(result.text).toMatch(/Batch candidates: 3/)
    expect(result.text).toMatch(/Readiness evaluated: 1/)
    expect(result.text).toMatch(/production=1, blocked=1/)
  })

  it('accepts a Wave 1-style supplementalVenueIds readiness member', async () => {
    const items = [
      inventoryItem('inventory-a', 'source-a', 'draft-created'),
      inventoryItem('supplemental', 'supplemental-source', 'production'),
    ]
    const result = await readinessReport({
      batchId: 'tokyo-wave-test',
      report: report([readinessItem('supplemental-source')]),
      batches: wrappedBatch(['inventory-a'], ['supplemental-source']),
      inventoryItems: items,
      sources: [source('supplemental-source')],
    })
    expect(result.errors).toEqual([])
    expect(result.text).toMatch(/Supplemental membership: 1/)
  })

  it('preserves the existing no-batch readiness report behavior', async () => {
    const result = await readinessReport({
      report: report([readinessItem('source-a')], { batchId: undefined }),
      sources: [source('source-a')],
    })
    expect(result.errors).toEqual([])
    expect(result.text).not.toContain('Batch candidates:')
    expect(result.text).toMatch(/Summary: R1=0, R2=0, R3=1, R4=0, R5=0/)
  })

  it('reports production, draft, and blocked counts from current batch inventory', async () => {
    const items = [
      inventoryItem('production', 'production-source', 'production'),
      inventoryItem('draft', 'draft-source', 'draft-created'),
      inventoryItem('blocked', 'blocked-source', 'blocked'),
    ]
    const result = await readinessReport({
      batchId: 'tokyo-wave-test',
      report: report([readinessItem('draft-source')]),
      batches: wrappedBatch(['production', 'draft', 'blocked']),
      inventoryItems: items,
      sources: [source('draft-source')],
    })
    expect(result.text).toMatch(/Current batch workflow: production=1, draft=1, blocked=1, rejected=0, missing=0/)
  })

  it('fails when readiness contains a venue outside the selected batch', async () => {
    const result = await readinessReport({
      batchId: 'tokyo-wave-test',
      report: report([readinessItem('outside-source')]),
      batches: wrappedBatch(['inventory-a']),
      inventoryItems: [inventoryItem('inventory-a', 'source-a', 'draft-created')],
      sources: [source('outside-source')],
    })
    expect(result.errors.join('\n')).toMatch(/readiness venueId is outside batch tokyo-wave-test: outside-source/)
  })

  it('fails duplicate readiness IDs and a missing cohort classification', async () => {
    const items = [
      inventoryItem('inventory-a', 'source-a', 'draft-created'),
      inventoryItem('inventory-b', 'source-b', 'draft-created'),
    ]
    const result = await readinessReport({
      batchId: 'tokyo-wave-test',
      report: report([readinessItem('source-a'), readinessItem('source-a')], {
        cohort: {
          description: 'all baseline drafts',
          batchCandidateCount: 2,
          excluded: [],
        },
      }),
      batches: wrappedBatch(['inventory-a', 'inventory-b']),
      inventoryItems: items,
      sources: [source('source-a'), source('source-b')],
    })
    expect(result.errors.join('\n')).toMatch(/duplicate readiness venueId: source-a/)
    expect(result.errors.join('\n')).toMatch(/readiness cohort classification missing: inventory-b/)
  })
})
