import { describe, expect, it } from 'vitest'
import type { Seat, Venue, VenueLayout } from '../../types/venue'
import { generateVenueSeats } from '../seats/venueSeats'
import { drawSeat, formatSeatLabel } from './lottery'
import { randomInt, type RandomSource } from './random'

const source = (...values: number[]): RandomSource => {
  let index = 0
  return { nextUint32: () => values[index++] ?? values.at(-1) ?? 0 }
}

const seat: Seat = { venueId: 'v', venueName: '会場', layoutId: 'l', layoutName: '標準', sectionId: 's', sectionLabel: 'Aブロック', rowLabel: 'B', number: 12 }
const venueFor = (layout: VenueLayout): Venue => ({
  id: 'v', name: '会場', region: '関東', seatDataAccuracy: 'demo',
  representativePattern: { id: layout.id, name: layout.name, coverage: 'complete', expectedSeatCount: 1, selectionReason: 'test', notIncludedPatterns: [] },
  sources: [], internalNotes: [], layouts: [layout],
})

describe('lottery domain', () => {
  it('1席しかない場合はその席を選ぶ', () => expect(drawSeat([seat], source(123))).toBe(seat))
  it('注入した乱数で同じ結果を再現できる', () => {
    const seats = [seat, { ...seat, number: 13 }, { ...seat, number: 14 }]
    expect(drawSeat(seats, source(4)).number).toBe(13)
    expect(drawSeat(seats, source(4)).number).toBe(13)
  })
  it('rejection samplingで偏りの原因となる範囲を捨てる', () => expect(randomInt(3, source(0xffffffff, 5))).toBe(2))
  it('除外席や存在しない番号を抽選対象に含めない', () => {
    const layout: VenueLayout = { id: 'l', name: '標準', sections: [{ id: 's', label: 'A', variability: 'fixed', includedInVenueLottery: true, rows: [{ label: '1', seatRanges: [{ from: 1, to: 4 }], excludedSeats: [2] }] }] }
    const seats = generateVenueSeats(venueFor(layout), layout)
    expect(seats.map((item) => item.number)).toEqual([1, 3, 4])
  })
  it('event-specific席を会場共通抽選に含めない', () => {
    const layout: VenueLayout = { id: 'l', name: '標準', sections: [
      { id: 'fixed', label: '固定席', variability: 'fixed', includedInVenueLottery: true, rows: [{ label: '1', seatRanges: [{ from: 1, to: 2 }] }] },
      { id: 'temporary', label: '仮設席', variability: 'event-specific', includedInVenueLottery: true, rows: [{ label: 'A', seatRanges: [{ from: 1, to: 100 }] }] },
    ] }
    const seats = generateVenueSeats(venueFor(layout), layout)
    expect(seats).toHaveLength(2)
    expect(seats.every((item) => item.sectionId === 'fixed')).toBe(true)
  })
  it('表示用文字列はエリアを自然に省略できる', () => {
    expect(formatSeatLabel(seat)).toBe('Aブロック B列 12番')
    expect(formatSeatLabel({ ...seat, sectionLabel: undefined })).toBe('B列 12番')
  })
})
