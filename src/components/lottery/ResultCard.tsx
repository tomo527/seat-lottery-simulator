import { formatRowLabel, formatSeatNumber } from '../../domain/lottery/lottery'
import type { Seat } from '../../types/venue'

type Props = {
  seat: Seat
  venueName: string
  shareStatus: string
  onRetry: () => void
  onChangeConditions: () => void
  onShare: () => void
}

export function ResultCard({ seat, venueName, shareStatus, onRetry, onChangeConditions, onShare }: Props) {
  return (
    <section className="result-card" aria-labelledby="result-heading">
      <article className="result-notification">
        <header className="result-notification-header">
          <p>SEAT LOTTERY NOTICE</p>
          <h2 id="result-heading">抽選結果のお知らせ</h2>
        </header>
        <div className="simulation-stamp">SIMULATION</div>
        <p className="result-message">厳正なる抽選の結果、<br />以下のお席となりました。</p>
        <div className="ticket-divider" aria-hidden="true" />
        <dl className="ticket-details">
          <div><dt>会場</dt><dd>{venueName}</dd></div>
          {seat.sectionLabel && <div><dt>エリア</dt><dd>{seat.sectionLabel}</dd></div>}
          <div className="seat-value"><dt>列</dt><dd>{formatRowLabel(seat.rowLabel)}</dd></div>
          <div className="seat-value"><dt>座席番号</dt><dd>{formatSeatNumber(seat.number)}</dd></div>
        </dl>
        <div className="ticket-divider" aria-hidden="true" />
        <p className="simulation-notice">※これは遊びのためのシミュレーションです。実際の座席割り当てとは関係ありません。</p>
      </article>
      <div className="result-actions" aria-label="結果の操作">
        <button className="primary-button" type="button" onClick={onRetry}>もう一度抽選する</button>
        <button className="secondary-button" type="button" onClick={onChangeConditions}>条件を変更する</button>
        <button className="secondary-button share-button" type="button" onClick={onShare}>結果を共有する</button>
      </div>
      <p className="share-status" role="status" aria-live="polite">{shareStatus}</p>
    </section>
  )
}
