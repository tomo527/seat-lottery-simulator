import { formatSeatLabel } from '../../domain/lottery/lottery'
import type { Seat, Venue, VenueLayout } from '../../types/venue'

type Props = {
  venue?: Venue
  layout?: VenueLayout
  customSeats?: Seat[]
  highlightedSeat?: Seat
}

export function SeatMap({ venue, layout, customSeats, highlightedSeat }: Props) {
  if (venue && layout) {
    const alt = `${venue.name} ${layout.name}の簡易座席図。${highlightedSeat ? `${highlightedSeat.sectionLabel}を強調表示しています。` : `${layout.sections.length}エリアを表示しています。`}`
    return (
      <figure className="seat-map-card">
        <svg className="venue-map" viewBox="0 0 100 76" role="img" aria-label={alt}>
          <rect className="stage" x="31" y="4" width="38" height="11" rx="5" />
          <text className="stage-label" x="50" y="11" textAnchor="middle">{layout.stageLabel ?? 'STAGE'}</text>
          {layout.sections.map((section) => {
            const selected = highlightedSeat?.sectionId === section.id
            const { x, y, width, height, rotation = 0, shape } = section.map
            return (
              <g key={section.id} className={selected ? 'map-section selected' : 'map-section'} transform={`rotate(${rotation} ${x + width / 2} ${y + height / 2})`}>
                <rect x={x} y={y} width={width} height={height} rx={shape === 'rectangle' ? 2 : shape === 'rounded' ? 6 : 11} />
                <text x={x + width / 2} y={y + height / 2 + 1} textAnchor="middle">{section.label}</text>
                {selected && <circle className="map-pulse" cx={x + width / 2} cy={y + height - 4} r="2.2" />}
              </g>
            )
          })}
        </svg>
        <figcaption>{highlightedSeat ? `強調位置: ${formatSeatLabel(highlightedSeat)}` : 'データ内の配置情報から生成した独自の簡易図です。縮尺や実際の見え方を表すものではありません。'}</figcaption>
      </figure>
    )
  }

  if (customSeats?.length) {
    const rows = [...new Set(customSeats.map((seat) => seat.rowLabel))]
    const numbers = [...new Set(customSeats.map((seat) => seat.number))]
    const showIndividual = customSeats.length <= 240
    return (
      <figure className="seat-map-card custom-map" aria-label="自作座席の簡易座席図">
        <div className="custom-stage">STAGE</div>
        {showIndividual ? (
          <div className="seat-grid" style={{ gridTemplateColumns: `2.25rem repeat(${numbers.length}, minmax(1.4rem, 1fr))` }}>
            {rows.flatMap((row) => [
              <span className="row-label" key={`${row}-label`}>{row}</span>,
              ...numbers.map((number) => {
                const selected = highlightedSeat?.rowLabel === row && highlightedSeat.number === number
                return <span className={selected ? 'mini-seat selected' : 'mini-seat'} key={`${row}-${number}`} aria-label={`${row}列${number}番${selected ? ' 抽選席' : ''}`}>{number}</span>
              }),
            ])}
          </div>
        ) : (
          <div className="large-map-summary"><span>{rows.length}列</span><strong>{customSeats.length.toLocaleString('ja-JP')}席</strong><span>ブロック表示</span></div>
        )}
        <figcaption>{highlightedSeat ? `抽選席: ${formatSeatLabel(highlightedSeat)}` : showIndividual ? '入力範囲を列・座席ごとに表示しています。' : '座席数が多いため、ブラウザの負荷を抑えたブロック表示です。'}</figcaption>
      </figure>
    )
  }
  return null
}
