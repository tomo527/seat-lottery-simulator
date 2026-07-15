import type { Seat, Venue, VenueLayout } from '../../types/venue'

export const generateVenueSeats = (venue: Venue, layout: VenueLayout): Seat[] => {
  const seats: Seat[] = []
  for (const section of layout.sections) {
    for (const row of section.rows) {
      const excluded = new Set(row.excludedSeats ?? [])
      for (const range of row.seatRanges) {
        if (!Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from <= 0 || range.from > range.to) continue
        for (let number = range.from; number <= range.to; number += 1) {
          if (!excluded.has(number)) {
            seats.push({
              venueId: venue.id,
              venueName: venue.name,
              layoutId: layout.id,
              layoutName: layout.name,
              sectionId: section.id,
              sectionLabel: section.label,
              rowLabel: row.label,
              number,
            })
          }
        }
      }
    }
  }
  return seats
}
