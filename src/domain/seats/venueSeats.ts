import type { Seat, Venue, VenueLayout } from '../../types/venue'

export const generateVenueSeats = (venue: Venue, layout: VenueLayout): Seat[] => {
  const seats: Seat[] = []
  const generated = new Set<string>()
  for (const section of layout.sections) {
    if (!section.includedInVenueLottery || section.variability === 'event-specific') continue
    for (const row of section.rows) {
      const excluded = new Set(row.excludedSeats ?? [])
      for (const range of row.seatRanges) {
        if (!Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from <= 0 || range.from > range.to) continue
        for (let number = range.from; number <= range.to; number += 1) {
          const key = `${section.id}\u0000${row.label}\u0000${number}`
          if (!excluded.has(number) && !generated.has(key)) {
            generated.add(key)
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
