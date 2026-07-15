import { formatSeatLabel, type LotteryResult } from '../../domain/lottery/lottery'
import { SeatMap } from '../seat-map/SeatMap'
import type { Seat, Venue, VenueLayout } from '../../types/venue'

type Props = {
  result: LotteryResult
  venueName: string
  venue?: Venue
  layout?: VenueLayout
  customSeats?: Seat[]
  shareStatus: string
  onRetry: () => void
  onChangeConditions: () => void
  onShare: () => void
}

export function ResultCard({ result, venueName, venue, layout, customSeats, shareStatus, onRetry, onChangeConditions, onShare }: Props) {
  const won = result.status === 'won'
  return (
    <section className={`result-card ${won ? 'result-won' : 'result-lost'}`} aria-labelledby="result-heading">
      <div className="simulation-stamp" aria-hidden="true">SIMULATION</div>
      <p className="eyebrow">シミュレーション結果</p>
      <div className="result-symbol" aria-hidden="true">{won ? '★' : '◇'}</div>
      <h2 id="result-heading">{won ? 'チケットをご用意できました！' : '今回はご用意できませんでした'}</h2>
      <p className="result-message">{won ? '架空の抽選で、幸運な1席と出会いました。' : 'また次の運試しで、いい席との出会いがありますように。'}</p>

      {won && (
        <dl className="ticket-details">
          <div><dt>会場</dt><dd>{venueName}</dd></div>
          <div><dt>レイアウト</dt><dd>{result.seat.layoutName}</dd></div>
          <div><dt>セクション</dt><dd>{result.seat.sectionLabel}</dd></div>
          <div><dt>列</dt><dd>{result.seat.rowLabel}列</dd></div>
          <div className="seat-number"><dt>座席番号</dt><dd>{result.seat.number}番</dd></div>
        </dl>
      )}

      {won && <SeatMap venue={venue} layout={layout} customSeats={customSeats} highlightedSeat={result.seat} />}
      <p className="result-alt-text">{won ? `抽選された座席は ${formatSeatLabel(result.seat)} です。` : '落選のため、座席は生成されていません。'}</p>
      <div className="simulation-notice"><strong>これはシミュレーションです</strong><span>実際のチケット抽選・当選確率・座席割り当てとは一切関係ありません。</span></div>
      <div className="result-actions">
        <button className="primary-button" type="button" onClick={onRetry}>もう一度抽選</button>
        <button className="secondary-button" type="button" onClick={onChangeConditions}>条件を変更</button>
        <button className="secondary-button share-button" type="button" onClick={onShare}>結果を共有</button>
      </div>
      <p className="share-status" role="status" aria-live="polite">{shareStatus}</p>
    </section>
  )
}
