import { useEffect, useRef } from 'react'
import { formatSeatLabel } from '../../domain/lottery/lottery'
import { generateVenueSeats } from '../../domain/seats/venueSeats'
import type { Seat, Venue, VenueLayout } from '../../types/venue'

type Props = {
  venue?: Venue
  layout?: VenueLayout
  customSeats?: Seat[]
  highlightedSeat?: Seat
}

const MAX_GRID_ROWS = 12
const MAX_GRID_COLUMNS = 24

function selectedWindow<T>(values: T[], selected: T | undefined, limit: number) {
  if (values.length <= limit) return values
  const selectedIndex = selected === undefined ? 0 : Math.max(0, values.indexOf(selected))
  const start = Math.min(Math.max(0, selectedIndex - Math.floor(limit / 2)), values.length - limit)
  return values.slice(start, start + limit)
}

function SeatGrid({ seats, highlightedSeat, officialRange = false }: { seats: Seat[]; highlightedSeat?: Seat; officialRange?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLSpanElement>(null)
  const allRows = [...new Set(seats.map((seat) => seat.rowLabel))]
  const allNumbers = [...new Set(seats.map((seat) => seat.number))].sort((a, b) => a - b)
  const rows = selectedWindow(allRows, highlightedSeat?.rowLabel, MAX_GRID_ROWS)
  const numbers = selectedWindow(allNumbers, highlightedSeat?.number, MAX_GRID_COLUMNS)
  const validSeats = new Set(seats.map((seat) => `${seat.rowLabel}:${seat.number}`))

  useEffect(() => {
    const scroller = scrollRef.current
    const selected = selectedRef.current
    if (!scroller || !selected) return
    scroller.scrollLeft = Math.max(0, selected.offsetLeft - (scroller.clientWidth - selected.offsetWidth) / 2)
  }, [highlightedSeat?.number, highlightedSeat?.rowLabel])

  return (
    <>
      <div className="seat-grid-scroll" ref={scrollRef}>
        <div className="seat-grid" style={{ gridTemplateColumns: `2.8rem repeat(${numbers.length}, minmax(1.55rem, 1fr))` }}>
          {rows.flatMap((row) => [
            <span className="row-label" key={`${row}-label`}>{row}</span>,
            ...numbers.map((number) => {
              const key = `${row}:${number}`
              const selected = highlightedSeat?.rowLabel === row && highlightedSeat.number === number
              const valid = validSeats.has(key)
              return (
                <span
                  className={selected ? 'mini-seat selected' : valid ? 'mini-seat' : 'mini-seat unavailable'}
                  ref={selected ? selectedRef : undefined}
                  key={key}
                  aria-label={`${row}列${number}番${selected ? ' 抽選席' : valid ? '' : ' 対象外'}`}
                >
                  {valid ? number : '—'}
                </span>
              )
            }),
          ])}
        </div>
      </div>
      {(allRows.length > rows.length || allNumbers.length > numbers.length) && (
        <p className="seat-grid-note">表示負荷を抑えるため、抽選席の周辺だけを表示しています。</p>
      )}
      {officialRange && (
        <p className="seat-grid-note">公式資料で確認できる列・座席番号を、抽選用のグリッドとして表示しています。実際の位置関係や縮尺を表すものではありません。</p>
      )}
    </>
  )
}

export function SeatMap({ venue, layout, customSeats, highlightedSeat }: Props) {
  if (venue && layout) {
    if (venue.seatMapPresentation === 'summary-only') {
      return (
        <div className="seat-map-summary" data-presentation="summary-only" role="note">
          <strong>座席図は表示していません</strong>
          <span>公式資料だけでは配置を十分に確認できないため、抽選結果をテキストで表示しています。</span>
        </div>
      )
    }

    if (venue.seatMapPresentation === 'seat-grid') {
      const seats = generateVenueSeats(venue, layout)
      return (
        <figure className="seat-map-card custom-map" data-presentation="seat-grid" aria-label={`${venue.name}の抽選用座席グリッド`}>
          <SeatGrid seats={seats} highlightedSeat={highlightedSeat} officialRange />
          <figcaption>{highlightedSeat ? `抽選席: ${formatSeatLabel(highlightedSeat)}` : '公式に確認できる列と番号の範囲を表示しています。'}</figcaption>
        </figure>
      )
    }

    const mappedSections = layout.sections.filter((section) => section.map)
    const alt = `${venue.name}の公式情報に基づくエリア概略図。${highlightedSeat?.sectionLabel ? `${highlightedSeat.sectionLabel}を強調表示しています。` : ''}`
    return (
      <figure className="seat-map-card" data-presentation="verified-section-map">
        <svg className="venue-map" viewBox="0 0 100 76" role="img" aria-label={alt}>
          {mappedSections.map((section) => {
            const selected = highlightedSeat?.sectionId === section.id
            const map = section.map!
            const classes = ['map-section', selected ? 'selected' : '', section.includedInVenueLottery ? '' : 'excluded'].filter(Boolean).join(' ')
            return (
              <g key={section.id} className={classes}>
                <rect x={map.x} y={map.y} width={map.width} height={map.height} rx="3" />
                <text x={map.x + map.width / 2} y={map.y + map.height / 2 + 1} textAnchor="middle">{section.label}</text>
              </g>
            )
          })}
        </svg>
        <p className="seat-grid-note">
          {venue.seatDataAccuracy === 'official-exact'
            ? '公式資料で確認した区分と位置関係を、独自の概略図で表示しています。実際の縮尺を表すものではありません。'
            : '公式資料で確認したエリアの位置関係を、エリア単位の独自概略図で表示しています。個々の座席位置や縮尺を表すものではありません。'}
        </p>
        <figcaption>{highlightedSeat ? `強調位置: ${formatSeatLabel(highlightedSeat)}` : '公式資料から確認できた位置関係だけを表示しています。'}</figcaption>
      </figure>
    )
  }

  if (customSeats?.length) {
    return (
      <figure className="seat-map-card custom-map" data-presentation="seat-grid" aria-label="自作座席の簡易座席図">
        <SeatGrid seats={customSeats} highlightedSeat={highlightedSeat} />
        <figcaption>{highlightedSeat ? `抽選席: ${formatSeatLabel(highlightedSeat)}` : '入力範囲を列・座席ごとに表示しています。'}</figcaption>
      </figure>
    )
  }
  return null
}
