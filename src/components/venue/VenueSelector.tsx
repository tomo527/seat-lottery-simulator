import { useEffect, useMemo, useRef, useState } from 'react'
import type { VenueCatalogEntry } from '../../types/venue'

type Props = {
  venues: VenueCatalogEntry[]
  selectedVenueId: string
  onSelect: (venueId: string) => void
}

const PAGE_SIZE = 20
const normalizeVenueSearchText = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase('ja-JP')
const sortedUnique = (values: string[]) => [...new Set(values)].sort((left, right) => left.localeCompare(right, 'ja'))
const locationLabel = (venue: VenueCatalogEntry) => [venue.prefecture, venue.municipality].filter(Boolean).join(' ')

export function VenueSelector({ venues, selectedVenueId, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [panelOpen, setPanelOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const returnFocusRef = useRef(false)
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId)

  const regions = useMemo(() => sortedUnique(venues.map((venue) => venue.region)), [venues])
  const prefectures = useMemo(
    () => sortedUnique(venues.filter((venue) => !region || venue.region === region).map((venue) => venue.prefecture)),
    [region, venues],
  )
  const municipalities = useMemo(
    () => prefecture
      ? sortedUnique(venues.filter((venue) => venue.prefecture === prefecture).map((venue) => venue.municipality))
      : [],
    [prefecture, venues],
  )
  const filtered = useMemo(() => {
    const needle = normalizeVenueSearchText(query)
    return venues.filter((venue) => {
      const venueNames = normalizeVenueSearchText([venue.name, ...venue.searchAliases].join(' '))
      return (!needle || venueNames.includes(needle))
        && (!region || venue.region === region)
        && (!prefecture || venue.prefecture === prefecture)
        && (!municipality || venue.municipality === municipality)
    })
  }, [municipality, prefecture, query, region, venues])
  const visibleVenues = filtered.slice(0, visibleCount)
  const filtersActive = Boolean(query || region || prefecture || municipality)

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

  const changeRegion = (nextRegion: string) => {
    setRegion(nextRegion)
    const allowedPrefectures = venues.filter((venue) => !nextRegion || venue.region === nextRegion).map((venue) => venue.prefecture)
    if (prefecture && !allowedPrefectures.includes(prefecture)) {
      setPrefecture('')
      setMunicipality('')
    }
    setVisibleCount(PAGE_SIZE)
  }

  const changePrefecture = (nextPrefecture: string) => {
    setPrefecture(nextPrefecture)
    const allowedMunicipalities = venues.filter((venue) => venue.prefecture === nextPrefecture).map((venue) => venue.municipality)
    if (!nextPrefecture || (municipality && !allowedMunicipalities.includes(municipality))) setMunicipality('')
    setVisibleCount(PAGE_SIZE)
  }

  const resetFilters = () => {
    setQuery('')
    setRegion('')
    setPrefecture('')
    setMunicipality('')
    setVisibleCount(PAGE_SIZE)
    searchRef.current?.focus()
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
            <div><h3 id="venue-picker-heading">会場を選ぶ</h3><p>会場名と地域を組み合わせて絞り込めます。</p></div>
            <button className="venue-picker-close" type="button" aria-label="会場選択を閉じる" onClick={closePanel}>×</button>
          </div>
          <div className="venue-filter-grid">
            <label className="venue-name-search"><span>会場名で検索</span><input ref={searchRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE) }} placeholder="会場名・略称を入力" /></label>
            <label><span>エリア</span><select value={region} onChange={(event) => changeRegion(event.target.value)}><option value="">すべてのエリア</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>都道府県</span><select value={prefecture} onChange={(event) => changePrefecture(event.target.value)}><option value="">すべての都道府県</option>{prefectures.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>市区町村</span><select aria-label="市区町村" value={municipality} disabled={!prefecture} aria-describedby={!prefecture ? 'municipality-help' : undefined} onChange={(event) => { setMunicipality(event.target.value); setVisibleCount(PAGE_SIZE) }}><option value="">すべての市区町村</option>{municipalities.map((item) => <option key={item}>{item}</option>)}</select>{!prefecture && <small id="municipality-help">都道府県を選択してください</small>}</label>
          </div>
          <div className="venue-filter-summary">
            <p className="venue-result-count" role="status"><span>絞り込み結果 {filtered.length.toLocaleString('ja-JP')}件</span><span className="sr-only">、{visibleVenues.length.toLocaleString('ja-JP')}件を表示中</span></p>
            <button className="venue-filter-reset" type="button" disabled={!filtersActive} onClick={resetFilters}>絞り込みをリセット</button>
          </div>
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
            <button className="venue-load-more" type="button" onClick={showMore}>さらに表示</button>
          )}
        </section>
      )}
    </div>
  )
}
