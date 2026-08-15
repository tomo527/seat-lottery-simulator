import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { resolveSupportPaymentLink, SUPPORT_PAYMENT_LINK_URL } from '../../config/support'
import { SupportSection } from './SupportSection'

const VALID_LINK = 'https://buy.stripe.com/test_payment_link'

describe('SupportSection', () => {
  it('Payment Link未設定なら支援エリアを一切表示しない', () => {
    const { container } = render(<SupportSection paymentLinkUrl="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it.each(['   ', 'buy.stripe.com/abc', 'http://buy.stripe.com/abc', 'javascript:alert(1)', 'https://localhost'])(
    '不正な設定値%sではリンクを表示しない',
    (url) => {
      const { container } = render(<SupportSection paymentLinkUrl={url} />)
      expect(container).toBeEmptyDOMElement()
    },
  )

  it('現在の設定値では本番Payment Linkへのリンクを表示する', () => {
    expect(resolveSupportPaymentLink(SUPPORT_PAYMENT_LINK_URL)).toBe('https://buy.stripe.com/cNidRbb7kfvKgiA4mbdnW00')
    render(<SupportSection />)
    expect(screen.getByRole('link', { name: /お賽銭を入れる/ })).toHaveAttribute('href', 'https://buy.stripe.com/cNidRbb7kfvKgiA4mbdnW00')
  })

  it('Payment Link設定後は願掛けの案内と外部リンクを表示する', () => {
    render(<SupportSection paymentLinkUrl={VALID_LINK} />)
    expect(screen.getByRole('heading', { name: '願掛け（開発への支援）はこちらから', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/良い席が当たりますように/)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /お賽銭を入れる/ })
    expect(link).toHaveAttribute('href', VALID_LINK)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('無料利用・抽選結果不変・見返りなしを明示する', () => {
    render(<SupportSection paymentLinkUrl={VALID_LINK} />)
    expect(screen.getByText(/すべての機能をこのまま無料で使えます/)).toBeInTheDocument()
    expect(screen.getByText(/抽選結果や当たりやすさは変わりません/)).toBeInTheDocument()
    expect(screen.getByText(/特典やお返しはありません/)).toBeInTheDocument()
    expect(screen.getByText(/Stripeの決済ページ/)).toBeInTheDocument()
  })

  it('画像やSVGを使わず、結果カードの外に置ける独立セクションである', () => {
    const { container } = render(<SupportSection paymentLinkUrl={VALID_LINK} />)
    expect(container.querySelector('svg, img')).toBeNull()
    expect(container.querySelector('.result-card')).toBeNull()
    expect(container.firstElementChild).toHaveClass('support-section')
  })
})

describe('resolveSupportPaymentLink', () => {
  it('未設定・非https・不正URLをnullとして扱う', () => {
    expect(resolveSupportPaymentLink('')).toBeNull()
    expect(resolveSupportPaymentLink('  ')).toBeNull()
    expect(resolveSupportPaymentLink('http://buy.stripe.com/abc')).toBeNull()
    expect(resolveSupportPaymentLink('buy.stripe.com/abc')).toBeNull()
    expect(resolveSupportPaymentLink('https://localhost')).toBeNull()
  })

  it('https URLは前後の空白を除いて正規化して返す', () => {
    expect(resolveSupportPaymentLink(`  ${VALID_LINK}  `)).toBe(VALID_LINK)
    expect(resolveSupportPaymentLink('https://pay.example.com/support')).toBe('https://pay.example.com/support')
  })
})
