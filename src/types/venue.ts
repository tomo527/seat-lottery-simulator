export const REGIONS = [
  '北海道・東北',
  '関東',
  '中部',
  '近畿',
  '中国・四国',
  '九州・沖縄',
] as const

export type Region = (typeof REGIONS)[number]
export type VenueAccuracy = 'demo' | 'approximate' | 'verified'

export type VenueSeatRange = {
  from: number
  to: number
}

export type VenueRow = {
  label: string
  seatRanges: VenueSeatRange[]
  excludedSeats?: number[]
}

export type VenueSection = {
  id: string
  label: string
  map: {
    x: number
    y: number
    width: number
    height: number
    shape: 'rectangle' | 'rounded' | 'arc'
    rotation?: number
  }
  rows: VenueRow[]
}

export type VenueLayout = {
  id: string
  name: string
  stageLabel?: string
  sections: VenueSection[]
}

export type Venue = {
  id: string
  name: string
  region: Region
  prefecture?: string
  city?: string
  description?: string
  approximateCapacity?: number
  accuracy: VenueAccuracy
  notice: string
  source?: {
    title: string
    url: string
    checkedAt: string
  }
  layouts: VenueLayout[]
}

export type Seat = {
  venueId: string
  venueName: string
  layoutId: string
  layoutName: string
  sectionId: string
  sectionLabel: string
  rowLabel: string
  number: number
}
