import { formatRowLabel, formatSeatNumbers } from '../../domain/lottery/lottery'
import type { Seat } from '../../types/venue'

type Props = {
  seats: readonly Seat[]
  venueName: string
  configurationName?: string
  scopeDisclosure?: string
  shareStatus: string
  onRetry: () => void
  onChangeConditions: () => void
  onShare: () => void
}

export function ResultCard({ seats, venueName, configurationName, scopeDisclosure, shareStatus, onRetry, onChangeConditions, onShare }: Props) {
  const [seat] = seats
  return (
    <section className="result-card" aria-labelledby="result-heading">
      <div className="result-celebration" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <article className="result-notification">
        <div className="result-flash" aria-hidden="true" />
        <div className="result-burst" aria-hidden="true" />
        <div className="result-rings" aria-hidden="true"><i /><i /></div>
        <header className="result-notification-header">
          <p>SEAT LOTTERY NOTICE</p>
          <h2 id="result-heading">抽選結果のお知らせ</h2>
        </header>
        <div className="simulation-stamp">SIMULATION</div>
        <p className="result-message">厳正なる抽選の結果、<br />以下のお席となりました。</p>
        <div className="ticket-divider" aria-hidden="true" />
        <dl className="ticket-details">
          <div><dt>会場</dt><dd>{venueName}</dd></div>
          {configurationName && <div><dt>座席配置</dt><dd>{configurationName}</dd></div>}
          {scopeDisclosure && <div><dt>抽選範囲</dt><dd>{scopeDisclosure}</dd></div>}
          {seat.sectionLabel && <div><dt>エリア</dt><dd>{seat.sectionLabel}</dd></div>}
          <div className="seat-value"><dt>列</dt><dd>{formatRowLabel(seat.rowLabel)}</dd></div>
          <div className="seat-value"><dt>座席番号</dt><dd>{formatSeatNumbers(seats)}</dd></div>
        </dl>
        <div className="ticket-divider" aria-hidden="true" />
        <p className="simulation-notice">※これは遊びのためのシミュレーションです。実際の座席割り当てとは関係ありません。</p>
      </article>
      <div className="result-actions" aria-label="結果の操作">
        <button className="primary-button" type="button" onClick={onRetry}>もう一度抽選する</button>
        <button className="secondary-button" type="button" onClick={onChangeConditions}>条件を変更する</button>
        <button className="secondary-button share-button" type="button" onClick={onShare}>Xで共有する</button>
      </div>
      <p className="share-status" role="status" aria-live="polite">{shareStatus}</p>
    </section>
  )
}
