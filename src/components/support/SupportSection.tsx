import { resolveSupportPaymentLink } from '../../config/support'
import './SupportSection.css'

type Props = {
  /** テスト用の差し替え口。省略時は`src/config/support.ts`の設定値を使う。 */
  paymentLinkUrl?: string
}

export function SupportSection({ paymentLinkUrl }: Props) {
  const href = resolveSupportPaymentLink(paymentLinkUrl)
  if (!href) return null

  return (
    <section className="support-section" aria-labelledby="support-heading">
      <div className="offertory-box" aria-hidden="true">
        <span className="offertory-coin" />
        <span className="offertory-slot" />
        <span className="offertory-plank" />
      </div>
      <p className="support-kicker">おまけ</p>
      <h2 id="support-heading">願掛け（開発への支援）はこちらから</h2>
      <p className="support-lead">「良い席が当たりますように」。願をかけたくなったら、お賽銭の気持ちで開発を応援できます。</p>
      <a className="support-button" href={href} target="_blank" rel="noopener noreferrer">
        お賽銭を入れる<span aria-hidden="true">↗</span>
      </a>
      <ul className="support-notes">
        <li>支援がなくても、すべての機能をこのまま無料で使えます。</li>
        <li>支援しても抽選結果や当たりやすさは変わりません。席運は平等です。</li>
        <li>金額は自由に決められます。特典やお返しはありません。</li>
      </ul>
      <p className="support-fineprint">お支払いは別タブで開くStripeの決済ページで完了します。当サイトの画面でカード番号等の決済情報を入力することはありません。</p>
    </section>
  )
}
