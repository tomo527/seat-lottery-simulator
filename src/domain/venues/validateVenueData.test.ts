import { describe, expect, it } from 'vitest'
import { demoVenue } from '../../data/venues/fixtures/demoVenue'
import { realVenues } from '../../data/venues/realVenues'
import type { Venue } from '../../types/venue'
import { drawSeat } from '../lottery/lottery'
import { generateVenueSeats } from '../seats/venueSeats'
import { countRegisteredSeats, validateProductionVenues, validateVenueData } from './validateVenueData'

const clone = <T,>(value: T): T => structuredClone(value)

describe('venue data validation', () => {
  it('production会場は完全な代表パターン・内部情報源・正確な総数を持つ', () => {
    expect(validateProductionVenues(realVenues)).toEqual([])
    expect(realVenues.map((venue) => venue.id)).toEqual([
      'national-bunraku-theatre-standard',
      'kyocera-dome-osaka-standard-baseball',
    ])
    const expectedCounts = {
      'national-bunraku-theatre-standard': 753,
      'kyocera-dome-osaka-standard-baseball': 34_522,
    }
    for (const venue of realVenues) {
      expect(venue.seatDataAccuracy).not.toBe('demo')
      expect(venue.representativePattern.coverage).toBe('complete')
      expect(venue.layouts).toHaveLength(1)
      expect(venue.layouts[0].id).toBe(venue.representativePattern.id)
      expect(venue.sources.length).toBeGreaterThan(0)
      expect(venue.sources.every((source) => /^https:\/\//.test(source.url) && /^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt))).toBe(true)
      expect(countRegisteredSeats(venue)).toBe(expectedCounts[venue.id as keyof typeof expectedCounts])
    }
  })

  it.each(realVenues.map((venue) => [venue.id, venue] as const))('%sの代表パターン全席を一意に生成し、先頭・中間・末尾を候補に含める', (_id, venue) => {
    const seats = generateVenueSeats(venue, venue.layouts[0])
    expect(seats).toHaveLength(venue.representativePattern.expectedSeatCount)
    expect(new Set(seats.map((seat) => `${seat.sectionId}\0${seat.rowLabel}\0${seat.number}`)).size).toBe(seats.length)
    const middleIndex = Math.floor(seats.length / 2)
    expect(seats[0]).toBeDefined()
    expect(seats[middleIndex]).toBeDefined()
    expect(seats.at(-1)).toBeDefined()
    expect(drawSeat(seats, { nextUint32: () => 0 })).toBe(seats[0])
    expect(drawSeat(seats, { nextUint32: () => seats.length - 1 })).toBe(seats.at(-1))
    expect(new Set(seats.map((seat) => seat.rowLabel)).size).toBeGreaterThan(1)
    expect(new Set(seats.map((seat) => seat.number)).size).toBeGreaterThan(4)
  })

  it('国立文楽劇場の左右側席にある非対称な端部番号を公式範囲どおり生成する', () => {
    const venue = realVenues.find((item) => item.id === 'national-bunraku-theatre-standard')!
    const seats = generateVenueSeats(venue, venue.layouts[0])
    const has = (sectionId: string, rowLabel: string, number: number) => seats.some((seat) => seat.sectionId === sectionId && seat.rowLabel === rowLabel && seat.number === number)
    expect(has('left-seats', '1', 3)).toBe(true)
    expect(has('left-seats', '1', 2)).toBe(false)
    expect(has('right-seats', '1', 2)).toBe(true)
    expect(has('right-seats', '1', 3)).toBe(false)
    expect(has('left-seats', '2', 4)).toBe(true)
    expect(has('right-seats', '2', 1)).toBe(true)
    expect(has('right-seats', '2', 4)).toBe(false)
  })

  it('production一覧へのdemo混入を検出する', () => {
    expect(validateVenueData(demoVenue, true).map((issue) => issue.code)).toContain('demo-in-production')
  })

  it('情報源、確認日、内部総数の不整合を検出する', () => {
    const invalid = clone(realVenues[0])
    invalid.sources = []
    invalid.representativePattern.expectedSeatCount = 1
    const codes = validateVenueData(invalid).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['missing-source', 'seat-count-mismatch']))

    const badDate = clone(realVenues[1])
    badDate.sources[0].checkedAt = '2026-02-30'
    expect(validateVenueData(badDate).map((issue) => issue.code)).toContain('missing-checked-at')
  })

  it('部分データを示すproduction状態と複数パターン混在を検出する', () => {
    const invalid = clone(realVenues[0])
    invalid.representativePattern.name = 'sample subset'
    invalid.layouts.push(clone(invalid.layouts[0]))
    const codes = validateVenueData(invalid, true).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['partial-production-data', 'representative-layout-count', 'duplicate-layout-id']))
  })

  it('event-specificや抽選対象外エリアが代表パターンへ混入すると失敗する', () => {
    const invalid = clone(realVenues[0])
    invalid.layouts[0].sections[0].variability = 'event-specific'
    invalid.layouts[0].sections[1].includedInVenueLottery = false
    const codes = validateVenueData(invalid, true).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['event-specific-included', 'excluded-area-in-pattern', 'seat-count-mismatch']))
  })

  it('不正範囲、重複範囲、範囲外除外席を検出する', () => {
    const invalid: Venue = clone(realVenues[0])
    const row = invalid.layouts[0].sections[0].rows[0]
    row.seatRanges = [{ from: 5, to: 2 }, { from: 17, to: 28 }, { from: 20, to: 30 }]
    row.excludedSeats = [0, 999]
    const codes = validateVenueData(invalid).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['invalid-range', 'duplicate-seat-range', 'excluded-outside-range']))
  })

  it('production一覧の重複会場IDを検出する', () => {
    expect(validateProductionVenues([realVenues[0], clone(realVenues[0])]).map((issue) => issue.code)).toContain('duplicate-venue-id')
  })
})
