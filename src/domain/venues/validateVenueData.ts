import type { Venue, VenueSeatRange } from '../../types/venue.js'

export type VenueDataIssue = {
  venueId: string
  code: string
  message: string
}

const isValidSourceUrl = (url: string) => {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

const isValidCheckedAt = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) && date.getTime() <= Date.now()
}

const officialSourceKinds = new Set(['venue-official', 'facility-manager', 'organizer-official', 'event-official'])
const partialMarker = /(?:partial|sample|subset|一部)/iu
const rangesOverlap = (left: VenueSeatRange, right: VenueSeatRange) =>
  Math.max(left.from, right.from) <= Math.min(left.to, right.to)

export const countRegisteredSeats = (venue: Venue): number => {
  const layout = venue.layouts[0]
  if (!layout) return 0
  let count = 0
  for (const area of layout.sections) {
    if (!area.includedInVenueLottery || area.variability === 'event-specific') continue
    for (const row of area.rows) {
      const excluded = new Set(row.excludedSeats ?? [])
      for (const range of row.seatRanges) {
        if (!Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from <= 0 || range.from > range.to) continue
        count += range.to - range.from + 1
        for (const seat of excluded) {
          if (seat >= range.from && seat <= range.to) count -= 1
        }
      }
    }
  }
  return count
}

export const validateVenueData = (venue: Venue, production = false): VenueDataIssue[] => {
  const issues: VenueDataIssue[] = []
  const add = (code: string, message: string) => issues.push({ venueId: venue.id, code, message })
  const isDemo = venue.seatDataAccuracy === 'demo'

  if (production && isDemo) add('demo-in-production', 'production一覧にdemoデータは登録できません。')
  if (!isDemo && venue.sources.length === 0) add('missing-source', '実在会場には内部情報源が必要です。')
  if (venue.representativePattern.coverage !== 'complete') add('incomplete-pattern', '代表パターンは完全な座席範囲で登録してください。')
  if (!Number.isSafeInteger(venue.representativePattern.expectedSeatCount) || venue.representativePattern.expectedSeatCount <= 0) {
    add('invalid-expected-seat-count', '代表パターンの総座席数は1以上の安全な整数で指定してください。')
  }
  if (production && partialMarker.test([
    venue.id,
    venue.name,
    venue.representativePattern.id,
    venue.representativePattern.name,
    ...venue.layouts.flatMap((layout) => [layout.id, layout.name]),
  ].join(' '))) add('partial-production-data', 'production会場に部分データを示す名前またはIDがあります。')
  if (venue.layouts.length !== 1) add('representative-layout-count', 'production用の代表レイアウトは1件だけ登録してください。')
  if (venue.layouts[0] && venue.layouts[0].id !== venue.representativePattern.id) {
    add('representative-layout-mismatch', '代表パターンIDと登録レイアウトIDが一致しません。')
  }

  for (const source of venue.sources) {
    if (!officialSourceKinds.has(source.kind)) add('invalid-source-kind', '情報源の公式種別が不正です。')
    if (!source.publisher.trim() || !source.title.trim()) add('incomplete-source', '情報源には発行者と資料名が必要です。')
    if (!isValidSourceUrl(source.url)) add('invalid-source-url', '情報源URLは有効なHTTPS URLで指定してください。')
    if (!isValidCheckedAt(source.checkedAt)) add('missing-checked-at', '確認日は実在する過去または当日の日付をYYYY-MM-DDで記録してください。')
  }

  const layoutIds = new Set<string>()
  for (const layout of venue.layouts) {
    if (!layout.id.trim() || layoutIds.has(layout.id)) add('duplicate-layout-id', `${layout.id || '(空)'}: レイアウトIDが空か重複しています。`)
    layoutIds.add(layout.id)
    const areaIds = new Set<string>()
    for (const area of layout.sections) {
      if (!area.id.trim() || areaIds.has(area.id)) add('duplicate-area-id', `${layout.id}: エリアIDが空か重複しています。`)
      areaIds.add(area.id)
      if (production && !area.includedInVenueLottery) add('excluded-area-in-pattern', `${area.id}: 代表パターン内に抽選対象外エリアを混在できません。`)
      if (area.variability === 'event-specific' && area.includedInVenueLottery) add('event-specific-included', `${area.id}: event-specific席は会場共通抽選に含められません。`)
      if (area.rows.length === 0) add('empty-area', `${area.id}: 座席列がありません。`)

      const rowLabels = new Set<string>()
      for (const row of area.rows) {
        if (!row.label.trim() || rowLabels.has(row.label)) add('duplicate-row-label', `${area.id}: 列ラベルが空か重複しています。`)
        rowLabels.add(row.label)
        const ranges: VenueSeatRange[] = []
        for (const range of row.seatRanges) {
          if (!Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from <= 0 || range.to <= 0 || range.from > range.to) {
            add('invalid-range', `${area.id} ${row.label}列: 座席範囲が不正です。`)
            continue
          }
          if (ranges.some((other) => rangesOverlap(range, other))) add('duplicate-seat-range', `${area.id} ${row.label}列: 重複する座席範囲があります。`)
          ranges.push(range)
        }
        const excluded = row.excludedSeats ?? []
        if (new Set(excluded).size !== excluded.length) add('duplicate-excluded-seat', `${area.id} ${row.label}列: 除外席が重複しています。`)
        for (const seat of excluded) {
          if (!Number.isSafeInteger(seat) || seat <= 0 || !row.seatRanges.some((range) => seat >= range.from && seat <= range.to)) {
            add('excluded-outside-range', `${area.id} ${row.label}列: 範囲外の除外席があります。`)
          }
        }
      }
    }
  }

  const registered = countRegisteredSeats(venue)
  if (registered === 0) add('no-registered-seats', '抽選対象となる登録座席がありません。')
  if (registered !== venue.representativePattern.expectedSeatCount) {
    add('seat-count-mismatch', `生成可能座席数${registered}席と内部記録${venue.representativePattern.expectedSeatCount}席が一致しません。`)
  }
  return issues
}

export const validateProductionVenues = (venues: readonly Venue[]) => {
  const issues = venues.flatMap((venue) => validateVenueData(venue, true))
  const ids = new Set<string>()
  for (const venue of venues) {
    if (!venue.id.trim() || ids.has(venue.id)) issues.push({ venueId: venue.id, code: 'duplicate-venue-id', message: '会場IDが空か重複しています。' })
    ids.add(venue.id)
  }
  return issues
}
