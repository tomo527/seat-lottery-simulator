import type { Seat } from '../../types/venue'
import { cryptoRandomSource, randomInt, type RandomSource } from './random'

export type LotteryMode = 'seat-only' | 'chance-and-seat'
export type LotteryResult = { status: 'won'; seat: Seat } | { status: 'lost' }

export const drawSeat = (seats: readonly Seat[], source: RandomSource = cryptoRandomSource): Seat => {
  if (seats.length === 0) throw new RangeError('No valid seats are available.')
  return seats[randomInt(seats.length, source)]
}

export const determineWin = (probabilityPercent: number, source: RandomSource = cryptoRandomSource): boolean => {
  if (!Number.isFinite(probabilityPercent) || probabilityPercent < 0 || probabilityPercent > 100) {
    throw new RangeError('Probability must be between 0 and 100.')
  }
  if (probabilityPercent === 0) return false
  if (probabilityPercent === 100) return true
  return randomInt(1_000_000, source) < Math.round(probabilityPercent * 10_000)
}

export const runLottery = (
  mode: LotteryMode,
  seats: readonly Seat[],
  probabilityPercent: number,
  source: RandomSource = cryptoRandomSource,
): LotteryResult => {
  if (mode === 'chance-and-seat' && !determineWin(probabilityPercent, source)) return { status: 'lost' }
  return { status: 'won', seat: drawSeat(seats, source) }
}

export const formatSeatLabel = (seat: Seat): string =>
  `${seat.sectionLabel} ${seat.rowLabel}列 ${seat.number}番`
