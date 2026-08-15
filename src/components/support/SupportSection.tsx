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
      <p className="support-kicker">おまけ</p>
      <h2 id="support-heading">願掛け（開発への支援）はこちらから</h2>
      <p className="support-lead">「良い席が当たりますように」。願掛けしたくなったら、お賽銭の気持ちで開発を応援できます。</p>
      <a className="support-button" href={href} target="_blank" rel="noopener noreferrer">
        支援する
      </a>
      <ul className="support-notes">
        <li>ご支援の有無に関わらず、すべての機能は無料です。</li>
        <li>ご支援いただいても抽選結果や当たりやすさは変わりません。</li>
        <li>金額は自由に決めていただけます。</li>
      </ul>
      <p className="support-fineprint">お支払いは別タブで開くStripeの決済ページで完了します。当サイトの画面でカード番号等の決済情報を入力することはありません。</p>
    </section>
  )
}
