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

describe('lottery domain', () => {
  it('1席しかない場合はその席を選ぶ', () => {
    expect(drawSeat([seat], source(123))).toBe(seat)
  })

  it('注入した乱数で同じ結果を再現できる', () => {
    const seats = [seat, { ...seat, number: 13 }, { ...seat, number: 14 }]
    expect(drawSeat(seats, source(4)).number).toBe(13)
    expect(drawSeat(seats, source(4)).number).toBe(13)
  })

  it('rejection samplingで偏りの原因となる範囲を捨てる', () => {
    expect(randomInt(3, source(0xffffffff, 5))).toBe(2)
  })

  it('除外席や存在しない席を抽選対象に含めない', () => {
    const layout: VenueLayout = { id: 'l', name: '標準', sections: [{ id: 's', label: 'A', map: { x: 0, y: 0, width: 10, height: 10, shape: 'rectangle' }, rows: [{ label: '1', seatRanges: [{ from: 1, to: 4 }], excludedSeats: [2] }] }] }
    const venue: Venue = { id: 'v', name: '会場', region: '関東', accuracy: 'demo', notice: 'demo', layouts: [layout] }
    const seats = generateVenueSeats(venue, layout)
    expect(seats.map((item) => item.number)).toEqual([1, 3, 4])
    expect(seats.some((item) => item.number === 2 || item.number === 5)).toBe(false)
    for (let value = 0; value < 12; value += 1) expect([1, 3, 4]).toContain(drawSeat(seats, source(value)).number)
  })

  it('表示用の座席文字列を生成する', () => {
    expect(formatSeatLabel(seat)).toBe('Aブロック B列 12番')
  })
})
