import type { VenueCatalogEntry, VenueSeatDefinition } from '../../types/venue'
import { prepareVenueSampler, type PreparedVenueSampler } from '../../domain/seats/rangeSampler'

const cache = new Map<string, PreparedVenueSampler>()

export const loadVenueSeatData = async (
  venue: VenueCatalogEntry,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<PreparedVenueSampler> => {
  const cached = cache.get(venue.id)
  if (cached) return cached
  const response = await fetcher(venue.dataPath, { signal })
  if (!response.ok) throw new Error(`Venue data request failed with HTTP ${response.status}.`)
  const definition = await response.json() as VenueSeatDefinition
  if (definition.schemaVersion !== 1 || definition.venueId !== venue.id || definition.totalSeatCount !== venue.seatCount) {
    throw new Error('Venue data response does not match the catalog.')
  }
  const prepared = prepareVenueSampler(definition)
  cache.set(venue.id, prepared)
  return prepared
}

export const clearVenueSeatDataCache = () => cache.clear()
