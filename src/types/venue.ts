export const REGIONS = [
  '北海道・東北',
  '関東',
  '中部',
  '近畿',
  '中国・四国',
  '九州・沖縄',
] as const

export type Region = (typeof REGIONS)[number]

export type SeatDataAccuracy =
  | 'official-exact'
  | 'official-structure'
  | 'official-range'
  | 'demo'

export type SeatMapPresentation =
  | 'verified-section-map'
  | 'seat-grid'
  | 'summary-only'

export type SeatAreaVariability = 'fixed' | 'venue-pattern' | 'event-specific'

export type VenueSeatDataSource = {
  kind: 'venue-official' | 'facility-manager' | 'organizer-official' | 'event-official'
  publisher: string
  title: string
  url: string
  checkedAt: string
}

export type VenueSeatRange = {
  from: number
  to: number
}

export type VenueRow = {
  label: string
  seatRanges: VenueSeatRange[]
  excludedSeats?: number[]
}

export type VenueSeatArea = {
  id: string
  label?: string
  variability: SeatAreaVariability
  includedInVenueLottery: boolean
  exclusionReason?: string
  map?: {
    x: number
    y: number
    width: number
    height: number
  }
  rows: VenueRow[]
}

export type VenueLayout = {
  id: string
  name: string
  sections: VenueSeatArea[]
}

export type Venue = {
  id: string
  name: string
  region: Region
  prefecture?: string
  city?: string
  description?: string
  approximateCapacity?: number
  seatDataAccuracy: SeatDataAccuracy
  seatMapPresentation: SeatMapPresentation
  seatDataScope: string
  notice: string
  variabilityNotice?: string
  sources: VenueSeatDataSource[]
  layouts: VenueLayout[]
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
