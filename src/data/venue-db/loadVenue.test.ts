import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearVenueSeatDataCache, loadVenueSeatData } from './loadVenue'
import type { VenueCatalogEntry, VenueRuntimeSelection, VenueSeatDefinition } from '../../types/venue'

const venue: VenueCatalogEntry = {
  id: 'test-hall', name: 'Test Hall', searchAliases: [], region: '関東', prefecture: '東京都', municipality: 'テスト区', venueType: 'hall',
  representativePatternName: 'standard', seatCount: 3, dataPath: '/venue-db/venues/test-hall.json',
}
const detail: VenueSeatDefinition = {
  schemaVersion: 1, venueId: venue.id, patternId: 'standard', ranges: [{ rowLabel: 'A', from: 1, to: 3 }], totalSeatCount: 3,
}

beforeEach(clearVenueSeatDataCache)

describe('loadVenueSeatData', () => {
  it('選択したdataPathだけをfetchし、同じ会場はメモリキャッシュする', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(detail)))
    const first = await loadVenueSeatData(venue, undefined, fetcher)
    const second = await loadVenueSeatData(venue, undefined, fetcher)
    expect(fetcher).toHaveBeenCalledOnce()
    expect(fetcher).toHaveBeenCalledWith(venue.dataPath, { signal: undefined })
    expect(second).toBe(first)
  })

  it('HTTP失敗とcatalog不一致を拒否する', async () => {
    const failed = vi.fn(async () => new Response('', { status: 503 }))
    await expect(loadVenueSeatData(venue, undefined, failed)).rejects.toThrow('HTTP 503')
    const mismatched = vi.fn(async () => new Response(JSON.stringify({ ...detail, venueId: 'other' })))
    await expect(loadVenueSeatData(venue, undefined, mismatched)).rejects.toThrow('does not match')
  })

  it('AbortSignalをfetchへ渡す', async () => {
    const controller = new AbortController()
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.signal).toBe(controller.signal)
      return new Response(JSON.stringify(detail))
    })
    await loadVenueSeatData(venue, controller.signal, fetcher)
  })

  it('schema v2 runtimeを(venueId, configurationId)で照合し別々にcacheする', async () => {
    const selection: VenueRuntimeSelection = {
      ...venue,
      venueGroupId: venue.id,
      configurationId: 'fixed-only',
      representativePatternName: '固定席のみ',
      dataPath: '/venue-db/venues/test-hall--fixed-only.json',
      scopeDisclosure: '固定席のみ。floor席を含みません。',
      fixedOnly: true,
    }
    const runtime = {
      schemaVersion: 2,
      venueId: venue.id,
      venueGroupId: venue.id,
      configurationId: 'fixed-only',
      configurationName: '固定席のみ',
      scope: 'fixed-only',
      scopeDisclosure: '固定席のみ。floor席を含みません。',
      ranges: detail.ranges,
      totalSeatCount: 3,
    } satisfies VenueSeatDefinition
    const fetcher = vi.fn(async () => new Response(JSON.stringify(runtime)))
    const first = await loadVenueSeatData(selection, undefined, fetcher)
    const second = await loadVenueSeatData(selection, undefined, fetcher)
    expect(first.definition.schemaVersion).toBe(2)
    expect(second).toBe(first)
    expect(fetcher).toHaveBeenCalledOnce()
  })
})
