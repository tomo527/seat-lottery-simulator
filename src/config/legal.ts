/**
 * 特定商取引法に基づく表記のうち、こちらの実データ入力が必要な項目を集約した設定ファイル。
 *
 * 個人事業者のため、氏名・住所・電話番号はページへ常時掲載せず、
 * 「請求があった場合に、支援のお申込み前に確認できるよう遅滞なく開示する」方式を採る。
 * したがってページ上で常に必要な実データは、開示請求を受け付けるメールアドレスだけである。
 * 屋号やサイト名を販売事業者の正式名称として代用しない。
 *
 * 開示請求先が未設定・不正な間は`isSellerDisclosureComplete()`がfalseを返し、
 * `src/config/support.ts`の支援リンクも無効のままになる。
 * これにより、開示請求先のない特商法表記のまま決済を有効化することはできない。
 */
export type SellerDisclosure = {
  /** 開示請求・問い合わせを受け付けるメールアドレス。必須。 */
  contactEmail: string
}

export const SELLER_DISCLOSURE: SellerDisclosure = {
  contactEmail: 'studiotomo99@gmail.com',
}

/** 支援1回あたりの最低金額（円）。Stripe側のPayment Link設定と一致させること。 */
export const MINIMUM_SUPPORT_AMOUNT_JPY = 50

/** 開示請求先として使えるメールアドレスかどうか。 */
export const isContactEmail = (email: string): boolean => {
  const trimmed = email.trim()
  if (trimmed.length === 0 || /\s/.test(trimmed)) return false
  const [local, domain, ...rest] = trimmed.split('@')
  if (rest.length > 0) return false
  return Boolean(local) && Boolean(domain) && domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.')
}

/** 特商法表記に必要な実データが設定済みかどうか。 */
export const isSellerDisclosureComplete = (disclosure: SellerDisclosure = SELLER_DISCLOSURE): boolean =>
  isContactEmail(disclosure.contactEmail)

/** 開示請求先の`mailto:`リンク。未設定・不正な場合はnull。 */
export const contactMailtoHref = (disclosure: SellerDisclosure = SELLER_DISCLOSURE): string | null =>
  isContactEmail(disclosure.contactEmail) ? `mailto:${disclosure.contactEmail.trim()}` : null
