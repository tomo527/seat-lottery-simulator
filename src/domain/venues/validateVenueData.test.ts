import { describe, expect, it } from 'vitest'
import { realVenues } from '../../data/venues/realVenues'
import { demoVenue } from '../../data/venues/fixtures/demoVenue'
import { generateVenueSeats } from '../seats/venueSeats'
import type { Venue } from '../../types/venue'
import { countRegisteredSeats, validateProductionVenues, validateVenueData } from './validateVenueData'

const clone = <T,>(value: T): T => structuredClone(value)

describe('venue data validation', () => {
  it('全production会場が情報源・確認日・有効座席を持ち、demoを含まない', () => {
    expect(validateProductionVenues(realVenues)).toEqual([])
    expect(realVenues).toHaveLength(3)
    for (const venue of realVenues) {
      expect(venue.seatDataAccuracy).not.toBe('demo')
      expect(venue.sources.length).toBeGreaterThan(0)
      expect(venue.sources.every((source) => /^https:\/\//.test(source.url))).toBe(true)
      expect(venue.sources.every((source) => /^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt))).toBe(true)
      expect(countRegisteredSeats(venue)).toBeGreaterThan(0)
    }
    const counts = Object.fromEntries(realVenues.map((venue) => [venue.id, countRegisteredSeats(venue)]))
    console.info('[venue-data] production venue and registered seat counts', counts)
  })

  it('東京国際フォーラムの偶数列に存在しない28番を生成しない', () => {
    const venue = realVenues.find((item) => item.id === 'tokyo-international-forum-hall-c')!
    const seats = generateVenueSeats(venue, venue.layouts[0])
    expect(seats).toHaveLength(150)
    expect(seats.some((seat) => seat.rowLabel === '2' && seat.number === 28)).toBe(false)
    expect(seats.some((seat) => seat.rowLabel === '1' && seat.number === 28)).toBe(true)
  })

  it('production一覧へのdemo混入を検出する', () => {
    expect(validateVenueData(demoVenue, true).map((issue) => issue.code)).toContain('demo-in-production')
  })

  it('実在会場のsource URLとcheckedAt欠落を検出する', () => {
    const missing = clone(realVenues[0])
    missing.sources = []
    expect(validateVenueData(missing).map((issue) => issue.code)).toEqual(expect.arrayContaining(['missing-source', 'exact-without-source']))

    const badDate = clone(realVenues[1])
    badDate.sources[0].checkedAt = ''
    expect(validateVenueData(badDate).map((issue) => issue.code)).toContain('missing-checked-at')
  })

  it('存在しない日付・不完全なsource・精度と描画方式の不整合を検出する', () => {
    const invalid = clone(realVenues[0])
    invalid.sources[0].publisher = ''
    invalid.sources[0].checkedAt = '2026-02-30'
    invalid.seatMapPresentation = 'seat-grid'
    const codes = validateVenueData(invalid).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['incomplete-source', 'missing-checked-at', 'presentation-mismatch']))
  })

  it('event-specific席が抽選対象なら検出する', () => {
    const invalid = clone(realVenues[1])
    invalid.layouts[0].sections.find((area) => area.variability === 'event-specific')!.includedInVenueLottery = true
    expect(validateVenueData(invalid).map((issue) => issue.code)).toContain('event-specific-included')
  })

  it('official-rangeのmap座標を検出する', () => {
    const invalid = clone(realVenues[2])
    invalid.layouts[0].sections[0].map = { x: 1, y: 1, width: 10, height: 10 }
    expect(validateVenueData(invalid).map((issue) => issue.code)).toContain('range-has-map')
  })

  it('重複ID・列ラベル、範囲外map、event-specificの除外理由欠落を検出する', () => {
    const invalid = clone(realVenues[1])
    invalid.layouts[0].sections[0].map = { x: 95, y: 70, width: 10, height: 10 }
    invalid.layouts[0].sections[0].rows.push(clone(invalid.layouts[0].sections[0].rows[0]))
    invalid.layouts[0].sections[1].id = invalid.layouts[0].sections[0].id
    invalid.layouts[0].sections[1].exclusionReason = ''
    const codes = validateVenueData(invalid).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['invalid-map-bounds', 'duplicate-row-label', 'duplicate-area-id', 'missing-exclusion-reason']))
  })

  it('production一覧の重複会場IDを検出する', () => {
    expect(validateProductionVenues([realVenues[0], clone(realVenues[0])]).map((issue) => issue.code)).toContain('duplicate-venue-id')
  })

  it('不正範囲・重複range・範囲外excludedSeatsを検出する', () => {
    const invalid: Venue = clone(realVenues[0])
    const row = invalid.layouts[0].sections[0].rows[0]
    row.seatRanges = [{ from: 5, to: 2 }, { from: 17, to: 28 }, { from: 20, to: 30 }]
    row.excludedSeats = [0, 999]
    const codes = validateVenueData(invalid).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['invalid-range', 'duplicate-seat-range', 'excluded-outside-range']))
  })
})
