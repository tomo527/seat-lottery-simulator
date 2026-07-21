import { describe, expect, it } from 'vitest'
import type { VenueCatalogEntry, VenueSeatDefinition } from '../../types/venue'
import { drawVenueSeat, prepareVenueSampler, seatAtOffset } from './rangeSampler'

const venue: VenueCatalogEntry = { id: 'v', name: '会場', searchAliases: [], region: '関東', prefecture: '東京都', municipality: '千代田区', venueType: 'hall', representativePatternName: '標準', seatCount: 6, dataPath: '/v.json' }
const definition: VenueSeatDefinition = {
  schemaVersion: 1, venueId: 'v', patternId: 'p', areas: { a: '1階' }, totalSeatCount: 6,
  ranges: [{ areaId: 'a', rowLabel: 'A', from: 1, to: 4, excluded: [2] }, { areaId: 'a', rowLabel: 'B', from: 10, to: 12 }],
}

describe('range-based venue sampler', () => {
  const prepared = prepareVenueSampler(definition)
  it('先頭・中間・末尾を決定論的に選べる', () => {
    expect(seatAtOffset(prepared, venue, 0)).toMatchObject({ rowLabel: 'A', number: 1 })
    expect(seatAtOffset(prepared, venue, 2)).toMatchObject({ rowLabel: 'A', number: 4 })
    expect(seatAtOffset(prepared, venue, 5)).toMatchObject({ rowLabel: 'B', number: 12 })
  })
  it('除外席を飛ばし、rangeの席数に比例して均等な通し番号を使う', () => {
    expect(Array.from({ length: 6 }, (_, offset) => seatAtOffset(prepared, venue, offset).number)).toEqual([1, 3, 4, 10, 11, 12])
    expect(drawVenueSeat(prepared, venue, { nextUint32: () => 5 }).number).toBe(12)
  })
  it('数万席でも全席配列を作らず、range数だけを保持する', () => {
    const large = prepareVenueSampler({ ...definition, ranges: [{ rowLabel: '1', from: 1, to: 50_000 }], totalSeatCount: 50_000 })
    expect(large.cumulativeCounts).toHaveLength(1)
    expect(large.totalSeatCount).toBe(50_000)
  })
})
