/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import catalogJson from './catalog.generated.json'
import { countRangeSeats, prepareVenueSampler, seatAtOffset } from '../../domain/seats/rangeSampler'
import type { VenueCatalogEntry, VenueSeatDefinition } from '../../types/venue'

const catalog = catalogJson as VenueCatalogEntry[]
const detailFor = async (venue: VenueCatalogEntry): Promise<VenueSeatDefinition> =>
  JSON.parse(await readFile(path.join(process.cwd(), 'public', venue.dataPath), 'utf8')) as VenueSeatDefinition

describe('production venue database', () => {
  it('東京10会場と既存大阪2会場を軽量catalogに収録する', () => {
    expect(catalog).toHaveLength(12)
    expect(catalog.filter((venue) => venue.prefecture === '東京都')).toHaveLength(10)
    expect(catalog.filter((venue) => venue.prefecture === '大阪府')).toHaveLength(2)
    expect(JSON.stringify(catalog)).not.toMatch(/source|checkedAt|ranges|https?:\/\//)
  })

  it('全production会場の圧縮range・総数・先頭中間末尾を検証する', async () => {
    for (const venue of catalog) {
      const definition = await detailFor(venue)
      const total = definition.ranges.reduce((sum, range) => sum + countRangeSeats(range), 0)
      expect(total, venue.id).toBe(venue.seatCount)
      expect(definition.totalSeatCount, venue.id).toBe(venue.seatCount)
      const prepared = prepareVenueSampler(definition)
      for (const offset of [0, Math.floor(total / 2), total - 1]) {
        const seat = seatAtOffset(prepared, venue, offset)
        expect(seat.number, `${venue.id}:${offset}`).toBeGreaterThan(0)
      }
    }
  })

  it('全sourceに根拠があり、completeで、座席重複がない', async () => {
    for (const venue of catalog) {
      const sourcePath = path.join(process.cwd(), 'data', 'venue-sources', `${venue.id}.json`)
      const source = JSON.parse(await readFile(sourcePath, 'utf8')) as {
        status: string
        sources: { url: string; checkedAt: string }[]
        representativePattern: { coverage: string; expectedSeatCount: number }
        ranges: { areaId?: string; rowLabel: string; from: number; to: number; excluded?: number[] }[]
      }
      expect(source.status, venue.id).toBe('production')
      expect(source.sources.length, venue.id).toBeGreaterThan(0)
      expect(source.sources.every((item) => item.url.startsWith('https://') && Boolean(item.checkedAt)), venue.id).toBe(true)
      expect(source.representativePattern.coverage, venue.id).toBe('complete')
      expect(source.representativePattern.expectedSeatCount, venue.id).toBe(venue.seatCount)
      const seats = new Set<string>()
      for (const range of source.ranges) {
        const excluded = new Set(range.excluded ?? [])
        for (let number = range.from; number <= range.to; number += 1) {
          if (excluded.has(number)) continue
          const key = `${range.areaId ?? ''}/${range.rowLabel}/${number}`
          expect(seats.has(key), `${venue.id}:${key}`).toBe(false)
          seats.add(key)
        }
      }
      expect(seats.size, venue.id).toBe(venue.seatCount)
    }
  })
})
