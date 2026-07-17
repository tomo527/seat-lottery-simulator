import { SeatMap } from '../seat-map/SeatMap'
import type { Seat, Venue, VenueLayout } from '../../types/venue'

type Props = {
  seat: Seat
  venueName: string
  venue?: Venue
  layout?: VenueLayout
  customSeats?: Seat[]
  shareStatus: string
  onRetry: () => void
  onChangeConditions: () => void
  onShare: () => void
}

const accuracyLabels = {
  'official-exact': '公式資料で配置関係まで確認',
  'official-structure': '公式資料でエリア構造を確認',
  'official-range': '公式資料で列・番号範囲を確認',
  demo: 'デモデータ',
} as const

export function ResultCard({ seat, venueName, venue, layout, customSeats, shareStatus, onRetry, onChangeConditions, onShare }: Props) {
  return (
    <section className="result-card" aria-labelledby="result-heading">
      <div className="simulation-stamp" aria-hidden="true">SIMULATION</div>
      <p className="eyebrow">シミュレーション結果</p>
      <div className="result-symbol" aria-hidden="true">★</div>
      <h2 id="result-heading">あなたの席はこちら！</h2>
      <p className="result-message">今日の席運が選んだのは、この1席です。</p>

      <dl className="ticket-details">
        <div><dt>会場</dt><dd>{venueName}</dd></div>
        {seat.sectionLabel && <div><dt>セクション・エリア</dt><dd>{seat.sectionLabel}</dd></div>}
        <div><dt>列</dt><dd>{seat.rowLabel}列</dd></div>
        <div className="seat-number"><dt>座席番号</dt><dd>{seat.number}番</dd></div>
      </dl>

      <SeatMap venue={venue} layout={layout} customSeats={customSeats} highlightedSeat={seat} />
      {venue && (
        <div className="venue-data-notice">
          <strong>{accuracyLabels[venue.seatDataAccuracy]}</strong>
          <span>最終確認日: {venue.sources[0]?.checkedAt}</span>
          {venue.variabilityNotice && <span>{venue.variabilityNotice}</span>}
          <span>実際の公演では座席構成が異なる可能性があります。</span>
          {venue.sources[0] && <a href={venue.sources[0].url} target="_blank" rel="noopener noreferrer">公式座席情報を確認</a>}
        </div>
      )}
      <div className="simulation-notice"><strong>これはシミュレーションです</strong><span>実際の座席割り当てとは関係のないシミュレーションです。</span></div>
      <div className="result-actions">
        <button className="primary-button" type="button" onClick={onRetry}>もう一度抽選</button>
        <button className="secondary-button" type="button" onClick={onChangeConditions}>条件を変更</button>
        <button className="secondary-button share-button" type="button" onClick={onShare}>結果を共有</button>
      </div>
      <p className="share-status" role="status" aria-live="polite">{shareStatus}</p>
    </section>
  )
}
