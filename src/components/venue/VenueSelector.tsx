import { useEffect, useMemo, useRef, useState } from 'react'
import { REGIONS, type Venue } from '../../types/venue'

type Props = {
  venues: Venue[]
  selectedVenueId: string
  onSelect: (venueId: string) => void
}

const accuracyLabel = { demo: 'デモデータ', approximate: '概算', verified: '検証済み' } as const

export function VenueSelector({ venues, selectedVenueId, onSelect }: Props) {
  const [region, setRegion] = useState('すべて')
  const [query, setQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const returnFocusRef = useRef(false)
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId)
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ja-JP')
    return venues.filter((venue) =>
      (region === 'すべて' || venue.region === region) &&
      (!needle || `${venue.name} ${venue.prefecture ?? ''} ${venue.city ?? ''}`.toLocaleLowerCase('ja-JP').includes(needle)),
    )
  }, [query, region, venues])

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

  if (venues.length === 0) {
    return <p className="empty-state" role="status">現在選べる会場データがありません。自分で座席を作る機能をご利用ください。</p>
  }

  return (
    <div className="venue-selector">
      {selectedVenue ? (
        <div className="selected-venue-summary">
          <div>
            <span className="selected-venue-label">選択中の会場</span>
            <strong>{selectedVenue.name}</strong>
            <span>{[selectedVenue.prefecture, selectedVenue.city].filter(Boolean).join(' ')} · {selectedVenue.region}</span>
            {selectedVenue.accuracy === 'demo' && <small>架空会場</small>}
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
        <section
          className="venue-picker-panel"
          id="venue-picker-panel"
          aria-labelledby="venue-picker-heading"
          onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); closePanel() } }}
        >
          <div className="venue-picker-header">
            <div><h3 id="venue-picker-heading">会場を選ぶ</h3><p>架空のデモ会場から選択できます。</p></div>
            <button className="venue-picker-close" type="button" aria-label="会場選択を閉じる" onClick={closePanel}>×</button>
          </div>
          <div className="filter-grid">
            <label>
              <span>会場名・所在地を検索</span>
              <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="会場名、都道府県、市区町村" />
            </label>
            <label>
              <span>地域</span>
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
                <option>すべて</option>
                {REGIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <p className="venue-result-count" role="status">{filtered.length.toLocaleString('ja-JP')}件の会場</p>
          {filtered.length > 0 ? (
            <ul className="venue-compact-list" aria-label="会場の検索結果">
              {filtered.map((venue) => (
                <li key={venue.id}>
                  <button type="button" aria-label={`${venue.name}を選ぶ`} aria-pressed={selectedVenueId === venue.id} onClick={() => selectVenue(venue.id)}>
                    <span className="venue-compact-main"><strong>{venue.name}</strong><small>{[venue.prefecture, venue.city].filter(Boolean).join(' ')} · {venue.region}</small></span>
                    <span className={`accuracy accuracy-${venue.accuracy}`}>{venue.accuracy === 'demo' ? '架空会場' : accuracyLabel[venue.accuracy]}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="empty-state" role="status">条件に合う架空会場が見つかりませんでした。</p>}
        </section>
      )}
    </div>
  )
}
