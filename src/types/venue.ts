export type VenueType = 'theater' | 'hall' | 'arena' | 'stadium' | 'dome'

export type VenueCatalogBase = {
  id: string
  name: string
  searchAliases: string[]
  region: string
  prefecture: string
  municipality: string
  venueType: VenueType
}

export type LegacyVenueCatalogEntry = VenueCatalogBase & {
  schemaVersion?: 1
  representativePatternName: string
  seatCount: number
  dataPath: string
}

export type VenueConfigurationCatalogEntry = {
  id: string
  canonicalName: string
  seatCount: number
  dataPath: string
  scope: 'full-venue' | 'official-variant' | 'fixed-only'
  scopeDisclosure: string
  fixedOnly: boolean
}

export type MultiConfigurationVenueCatalogEntry = VenueCatalogBase & {
  schemaVersion: 2
  venueGroupId: string
  configurations: VenueConfigurationCatalogEntry[]
}

export type VenueCatalogEntry = LegacyVenueCatalogEntry | MultiConfigurationVenueCatalogEntry

export type VenueRuntimeSelection = LegacyVenueCatalogEntry & {
  venueGroupId: string
  configurationId?: string
  scopeDisclosure?: string
  fixedOnly?: boolean
}

export type VenueSeatRange = {
  areaId?: string
  rowLabel: string
  from: number
  to: number
  excluded?: number[]
}

export type LegacyVenueSeatDefinition = {
  schemaVersion: 1
  venueId: string
  patternId: string
  areas?: Record<string, string>
  ranges: VenueSeatRange[]
  totalSeatCount: number
}

export type MultiConfigurationVenueSeatDefinition = {
  schemaVersion: 2
  venueId: string
  venueGroupId: string
  configurationId: string
  configurationName: string
  scope: 'full-venue' | 'official-variant' | 'fixed-only'
  scopeDisclosure: string
  areas?: Record<string, string>
  ranges: VenueSeatRange[]
  totalSeatCount: number
}

export type VenueSeatDefinition = LegacyVenueSeatDefinition | MultiConfigurationVenueSeatDefinition

export type Seat = {
  venueId: string
  venueName: string
  layoutId: string
  layoutName: string
  sectionId: string
  sectionLabel?: string
  rowLabel: string
  number: number
}
