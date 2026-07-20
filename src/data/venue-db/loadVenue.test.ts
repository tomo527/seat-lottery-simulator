import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearVenueSeatDataCache, loadVenueSeatData } from './loadVenue'
import type { VenueCatalogEntry, VenueSeatDefinition } from '../../types/venue'

const venue: VenueCatalogEntry = {
  id: 'test-hall', name: 'Test Hall', prefecture: '東京都', city: 'テスト区', aliases: [], venueType: 'hall',
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
})
