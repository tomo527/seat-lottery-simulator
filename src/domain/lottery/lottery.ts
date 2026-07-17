import type { Seat } from '../../types/venue'
import { cryptoRandomSource, randomInt, type RandomSource } from './random'

export const drawSeat = (seats: readonly Seat[], source: RandomSource = cryptoRandomSource): Seat => {
  if (seats.length === 0) throw new RangeError('No valid seats are available.')
  return seats[randomInt(seats.length, source)]
}

export const formatSeatLabel = (seat: Seat): string =>
  `${seat.sectionLabel ? `${seat.sectionLabel} ` : ''}${seat.rowLabel}列 ${seat.number}番`
