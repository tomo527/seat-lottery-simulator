/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import fingerprintJson from '../../../data/venue-fingerprints/production.json'
import catalogJson from './catalog.generated.json'
import { countRangeSeats, prepareVenueSampler, seatAtOffset } from '../../domain/seats/rangeSampler'
import type { VenueCatalogEntry, VenueSeatDefinition } from '../../types/venue'

const catalog = catalogJson as VenueCatalogEntry[]
const legacyVenues = {
  'hakuju-hall-standard': { count: 300, samples: ['main/A/1', 'main/M/7', 'main/P/17'] },
  'hamarikyu-asahi-hall-standard': { count: 552, samples: ['first-floor/1/1', 'first-floor/14/13', 'second-floor-center/3/20'] },
  'iino-hall-standard': { count: 500, samples: ['main/A/4', 'main/I/21', 'main/Q/29'] },
  'kioi-small-hall-standard': { count: 250, samples: ['main/1/3', 'main/6/13', 'main/11/24'] },
  'kyocera-dome-osaka-standard-baseball': { count: 34522, samples: ['center-a-lower/001/1', 'third-base-lower/002/66', 'center-l-lower/029/130'] },
  'national-bunraku-theatre-standard': { count: 753, samples: ['center-seats/1/3', 'center-seats/11/30', 'right-seats/12/4'] },
  'oji-hall-standard': { count: 315, samples: ['main/A/1', 'main/F/6', 'main/P/16'] },
  'sumida-triphony-small-hall-standard': { count: 252, samples: ['main/1/1', 'main/8/15', 'main/16/14'] },
  'suntory-blue-rose-a': { count: 384, samples: ['main/1/1', 'main/9/1', 'main/16/24'] },
  'tokyo-fm-hall-a-stage': { count: 308, samples: ['main/A/1', 'main/G/11', 'main/M/23'] },
  'tokyo-geigeki-theatre-east-pattern-a': { count: 272, samples: ['main/A/3', 'main/G/13', 'main/N/22'] },
  'toppan-hall-standard': { count: 408, samples: ['main/A/1', 'main/H/16', 'main/S/21'] },
} as const
const fingerprintManifest = fingerprintJson as {
  manifestVersion: number
  reviewPolicy: string
  venues: Record<string, { count: number; samples: string[]; sha256: string }>
}
const protectedVenues = fingerprintManifest.venues
const detailFor = async (venue: VenueCatalogEntry): Promise<VenueSeatDefinition> =>
  JSON.parse(await readFile(path.join(process.cwd(), 'public', venue.dataPath), 'utf8')) as VenueSeatDefinition

describe('production venue database', () => {
  it('既存12会場を軽量catalogに維持する', () => {
    expect(catalog.map(({ id }) => id)).toEqual(expect.arrayContaining(Object.keys(legacyVenues)))
    expect(catalog.every((venue) => Boolean(venue.municipality))).toBe(true)
    expect(JSON.stringify(catalog)).not.toMatch(/source|checkedAt|ranges|https?:\/\//)
  })

  it('全production会場の圧縮range・総数・先頭中間末尾を検証する', async () => {
    for (const venue of catalog) {
      const definition = await detailFor(venue)
      expect(JSON.stringify(definition), `${venue.id}: runtime detail leak`).not.toMatch(
        /source|checkedAt|verification|completenessBasis|transformation|knownLimitations|https?:\/\//,
      )
      const total = definition.ranges.reduce((sum, range) => sum + countRangeSeats(range), 0)
      expect(total, venue.id).toBe(venue.seatCount)
      expect(definition.totalSeatCount, venue.id).toBe(venue.seatCount)
      const prepared = prepareVenueSampler(definition)
      const expected = protectedVenues[venue.id as keyof typeof protectedVenues]
      expect(expected?.samples, `${venue.id}: fingerprint offset samples`).toHaveLength(3)
      for (const [index, offset] of [0, Math.floor(total / 2), total - 1].entries()) {
        const seat = seatAtOffset(prepared, venue, offset)
        expect(seat.number, `${venue.id}:${offset}`).toBeGreaterThan(0)
        if (expected) {
          expect(total, venue.id).toBe(expected.count)
          expect(`${seat.sectionId}/${seat.rowLabel}/${seat.number}`, `${venue.id}:${offset}`).toBe(expected.samples[index])
        }
      }
    }
  })

  it('production fingerprint変更時はsnapshot更新で済ませず公式資料から独立再確認する', async () => {
    expect(fingerprintManifest.manifestVersion).toBe(1)
    expect(fingerprintManifest.reviewPolicy).toContain('公式資料から独立再確認')
    expect(Object.keys(fingerprintManifest.venues).sort()).toEqual(catalog.map(({ id }) => id).sort())
    for (const venue of catalog) {
      const sourcePath = path.join(process.cwd(), 'data', 'venue-sources', `${venue.id}.json`)
      const source = JSON.parse(await readFile(sourcePath, 'utf8')) as {
        status: string
        id: string
        name: string
        prefecture: string
        city: string
        aliases: string[]
        venueType: string
        sources: { id: string; official: boolean; roles: string[]; publisher: string; title: string; url: string; checkedAt: string }[]
        representativePattern: { id: string; name: string; coverage: string; expectedSeatCount: number }
        verification: { status: string; method: string; unresolvedIssues: string[] }
        ranges: { areaId?: string; rowLabel: string; from: number; to: number; excluded?: number[] }[]
      }
      expect(source.status, venue.id).toBe('production')
      expect(source.sources.length, venue.id).toBeGreaterThan(0)
      expect(source.sources.every((item) => item.official && item.roles.length > 0 && item.url.startsWith('https://') && Boolean(item.checkedAt)), venue.id).toBe(true)
      expect(source.representativePattern.coverage, venue.id).toBe('complete')
      expect(source.representativePattern.expectedSeatCount, venue.id).toBe(venue.seatCount)
      expect(source.verification.status, venue.id).toBe('verified')
      expect(source.verification.unresolvedIssues, venue.id).toEqual([])
      const expectedHash = fingerprintManifest.venues[venue.id]?.sha256
      expect(expectedHash, `${venue.id} must have a reviewed fingerprint`).toBeTruthy()
      if (expectedHash) {
        const semanticSnapshot = {
          id: source.id,
          name: source.name,
          prefecture: source.prefecture,
          city: source.city,
          aliases: source.aliases,
          venueType: source.venueType,
          pattern: {
            id: source.representativePattern.id,
            name: source.representativePattern.name,
            expectedSeatCount: source.representativePattern.expectedSeatCount,
          },
          calculatedSeatCount: source.ranges.reduce((sum, range) => sum + countRangeSeats(range), 0),
          sources: source.sources.map((item) => ({
            id: item.id,
            official: item.official,
            roles: [...item.roles].sort(),
            publisher: item.publisher,
            title: item.title,
            url: item.url,
            checkedAt: item.checkedAt,
          })),
          verificationMethod: source.verification.method,
          ranges: source.ranges.map((range) => ({
            areaId: range.areaId ?? 'main',
            rowLabel: range.rowLabel,
            from: range.from,
            to: range.to,
            excluded: [...(range.excluded ?? [])].sort((left, right) => left - right),
          })),
        }
        expect(createHash('sha256').update(JSON.stringify(semanticSnapshot)).digest('hex'), venue.id).toBe(expectedHash)
      }
    }
  })
})
