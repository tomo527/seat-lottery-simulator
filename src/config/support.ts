import { isSellerDisclosureComplete } from './legal'

/**
 * 願掛け（開発への支援）で使うStripe Payment LinkのURL。
 *
 * 有効化するときは、この定数へStripe Dashboardで発行したPayment Link URLを設定するだけでよい。
 * 例: 'https://buy.stripe.com/xxxxxxxxxxxxxxxx'（Payment Linkのカスタムドメインを使う場合はそのURL）
 */
const CONFIGURED_PAYMENT_LINK_URL: string = 'https://buy.stripe.com/cNidRbb7kfvKgiA4mbdnW00'

/**
 * 実際に使用されるPayment Link URL。
 *
 * `src/config/legal.ts`の特商法表記が未完成の間は空文字となり、支援エリア自体が描画されない。
 * 空文字やhttps以外の値の間も同様なので、壊れたリンクや不完全な表記のまま決済導線が公開されることはない。
 */
export const SUPPORT_PAYMENT_LINK_URL: string = isSellerDisclosureComplete() ? CONFIGURED_PAYMENT_LINK_URL : ''

/** 設定値が実際に開けるhttps URLのときだけ正規化して返し、それ以外はnullを返す。 */
export const resolveSupportPaymentLink = (url: string = SUPPORT_PAYMENT_LINK_URL): string | null => {
  const trimmed = url.trim()
  if (trimmed.length === 0) return null
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' && parsed.hostname.includes('.') ? parsed.toString() : null
  } catch {
    return null
  }
}
