import type { Seat } from '../../types/venue'
import { cryptoRandomSource, randomInt, type RandomSource } from './random'

export const drawSeat = (seats: readonly Seat[], source: RandomSource = cryptoRandomSource): Seat => {
  if (seats.length === 0) throw new RangeError('No valid seats are available.')
  return seats[randomInt(seats.length, source)]
}

export const formatRowLabel = (rowLabel: string): string => {
  const normalized = rowLabel.trim()
  return normalized.endsWith('列') ? normalized : `${normalized}列`
}

export const formatSeatNumber = (seatNumber: number | string): string => {
  const normalized = String(seatNumber).trim()
  return normalized.endsWith('番') ? normalized : `${normalized}番`
}

export const formatSeatLabel = (seat: Seat): string =>
  `${seat.sectionLabel ? `${seat.sectionLabel} ` : ''}${formatRowLabel(seat.rowLabel)} ${formatSeatNumber(seat.number)}`
