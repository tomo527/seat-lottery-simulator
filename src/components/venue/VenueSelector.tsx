import { useEffect, useMemo, useRef, useState } from 'react'
import type { VenueCatalogEntry } from '../../types/venue'

type Props = {
  venues: VenueCatalogEntry[]
  selectedVenueId: string
  onSelect: (venueId: string) => void
}

const locationLabel = (venue: VenueCatalogEntry) => [venue.prefecture, venue.city].filter(Boolean).join(' ')
const prefectureFilterLabel = (prefecture: string) => prefecture === '北海道' ? prefecture : prefecture.replace(/[都府県]$/, '')
const PAGE_SIZE = 20
const normalizeVenueSearchText = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase('ja-JP')

export function VenueSelector({ venues, selectedVenueId, onSelect }: Props) {
  const [region, setRegion] = useState('すべて')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [panelOpen, setPanelOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const returnFocusRef = useRef(false)
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId)
  const prefectureFilters = useMemo(() => [...new Set(venues.map((venue) => prefectureFilterLabel(venue.prefecture)))].sort((left, right) => left.localeCompare(right, 'ja')), [venues])
  const filtered = useMemo(() => {
    const needle = normalizeVenueSearchText(query)
    return venues.filter((venue) =>
      (region === 'すべて' || venue.prefecture.startsWith(region)) &&
      (!needle || normalizeVenueSearchText(`${venue.name} ${venue.aliases.join(' ')} ${venue.prefecture} ${venue.city}`).includes(needle)),
    )
  }, [query, region, venues])
  const visibleVenues = filtered.slice(0, visibleCount)

  useEffect(() => {
    if (panelOpen) searchRef.current?.focus()
    else if (returnFocusRef.current) {
      returnFocusRef.current = false
      triggerRef.current?.focus()
    }
  }, [panelOpen, selectedVenueId])

  const closePanel = () => {
    returnFocusRef.current = true
    setPanelOpen(false)
  }

  const selectVenue = (venueId: string) => {
    onSelect(venueId)
    closePanel()
  }

  const showMore = () => {
    const firstNewIndex = visibleCount
    setVisibleCount((count) => count + PAGE_SIZE)
    window.requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLButtonElement>('button')[firstNewIndex]?.focus()
    })
  }

  if (venues.length === 0) return <p className="empty-state" role="status">現在選べる会場がありません。自分で座席を作る機能をご利用ください。</p>

  return (
    <div className="venue-selector">
      {selectedVenue ? (
        <div className="selected-venue-summary">
          <div>
            <span className="selected-venue-label">選択中の会場</span>
            <strong>{selectedVenue.name}</strong>
            <span>{locationLabel(selectedVenue)}</span>
            <small>抽選対象 {selectedVenue.seatCount.toLocaleString('ja-JP')}席</small>
          </div>
          <button ref={triggerRef} type="button" aria-expanded={panelOpen} aria-controls="venue-picker-panel" onClick={() => setPanelOpen((open) => !open)}>会場を変更</button>
        </div>
      ) : (
        <div className="venue-unselected">
          <p>まだ会場が選択されていません。</p>
          <button ref={triggerRef} className="primary-button venue-picker-trigger" type="button" aria-expanded={panelOpen} aria-controls="venue-picker-panel" onClick={() => setPanelOpen((open) => !open)}>会場を選ぶ</button>
        </div>
      )}

      {panelOpen && (
        <section className="venue-picker-panel" id="venue-picker-panel" aria-labelledby="venue-picker-heading" onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); closePanel() }
        }}>
          <div className="venue-picker-header">
            <div><h3 id="venue-picker-heading">会場を選ぶ</h3><p>会場名や地域から探せます。</p></div>
            <button className="venue-picker-close" type="button" aria-label="会場選択を閉じる" onClick={closePanel}>×</button>
          </div>
          <div className="filter-grid">
            <label><span>会場名・所在地を検索</span><input ref={searchRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE) }} placeholder="会場名、都道府県、市区町村" /></label>
            <label><span>地域</span><select value={region} onChange={(event) => { setRegion(event.target.value); setVisibleCount(PAGE_SIZE) }}><option>すべて</option>{prefectureFilters.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <p className="venue-result-count" role="status"><span>{filtered.length.toLocaleString('ja-JP')}件の会場</span><span className="sr-only">、{visibleVenues.length.toLocaleString('ja-JP')}件を表示中</span></p>
          {filtered.length > 0 ? (
            <ul ref={listRef} className="venue-compact-list" aria-label="会場の検索結果">
              {visibleVenues.map((venue) => (
                <li key={venue.id}><button type="button" aria-label={`${venue.name}を選ぶ`} aria-pressed={selectedVenueId === venue.id} onClick={() => selectVenue(venue.id)}>
                  <span className="venue-compact-main"><strong>{venue.name}</strong><small>{locationLabel(venue)}</small></span>
                  <span className="venue-seat-total">抽選対象 {venue.seatCount.toLocaleString('ja-JP')}席</span>
                </button></li>
              ))}
            </ul>
          ) : <p className="empty-state" role="status">条件に合う会場が見つかりませんでした。</p>}
          {visibleCount < filtered.length && (
            <button className="venue-load-more" type="button" onClick={showMore}>
              さらに表示
            </button>
          )}
        </section>
      )}
    </div>
  )
}
