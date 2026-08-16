import { describe, expect, it } from 'vitest'
import type { VenueCatalogEntry, VenueSeatDefinition } from '../../types/venue'
import type { RandomSource } from '../lottery/random'
import { prepareVenueSampler } from './rangeSampler'
import { generateCustomSeats } from './customSeats'
import {
  buildSeatRuns,
  buildSeatRunsFromSeats,
  countSeatGroups,
  countVenueSeatGroups,
  drawSeatGroup,
  drawVenueSeatGroup,
  isTicketCount,
  MAX_TICKET_COUNT,
  TICKET_COUNT_OPTIONS,
} from './seatGroups'

const source = (value: number): RandomSource => ({ nextUint32: () => value })

const venue: VenueCatalogEntry = {
  id: 'v', name: '会場', searchAliases: [], region: '関東', prefecture: '東京都', municipality: '千代田区',
  venueType: 'hall', representativePatternName: '標準', seatCount: 9, dataPath: '/v.json',
}
const definition: VenueSeatDefinition = {
  schemaVersion: 1, venueId: 'v', patternId: 'p', areas: { a: '1階', b: '2階' }, totalSeatCount: 9,
  ranges: [
    { areaId: 'a', rowLabel: 'A', from: 1, to: 5, excluded: [3] },
    { areaId: 'a', rowLabel: 'B', from: 10, to: 12 },
    { areaId: 'b', rowLabel: 'A', from: 1, to: 2 },
  ],
}
const prepared = prepareVenueSampler(definition)

const drawAll = (size: number) =>
  Array.from({ length: countVenueSeatGroups(prepared, size) }, (_, index) => drawVenueSeatGroup(prepared, venue, size, source(index)))

describe('連番グループの構築', () => {
  it('欠番で連番を切り、列とエリアをまたがない', () => {
    expect(buildSeatRuns(definition.ranges)).toEqual([
      { areaId: 'a', rowLabel: 'A', from: 1, to: 2 },
      { areaId: 'a', rowLabel: 'A', from: 4, to: 5 },
      { areaId: 'a', rowLabel: 'B', from: 10, to: 12 },
      { areaId: 'b', rowLabel: 'A', from: 1, to: 2 },
    ])
  })

  it('同じ列が複数rangeに分かれていても、番号が隣接していれば1つの連番にまとめる', () => {
    expect(buildSeatRuns([
      { areaId: 'a', rowLabel: 'C', from: 1, to: 14 },
      { areaId: 'a', rowLabel: 'C', from: 15, to: 24 },
      { areaId: 'a', rowLabel: 'C', from: 27, to: 30 },
    ])).toEqual([
      { areaId: 'a', rowLabel: 'C', from: 1, to: 24 },
      { areaId: 'a', rowLabel: 'C', from: 27, to: 30 },
    ])
  })

  it('areaIdのない会場はmainとして扱う', () => {
    expect(buildSeatRuns([{ rowLabel: '1', from: 1, to: 3 }])).toEqual([{ areaId: 'main', rowLabel: '1', from: 1, to: 3 }])
  })
})

describe('会場の複数枚抽選', () => {
  it('枚数ごとに有効な開始位置だけを候補にする', () => {
    expect(countVenueSeatGroups(prepared, 1)).toBe(prepared.totalSeatCount)
    expect(countVenueSeatGroups(prepared, 2)).toBe(5)
    expect(countVenueSeatGroups(prepared, 3)).toBe(1)
    expect(countVenueSeatGroups(prepared, 4)).toBe(0)
  })

  it('必要枚数の連番が1組しかない場合は必ずその組になる', () => {
    expect(drawVenueSeatGroup(prepared, venue, 3, source(0)).map((seat) => seat.number)).toEqual([10, 11, 12])
  })

  it('すべての有効な連番グループを重複なく等確率で選べる', () => {
    const groups = drawAll(2).map((seats) => seats.map((seat) => `${seat.sectionId}/${seat.rowLabel}/${seat.number}`).join(','))
    expect(groups).toEqual([
      'a/A/1,a/A/2',
      'a/A/4,a/A/5',
      'a/B/10,a/B/11',
      'a/B/11,a/B/12',
      'b/A/1,b/A/2',
    ])
    expect(new Set(groups).size).toBe(groups.length)
  })

  it('欠番・列・エリアをまたぐ組み合わせを作らない', () => {
    for (const seats of [...drawAll(2), ...drawAll(3)]) {
      expect(new Set(seats.map((seat) => seat.rowLabel)).size).toBe(1)
      expect(new Set(seats.map((seat) => seat.sectionId)).size).toBe(1)
      expect(seats.map((seat) => seat.number)).toEqual(seats.map((_, index) => seats[0].number + index))
      expect(seats.some((seat) => seat.sectionId === 'a' && seat.rowLabel === 'A' && seat.number === 3)).toBe(false)
    }
  })

  it('会場名・エリア表示など1枚と同じ座席情報を持つ', () => {
    expect(drawVenueSeatGroup(prepared, venue, 2, source(0))[0]).toEqual({
      venueId: 'v', venueName: '会場', layoutId: 'p', layoutName: '標準',
      sectionId: 'a', sectionLabel: '1階', rowLabel: 'A', number: 1,
    })
  })

  it('連番が足りない場合は抽選せず例外にする', () => {
    expect(() => drawVenueSeatGroup(prepared, venue, 4, source(0))).toThrow(RangeError)
  })

  it('上限を超える枚数は受け付けない', () => {
    expect(MAX_TICKET_COUNT).toBe(4)
    expect(TICKET_COUNT_OPTIONS).toEqual([1, 2, 3, 4])
    expect(isTicketCount(1)).toBe(true)
    expect(isTicketCount(5)).toBe(false)
    expect(() => countVenueSeatGroups(prepared, 5)).toThrow(RangeError)
    expect(() => drawVenueSeatGroup(prepared, venue, 0, source(0))).toThrow(RangeError)
  })
})

describe('自作座席の複数枚抽選', () => {
  const seats = generateCustomSeats({
    venueName: 'マイ会場', areaName: 'アリーナ', rowKind: 'alphabet',
    firstRow: 'A', lastRow: 'B', firstSeat: '1', lastSeat: '3',
  })

  it('列ごとに連番グループを作る', () => {
    expect(buildSeatRunsFromSeats(seats).map((run) => run.map((seat) => `${seat.rowLabel}${seat.number}`))).toEqual([
      ['A1', 'A2', 'A3'],
      ['B1', 'B2', 'B3'],
    ])
    expect(countSeatGroups(seats, 1)).toBe(6)
    expect(countSeatGroups(seats, 2)).toBe(4)
    expect(countSeatGroups(seats, 3)).toBe(2)
    expect(countSeatGroups(seats, 4)).toBe(0)
  })

  it('同じ列の連番だけを返す', () => {
    const groups = Array.from({ length: 4 }, (_, index) => drawSeatGroup(seats, 2, source(index)))
    expect(groups.map((group) => group.map((seat) => `${seat.rowLabel}${seat.number}`).join(','))).toEqual([
      'A1,A2', 'A2,A3', 'B1,B2', 'B2,B3',
    ])
    for (const group of groups) expect(new Set(group.map((seat) => seat.rowLabel)).size).toBe(1)
    expect(drawSeatGroup(seats, 2, source(0))[0].venueName).toBe('マイ会場')
  })

  it('連番が足りない場合は例外にする', () => {
    expect(() => drawSeatGroup(seats, 4, source(0))).toThrow(RangeError)
    expect(countSeatGroups([], 2)).toBe(0)
  })
})
