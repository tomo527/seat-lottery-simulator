import type { VenueCatalogEntry, VenueRuntimeSelection } from '../../types/venue'

export const isMultiConfigurationVenue = (venue: VenueCatalogEntry) => venue.schemaVersion === 2

export const venueSeatCountLabel = (venue: VenueCatalogEntry) => isMultiConfigurationVenue(venue)
  ? venue.configurations.reduce((total, configuration) => Math.max(total, configuration.seatCount), 0)
  : venue.seatCount

export const resolveVenueSelection = (
  venue: VenueCatalogEntry | undefined,
  configurationId?: string,
): VenueRuntimeSelection | undefined => {
  if (!venue) return undefined
  if (!isMultiConfigurationVenue(venue)) return { ...venue, venueGroupId: venue.id }
  const configuration = venue.configurations.length === 1
    ? venue.configurations[0]
    : venue.configurations.find((candidate) => candidate.id === configurationId)
  if (!configuration) return undefined
  return {
    id: venue.id,
    venueGroupId: venue.venueGroupId,
    configurationId: configuration.id,
    name: venue.name,
    searchAliases: venue.searchAliases,
    region: venue.region,
    prefecture: venue.prefecture,
    municipality: venue.municipality,
    venueType: venue.venueType,
    representativePatternName: configuration.canonicalName,
    seatCount: configuration.seatCount,
    dataPath: configuration.dataPath,
    scopeDisclosure: configuration.scopeDisclosure,
    fixedOnly: configuration.fixedOnly,
  }
}
