export type VenueType = 'theater' | 'hall' | 'arena' | 'stadium' | 'dome'

export type VenueCatalogEntry = {
  id: string
  name: string
  searchAliases: string[]
  region: string
  prefecture: string
  municipality: string
  venueType: VenueType
  representativePatternName: string
  seatCount: number
  dataPath: string
}

export type VenueSeatRange = {
  areaId?: string
  rowLabel: string
  from: number
  to: number
  excluded?: number[]
}

export type VenueSeatDefinition = {
  schemaVersion: 1
  venueId: string
  patternId: string
  areas?: Record<string, string>
  ranges: VenueSeatRange[]
  totalSeatCount: number
}

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
