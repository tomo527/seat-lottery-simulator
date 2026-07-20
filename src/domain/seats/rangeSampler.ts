import { cryptoRandomSource, randomInt, type RandomSource } from '../lottery/random'
import type { Seat, VenueCatalogEntry, VenueSeatDefinition, VenueSeatRange } from '../../types/venue'

export const countRangeSeats = (range: VenueSeatRange): number => {
  const excluded = new Set(range.excluded ?? [])
  return range.to - range.from + 1 - excluded.size
}

export type PreparedVenueSampler = {
  definition: VenueSeatDefinition
  cumulativeCounts: number[]
  totalSeatCount: number
}

export const prepareVenueSampler = (definition: VenueSeatDefinition): PreparedVenueSampler => {
  let total = 0
  const cumulativeCounts = definition.ranges.map((range) => {
    total += countRangeSeats(range)
    return total
  })
  if (total <= 0 || total !== definition.totalSeatCount) throw new RangeError('Venue seat count is invalid.')
  return { definition, cumulativeCounts, totalSeatCount: total }
}

const resolveSeatNumber = (range: VenueSeatRange, offset: number): number => {
  let number = range.from + offset
  for (const excluded of [...(range.excluded ?? [])].sort((left, right) => left - right)) {
    if (excluded > number) break
    number += 1
  }
  if (number <= range.to) return number
  throw new RangeError('Seat offset is outside the range.')
}

export const seatAtOffset = (prepared: PreparedVenueSampler, venue: VenueCatalogEntry, offset: number): Seat => {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset >= prepared.totalSeatCount) throw new RangeError('Seat offset is invalid.')
  let low = 0
  let high = prepared.cumulativeCounts.length - 1
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (offset < prepared.cumulativeCounts[middle]) high = middle
    else low = middle + 1
  }
  const range = prepared.definition.ranges[low]
  const previousTotal = low === 0 ? 0 : prepared.cumulativeCounts[low - 1]
  const areaId = range.areaId ?? 'main'
  return {
    venueId: venue.id,
    venueName: venue.name,
    layoutId: prepared.definition.patternId,
    layoutName: venue.representativePatternName,
    sectionId: areaId,
    sectionLabel: prepared.definition.areas?.[areaId],
    rowLabel: range.rowLabel,
    number: resolveSeatNumber(range, offset - previousTotal),
  }
}

export const drawVenueSeat = (prepared: PreparedVenueSampler, venue: VenueCatalogEntry, source: RandomSource = cryptoRandomSource): Seat =>
  seatAtOffset(prepared, venue, randomInt(prepared.totalSeatCount, source))
