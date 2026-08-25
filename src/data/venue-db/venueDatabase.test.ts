/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import fingerprintJson from '../../../data/venue-fingerprints/production.json'
import catalogJson from './catalog.generated.json'
import { countRangeSeats, prepareVenueSampler, seatAtOffset } from '../../domain/seats/rangeSampler'
import { isMultiConfigurationVenue, resolveVenueSelection } from './catalog'
import {
  HTTP_ONLY_OFFICIAL_WAIVER_KEY,
  evaluateRecordedUrlTransport,
  type HttpOnlyOfficialWaiver,
} from '../../../scripts/venues/source-transport.mjs'
import type { VenueCatalogEntry, VenueRuntimeSelection, VenueSeatDefinition } from '../../types/venue'

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
type Fingerprint = { count: number; samples: string[]; sha256: string }
type SourceReference = {
  id: string
  official: boolean
  roles: string[]
  publisher: string
  title: string
  url: string
  checkedAt: string
  httpOnlyOfficial?: HttpOnlyOfficialWaiver
}
type SourceRange = { areaId?: string; rowLabel: string; from: number; to: number; excluded?: number[] }
type V2ConfigurationSource = {
  id: string
  canonicalName: string
  status: string
  selectable: boolean
  expectedSeatCount: number
  sourceIds: string[]
  sourceGeneration: string
  wheelchairSemantics: unknown
  verification: { status: string; method: string; rangeDiff?: number | null; unresolvedIssues: string[] }
  ranges: SourceRange[]
}
type V2VenueSource = {
  schemaVersion: 2
  status: string
  id: string
  sources: SourceReference[]
  configurations: V2ConfigurationSource[]
}
type LegacyVenueSource = {
  schemaVersion?: 1
  status: string
  id: string
  name: string
  prefecture: string
  city: string
  aliases: string[]
  venueType: string
  sources: SourceReference[]
  representativePattern: { id: string; name: string; coverage: string; expectedSeatCount: number }
  verification: { status: string; method: string; rangeDiff?: number | null; unresolvedIssues: string[] }
  ranges: SourceRange[]
}
type VenueSource = V2VenueSource | LegacyVenueSource
const fingerprintManifest = fingerprintJson as {
  manifestVersion: number
  reviewPolicy: string
  venues: Record<string, Fingerprint | { schemaVersion: 2; configurations: Record<string, Fingerprint> }>
}
const protectedVenues = fingerprintManifest.venues
const detailFor = async (venue: VenueRuntimeSelection): Promise<VenueSeatDefinition> =>
  JSON.parse(await readFile(path.join(process.cwd(), 'public', venue.dataPath), 'utf8')) as VenueSeatDefinition
const selectionsFor = (venue: VenueCatalogEntry): VenueRuntimeSelection[] => isMultiConfigurationVenue(venue)
  ? venue.configurations.map(({ id }) => resolveVenueSelection(venue, id)!).filter(Boolean)
  : [resolveVenueSelection(venue)!]

describe('production venue database', () => {
  it('既存12会場を軽量catalogに維持する', () => {
    expect(catalog.map(({ id }) => id)).toEqual(expect.arrayContaining(Object.keys(legacyVenues)))
    expect(catalog.every((venue) => Boolean(venue.municipality))).toBe(true)
    expect(JSON.stringify(catalog)).not.toMatch(/source|checkedAt|ranges|https?:\/\//)
  })

  it('全production会場の圧縮range・総数・先頭中間末尾を検証する', async () => {
    for (const venueGroup of catalog) {
      for (const venue of selectionsFor(venueGroup)) {
        const definition = await detailFor(venue)
        expect(JSON.stringify(definition), `${venue.id}: runtime detail leak`).not.toMatch(
          /source|checkedAt|verification|completenessBasis|transformation|knownLimitations|https?:\/\//,
        )
        const total = definition.ranges.reduce((sum, range) => sum + countRangeSeats(range), 0)
        expect(total, venue.id).toBe(venue.seatCount)
        expect(definition.totalSeatCount, venue.id).toBe(venue.seatCount)
        const prepared = prepareVenueSampler(definition)
        const manifestEntry = protectedVenues[venue.id]
        const expected = 'configurationId' in venue && venue.configurationId && manifestEntry && 'configurations' in manifestEntry
          ? manifestEntry.configurations[venue.configurationId]
          : manifestEntry as Fingerprint
        expect(expected?.samples, `${venue.id}: fingerprint offset samples`).toHaveLength(3)
        for (const [index, offset] of [0, Math.floor(total / 2), total - 1].entries()) {
          const seat = seatAtOffset(prepared, venue, offset)
          expect(seat.number, `${venue.id}:${offset}`).toBeGreaterThanOrEqual(0)
          if (expected) {
            expect(total, venue.id).toBe(expected.count)
            expect(`${seat.sectionId}/${seat.rowLabel}/${seat.number}`, `${venue.id}:${offset}`).toBe(expected.samples[index])
          }
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
      const source = JSON.parse(await readFile(sourcePath, 'utf8')) as VenueSource
      expect(source.status, venue.id).toBe('production')
      expect(source.sources.length, venue.id).toBeGreaterThan(0)
      expect(source.sources.every((item) => item.official && item.roles.length > 0 && Boolean(item.checkedAt)), venue.id).toBe(true)
      // Transport is judged by the shared policy, not a second copy of the rule: HTTPS stays
      // mandatory, and an http:// provenance URL passes only under a complete official waiver.
      for (const item of source.sources) {
        const transport = evaluateRecordedUrlTransport({
          url: item.url,
          official: item.official,
          waiver: item[HTTP_ONLY_OFFICIAL_WAIVER_KEY],
          prefix: venue.id,
          field: 'URL',
          today: new Date(),
          httpsRequiredMessage: `${venue.id} URL must use HTTPS`,
        })
        expect(transport.errors, `${venue.id}/${item.id}`).toEqual([])
      }
      if (source.schemaVersion === 2) {
        const manifestEntry = fingerprintManifest.venues[venue.id]
        expect(manifestEntry && 'configurations' in manifestEntry ? Object.keys(manifestEntry.configurations).sort() : [], venue.id)
          .toEqual(source.configurations.filter((item) => item.status === 'production' && item.selectable).map((item) => item.id).sort())
        expect(manifestEntry && 'configurations' in manifestEntry ? manifestEntry.schemaVersion : undefined, venue.id).toBe(2)
        for (const configuration of source.configurations.filter((item) => item.status === 'production' && item.selectable)) {
          expect(['reviewed', 'verified'], venue.id + '/' + configuration.id).toContain(configuration.verification.status)
          expect(Array.isArray(configuration.verification.unresolvedIssues), venue.id + '/' + configuration.id).toBe(true)
          const expected = manifestEntry && 'configurations' in manifestEntry ? manifestEntry.configurations[configuration.id] : undefined
          expect(expected?.count, venue.id + '/' + configuration.id)
            .toBe(configuration.ranges.reduce((sum, range) => sum + countRangeSeats(range), 0))
          const semanticSnapshot = {
            venueId: source.id,
            configurationId: configuration.id,
            canonicalName: configuration.canonicalName,
            expectedSeatCount: configuration.expectedSeatCount,
            calculatedSeatCount: configuration.ranges.reduce((sum, range) => sum + countRangeSeats(range), 0),
            sourceIds: [...configuration.sourceIds].sort(),
            sourceGeneration: configuration.sourceGeneration,
            wheelchairSemantics: configuration.wheelchairSemantics,
            verificationMethod: configuration.verification.method,
            ranges: configuration.ranges.map((range) => ({
              areaId: range.areaId ?? 'main',
              rowLabel: range.rowLabel,
              from: range.from,
              to: range.to,
              excluded: [...(range.excluded ?? [])].sort((left: number, right: number) => left - right),
            })),
          }
          expect(createHash('sha256').update(JSON.stringify(semanticSnapshot)).digest('hex'), venue.id + '/' + configuration.id).toBe(expected?.sha256)
        }
        continue
      }
      const legacySource = source
      expect(legacySource.representativePattern.coverage, venue.id).toBe('complete')
      const calculatedSeatCount = legacySource.ranges.reduce((sum, range) => sum + countRangeSeats(range), 0)
      expect(calculatedSeatCount, venue.id).toBe('seatCount' in venue ? venue.seatCount : undefined)
      if (legacySource.verification.rangeDiff !== undefined && legacySource.verification.rangeDiff !== null) {
        expect(legacySource.verification.rangeDiff, venue.id)
          .toBe(calculatedSeatCount - legacySource.representativePattern.expectedSeatCount)
      }
      expect(legacySource.verification.status, venue.id).toBe('verified')
      expect(legacySource.verification.unresolvedIssues, venue.id).toEqual([])
      const legacyFingerprint = fingerprintManifest.venues[venue.id] as Fingerprint
      const expectedHash = legacyFingerprint?.sha256
      expect(expectedHash, `${venue.id} must have a reviewed fingerprint`).toBeTruthy()
      if (expectedHash) {
        const semanticSnapshot = {
          id: legacySource.id,
          name: legacySource.name,
          prefecture: legacySource.prefecture,
          city: legacySource.city,
          aliases: legacySource.aliases,
          venueType: legacySource.venueType,
          pattern: {
            id: legacySource.representativePattern.id,
            name: legacySource.representativePattern.name,
            expectedSeatCount: legacySource.representativePattern.expectedSeatCount,
          },
          calculatedSeatCount,
          sources: legacySource.sources.map((item) => ({
            id: item.id,
            official: item.official,
            roles: [...item.roles].sort(),
            publisher: item.publisher,
            title: item.title,
            url: item.url,
            checkedAt: item.checkedAt,
          })),
          verificationMethod: legacySource.verification.method,
          ranges: legacySource.ranges.map((range) => ({
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
