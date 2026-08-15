import { describe, expect, it } from 'vitest'
import { contactMailtoHref, isContactEmail, isSellerDisclosureComplete, SELLER_DISCLOSURE } from './legal'
import { SUPPORT_PAYMENT_LINK_URL, resolveSupportPaymentLink } from './support'

describe('isContactEmail', () => {
  it('開示請求先として使えるメールアドレスを受け入れる', () => {
    expect(isContactEmail('studiotomo99@gmail.com')).toBe(true)
    expect(isContactEmail('  studiotomo99@gmail.com  ')).toBe(true)
  })

  it.each(['', '   ', 'studiotomo99', 'studiotomo99@', '@gmail.com', 'a@b', 'a@b.', 'a b@example.com', 'a@b@example.com'])(
    '不正な値%sを拒否する',
    (value) => {
      expect(isContactEmail(value)).toBe(false)
    },
  )
})

describe('isSellerDisclosureComplete', () => {
  it('開示請求先が設定済みなので完全と判定する', () => {
    expect(isSellerDisclosureComplete()).toBe(true)
    expect(SELLER_DISCLOSURE.contactEmail).toBe('studiotomo99@gmail.com')
  })

  it('開示請求先が未設定・不正なら不完全と判定する', () => {
    expect(isSellerDisclosureComplete({ contactEmail: '' })).toBe(false)
    expect(isSellerDisclosureComplete({ contactEmail: 'not-an-email' })).toBe(false)
  })
})

describe('contactMailtoHref', () => {
  it('mailtoリンクを組み立てる', () => {
    expect(contactMailtoHref()).toBe('mailto:studiotomo99@gmail.com')
    expect(contactMailtoHref({ contactEmail: '' })).toBeNull()
  })
})

describe('支援リンクの安全ゲート', () => {
  it('開示請求先が設定済みなので本番Payment Linkが有効になる', () => {
    expect(isSellerDisclosureComplete()).toBe(true)
    expect(SUPPORT_PAYMENT_LINK_URL).toBe('https://buy.stripe.com/cNidRbb7kfvKgiA4mbdnW00')
    expect(resolveSupportPaymentLink()).toBe('https://buy.stripe.com/cNidRbb7kfvKgiA4mbdnW00')
  })

  it('開示請求先が無効な設定では支援リンクを解決しない', () => {
    expect(isSellerDisclosureComplete({ contactEmail: '' })).toBe(false)
    expect(resolveSupportPaymentLink(isSellerDisclosureComplete({ contactEmail: '' }) ? SUPPORT_PAYMENT_LINK_URL : '')).toBeNull()
  })
})
