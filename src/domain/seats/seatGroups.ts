import type { LegacyVenueCatalogEntry, Seat, VenueRuntimeSelection, VenueSeatRange } from '../../types/venue'
import { cryptoRandomSource, randomInt, type RandomSource } from '../lottery/random'
import { buildSeat, type PreparedVenueSampler } from './rangeSampler'

export const MAX_TICKET_COUNT = 4
export const TICKET_COUNT_OPTIONS = [1, 2, 3, 4] as const
export type TicketCount = (typeof TICKET_COUNT_OPTIONS)[number]

export const isTicketCount = (value: number): value is TicketCount =>
  TICKET_COUNT_OPTIONS.includes(value as TicketCount)

// 同一エリア・同一列で、欠番をまたがずに連続する座席番号のかたまり。
export type SeatRun = { areaId: string; rowLabel: string; from: number; to: number }

const runKey = (areaId: string, rowLabel: string) => `${areaId}\u0000${rowLabel}`

const rangeSegments = (range: VenueSeatRange): [number, number][] => {
  const excluded = [...new Set(range.excluded ?? [])].sort((left, right) => left - right)
  const segments: [number, number][] = []
  let start = range.from
  for (const number of excluded) {
    if (number < start || number > range.to) continue
    if (number > start) segments.push([start, number - 1])
    start = number + 1
  }
  if (start <= range.to) segments.push([start, range.to])
  return segments
}

export const buildSeatRuns = (ranges: readonly VenueSeatRange[]): SeatRun[] => {
  const rows = new Map<string, { areaId: string; rowLabel: string; segments: [number, number][] }>()
  for (const range of ranges) {
    const areaId = range.areaId ?? 'main'
    const key = runKey(areaId, range.rowLabel)
    const row = rows.get(key) ?? { areaId, rowLabel: range.rowLabel, segments: [] }
    row.segments.push(...rangeSegments(range))
    rows.set(key, row)
  }

  const runs: SeatRun[] = []
  for (const row of rows.values()) {
    const sorted = [...row.segments].sort((left, right) => left[0] - right[0])
    let current: [number, number] | null = null
    for (const [from, to] of sorted) {
      // 同じ列の別rangeでも番号が隣接していれば1つの連番として扱い、欠番があれば切る。
      if (current && from <= current[1] + 1) current[1] = Math.max(current[1], to)
      else {
        if (current) runs.push({ areaId: row.areaId, rowLabel: row.rowLabel, from: current[0], to: current[1] })
        current = [from, to]
      }
    }
    if (current) runs.push({ areaId: row.areaId, rowLabel: row.rowLabel, from: current[0], to: current[1] })
  }
  return runs
}

export const buildSeatRunsFromSeats = (seats: readonly Seat[]): Seat[][] => {
  const rows = new Map<string, Seat[]>()
  for (const seat of seats) {
    const key = runKey(seat.sectionId, seat.rowLabel)
    const row = rows.get(key) ?? []
    row.push(seat)
    rows.set(key, row)
  }

  const runs: Seat[][] = []
  for (const row of rows.values()) {
    const sorted = [...row].sort((left, right) => left.number - right.number)
    let current: Seat[] = []
    for (const seat of sorted) {
      const previous = current.at(-1)
      if (previous && seat.number === previous.number) continue
      if (previous && seat.number === previous.number + 1) current.push(seat)
      else {
        if (current.length > 0) runs.push(current)
        current = [seat]
      }
    }
    if (current.length > 0) runs.push(current)
  }
  return runs
}

const groupsInRun = (runLength: number, size: number) => Math.max(0, runLength - size + 1)

const countGroups = (runLengths: readonly number[], size: number): number =>
  runLengths.reduce((total, length) => total + groupsInRun(length, size), 0)

// 有効な連番グループ全体から一様に選ぶため、開始位置ごとの候補数を数えてから抽選する。
const pickGroup = (runLengths: readonly number[], size: number, source: RandomSource): { runIndex: number; offset: number } => {
  const total = countGroups(runLengths, size)
  if (total <= 0) throw new RangeError('No consecutive seat group is available.')
  let index = randomInt(total, source)
  for (const [runIndex, length] of runLengths.entries()) {
    const groups = groupsInRun(length, size)
    if (index < groups) return { runIndex, offset: index }
    index -= groups
  }
  throw new RangeError('No consecutive seat group is available.')
}

const assertSize = (size: number) => {
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_TICKET_COUNT) {
    throw new RangeError(`Seat group size must be an integer from 1 through ${MAX_TICKET_COUNT}.`)
  }
}

const venueRunCache = new WeakMap<PreparedVenueSampler, SeatRun[]>()

export const venueSeatRuns = (prepared: PreparedVenueSampler): SeatRun[] => {
  const cached = venueRunCache.get(prepared)
  if (cached) return cached
  const runs = buildSeatRuns(prepared.definition.ranges)
  venueRunCache.set(prepared, runs)
  return runs
}

export const countVenueSeatGroups = (prepared: PreparedVenueSampler, size: number): number => {
  assertSize(size)
  return countGroups(venueSeatRuns(prepared).map((run) => run.to - run.from + 1), size)
}

export const drawVenueSeatGroup = (
  prepared: PreparedVenueSampler,
  venue: LegacyVenueCatalogEntry | VenueRuntimeSelection,
  size: number,
  source: RandomSource = cryptoRandomSource,
): Seat[] => {
  assertSize(size)
  const runs = venueSeatRuns(prepared)
  const { runIndex, offset } = pickGroup(runs.map((run) => run.to - run.from + 1), size, source)
  const run = runs[runIndex]
  return Array.from({ length: size }, (_, index) =>
    buildSeat(prepared.definition, venue, run.areaId, run.rowLabel, run.from + offset + index))
}

export const countSeatGroups = (seats: readonly Seat[], size: number): number => {
  assertSize(size)
  return countGroups(buildSeatRunsFromSeats(seats).map((run) => run.length), size)
}

export const drawSeatGroup = (seats: readonly Seat[], size: number, source: RandomSource = cryptoRandomSource): Seat[] => {
  assertSize(size)
  const runs = buildSeatRunsFromSeats(seats)
  const { runIndex, offset } = pickGroup(runs.map((run) => run.length), size, source)
  return runs[runIndex].slice(offset, offset + size)
}
