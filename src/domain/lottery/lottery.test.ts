import { describe, expect, it } from 'vitest'
import type { Seat } from '../../types/venue'
import { drawSeat, formatSeatGroupLabel, formatSeatLabel, formatSeatNumbers } from './lottery'
import { randomInt, type RandomSource } from './random'

const source = (...values: number[]): RandomSource => {
  let index = 0
  return { nextUint32: () => values[index++] ?? values.at(-1) ?? 0 }
}
const seat: Seat = { venueId: 'v', venueName: '会場', layoutId: 'l', layoutName: '標準', sectionId: 's', sectionLabel: 'Aブロック', rowLabel: 'B', number: 12 }

describe('lottery domain', () => {
  it('1席しかない場合はその席を選ぶ', () => expect(drawSeat([seat], source(123))).toBe(seat))
  it('注入した乱数で同じ結果を再現できる', () => expect(drawSeat([seat, { ...seat, number: 13 }], source(1)).number).toBe(13))
  it('rejection samplingで偏りの原因となる範囲を捨てる', () => expect(randomInt(3, source(0xffffffff, 5))).toBe(2))
  it('表示用文字列はエリアを自然に省略できる', () => {
    expect(formatSeatLabel(seat)).toBe('Aブロック B列 12番')
    expect(formatSeatLabel({ ...seat, sectionLabel: undefined })).toBe('B列 12番')
  })
  it('1枚は単独の番号、複数枚は範囲で表示する', () => {
    expect(formatSeatNumbers([seat])).toBe('12番')
    expect(formatSeatNumbers([seat, { ...seat, number: 13 }, { ...seat, number: 14 }])).toBe('12番〜14番')
    expect(formatSeatGroupLabel([seat])).toBe('Aブロック B列 12番')
    expect(formatSeatGroupLabel([seat, { ...seat, number: 13 }])).toBe('Aブロック B列 12番〜13番')
    expect(() => formatSeatNumbers([])).toThrow(RangeError)
  })
})
