import type { LegacyVenueCatalogEntry, VenueRuntimeSelection, VenueSeatDefinition } from '../../types/venue'
import { prepareVenueSampler, type PreparedVenueSampler } from '../../domain/seats/rangeSampler'

const cache = new Map<string, PreparedVenueSampler>()

export const loadVenueSeatData = async (
  venue: LegacyVenueCatalogEntry | VenueRuntimeSelection,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<PreparedVenueSampler> => {
  const configurationId = 'configurationId' in venue ? venue.configurationId : undefined
  const venueGroupId = 'venueGroupId' in venue ? venue.venueGroupId : venue.id
  const cacheKey = configurationId ? `${venueGroupId}\0${configurationId}` : venue.id
  const cached = cache.get(cacheKey)
  if (cached) return cached
  const response = await fetcher(venue.dataPath, { signal })
  if (!response.ok) throw new Error(`Venue data request failed with HTTP ${response.status}.`)
  const definition = await response.json() as VenueSeatDefinition
  const identityMatches = definition.schemaVersion === 1
    ? !configurationId && definition.venueId === venue.id
    : definition.venueId === venueGroupId && definition.configurationId === configurationId
  if (!identityMatches || definition.totalSeatCount !== venue.seatCount) {
    throw new Error('Venue data response does not match the catalog.')
  }
  const prepared = prepareVenueSampler(definition)
  cache.set(cacheKey, prepared)
  return prepared
}

export const clearVenueSeatDataCache = () => cache.clear()
