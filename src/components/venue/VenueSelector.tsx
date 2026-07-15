import { useMemo, useState } from 'react'
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
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ja-JP')
    return venues.filter((venue) =>
      (region === 'すべて' || venue.region === region) &&
      (!needle || `${venue.name} ${venue.prefecture ?? ''} ${venue.city ?? ''}`.toLocaleLowerCase('ja-JP').includes(needle)),
    )
  }, [query, region, venues])

  if (venues.length === 0) {
    return <p className="empty-state" role="status">現在選べる会場データがありません。自分で座席を作る機能をご利用ください。</p>
  }

  return (
    <div className="venue-selector">
      <div className="filter-grid">
        <label>
          <span>地域</span>
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option>すべて</option>
            {REGIONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>会場名を検索</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例：星見アリーナ" />
        </label>
      </div>

      <fieldset className="venue-list">
        <legend className="sr-only">会場を選択</legend>
        {filtered.map((venue) => (
          <label className={`venue-card ${selectedVenueId === venue.id ? 'is-selected' : ''}`} key={venue.id}>
            <input type="radio" name="venue" value={venue.id} checked={selectedVenueId === venue.id} onChange={() => onSelect(venue.id)} />
            <span className="venue-card-main">
              <span className="venue-card-topline">
                <strong>{venue.name}</strong>
                <span className={`accuracy accuracy-${venue.accuracy}`}>{accuracyLabel[venue.accuracy]}</span>
              </span>
              <span className="venue-meta">{venue.region} · {venue.approximateCapacity?.toLocaleString('ja-JP') ?? '規模未登録'}席規模</span>
              <span className="venue-description">{venue.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {filtered.length === 0 && <p className="empty-state" role="status">条件に合う架空会場が見つかりませんでした。</p>}
    </div>
  )
}
