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
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && date.getTime() <= Date.now()
}

const officialSourceKinds = new Set(['venue-official', 'facility-manager', 'organizer-official', 'event-official'])

const rangesOverlap = (left: VenueSeatRange, right: VenueSeatRange) =>
  Math.max(left.from, right.from) <= Math.min(left.to, right.to)

export const countRegisteredSeats = (venue: Venue): number => {
  const layout = venue.layouts[0]
  if (!layout) return 0
  let count = 0
  for (const area of layout.sections) {
    if (!area.includedInVenueLottery || area.variability === 'event-specific') continue
    for (const row of area.rows) {
      const uniqueExcluded = new Set(row.excludedSeats ?? [])
      for (const range of row.seatRanges) {
        if (!Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from <= 0 || range.from > range.to) continue
        count += range.to - range.from + 1
        for (const excluded of uniqueExcluded) {
          if (excluded >= range.from && excluded <= range.to) count -= 1
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
  const expectedPresentation = {
    'official-exact': ['verified-section-map', 'summary-only'],
    'official-structure': ['verified-section-map', 'summary-only'],
    'official-range': ['seat-grid', 'summary-only'],
    demo: ['verified-section-map', 'seat-grid', 'summary-only'],
  }[venue.seatDataAccuracy]

  if (production && isDemo) add('demo-in-production', 'production会場一覧にdemoデータを含めることはできません。')
  if (!isDemo && venue.sources.length === 0) add('missing-source', '実在会場には公式情報源が必要です。')
  if (venue.seatDataAccuracy === 'official-exact' && venue.sources.length === 0) add('exact-without-source', 'official-exactには根拠となる情報源が必要です。')
  if (!expectedPresentation.includes(venue.seatMapPresentation)) add('presentation-mismatch', 'データ精度と座席図の描画方法が整合していません。')
  if (venue.layouts.length === 0) add('missing-layout', '会場には1件以上のレイアウトが必要です。')
  for (const source of venue.sources) {
    if (!officialSourceKinds.has(source.kind)) add('invalid-source-kind', '情報源の公式種別が不正です。')
    if (!source.publisher.trim() || !source.title.trim()) add('incomplete-source', '情報源には発行者と資料名が必要です。')
    if (!isValidSourceUrl(source.url)) add('invalid-source-url', '情報源URLがないか、HTTPS URLではありません。')
    if (!isValidCheckedAt(source.checkedAt)) add('missing-checked-at', '情報源の確認日は実在する日付をYYYY-MM-DDで記録してください。')
  }

  const intervalKeys = new Map<string, VenueSeatRange[]>()
  const layoutIds = new Set<string>()
  for (const layout of venue.layouts) {
    if (!layout.id.trim() || layoutIds.has(layout.id)) add('duplicate-layout-id', `${layout.id || '(空)'}: レイアウトIDが空または重複しています。`)
    layoutIds.add(layout.id)
    const areaIds = new Set<string>()
    let hasMap = false
    for (const area of layout.sections) {
      if (!area.id.trim() || areaIds.has(area.id)) add('duplicate-area-id', `${layout.id}: エリアIDが空または重複しています。`)
      areaIds.add(area.id)
      if (area.variability === 'event-specific' && area.includedInVenueLottery) {
        add('event-specific-included', `${area.id}: event-specific席は会場共通抽選に含められません。`)
      }
      if (area.variability === 'event-specific' && !area.exclusionReason?.trim()) {
        add('missing-exclusion-reason', `${area.id}: event-specific席には除外理由が必要です。`)
      }
      if (venue.seatDataAccuracy === 'official-range' && area.map) {
        add('range-has-map', `${area.id}: official-rangeにsection map座標を設定できません。`)
      }
      if (area.map) {
        hasMap = true
        const { x, y, width, height } = area.map
        if (![x, y, width, height].every(Number.isFinite) || x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 100 || y + height > 76) {
          add('invalid-map-bounds', `${area.id}: map座標はviewBox 0 0 100 76の範囲内で指定してください。`)
        }
      }
      const rowLabels = new Set<string>()
      for (const row of area.rows) {
        if (!row.label.trim() || rowLabels.has(row.label)) add('duplicate-row-label', `${area.id}: 列ラベルが空または重複しています。`)
        rowLabels.add(row.label)
        const rowKey = `${layout.id}\u0000${area.id}\u0000${row.label}`
        const existing = intervalKeys.get(rowKey) ?? []
        for (const range of row.seatRanges) {
          if (!Number.isSafeInteger(range.from) || !Number.isSafeInteger(range.to) || range.from <= 0 || range.to <= 0 || range.from > range.to) {
            add('invalid-range', `${area.id} ${row.label}列: 座席範囲が不正です。`)
            continue
          }
          if (existing.some((other) => rangesOverlap(range, other))) {
            add('duplicate-seat-range', `${area.id} ${row.label}列: 重複する座席範囲があります。`)
          }
          existing.push(range)
        }
        intervalKeys.set(rowKey, existing)
        for (const excluded of row.excludedSeats ?? []) {
          if (!Number.isSafeInteger(excluded) || excluded <= 0 || !row.seatRanges.some((range) => excluded >= range.from && excluded <= range.to)) {
            add('excluded-outside-range', `${area.id} ${row.label}列: 範囲外の除外席があります。`)
          }
        }
      }
    }
    if (venue.seatMapPresentation === 'verified-section-map' && !hasMap) add('missing-section-map', `${layout.id}: verified-section-mapには確認済みmap座標が必要です。`)
  }

  if (countRegisteredSeats(venue) === 0) add('no-registered-seats', '抽選対象となる登録座席がありません。')
  return issues
}

export const validateProductionVenues = (venues: readonly Venue[]) => {
  const issues = venues.flatMap((venue) => validateVenueData(venue, true))
  const ids = new Set<string>()
  for (const venue of venues) {
    if (!venue.id.trim() || ids.has(venue.id)) issues.push({ venueId: venue.id, code: 'duplicate-venue-id', message: '会場IDが空または重複しています。' })
    ids.add(venue.id)
  }
  return issues
}
