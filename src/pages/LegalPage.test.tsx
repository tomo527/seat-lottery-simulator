import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LegalPage } from './LegalPage'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LegalPage', () => {
  it('利用規約に必要な項目とナビゲーションを表示し、架空の連絡先を掲載しない', () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    render(<LegalPage route="terms" />)
    expect(screen.getByRole('heading', { name: '利用規約', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/無料で利用できるエンターテインメント用/)).toBeInTheDocument()
    expect(screen.getByText(/チケット販売会社その他の事業者とは提携・関係していません/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '第4条（禁止事項）' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '第8条（免責事項）' })).toBeInTheDocument()
    expect(screen.getByText(/日本法を準拠法/)).toBeInTheDocument()
    expect(screen.queryByText(/問い合わせ|メールアドレス|電話番号|運営会社/)).not.toBeInTheDocument()
    expect(screen.queryByText(/took\.jp|webサクッとツールズ/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← TOPへ戻る' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '利用規約' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('利用規約｜座席抽選シミュレーター')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('プライバシーポリシーを実装実態に合わせ、連絡先を設けない', () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    render(<LegalPage route="privacy" />)
    expect(screen.getByRole('heading', { name: 'プライバシーポリシー', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/アカウント登録、氏名・住所・メールアドレスの入力/)).toBeInTheDocument()
    expect(screen.getByText(/seat-lottery-preferences-v1/)).toBeInTheDocument()
    expect(screen.getByText(/現在保存する設定は/)).toHaveTextContent('venueId')
    expect(screen.getByRole('heading', { name: '3. ブラウザ内に保存する情報' }).parentElement).toHaveTextContent('URLの venue クエリ')
    expect(screen.getByText(/Cloudflare Workers Static Assets/)).toBeInTheDocument()
    expect(screen.getByText(/保存期間は、ホスティング事業者の設定および方針/)).toBeInTheDocument()
    expect(screen.getByText(/Web Share機能/)).toBeInTheDocument()
    expect(screen.getByText(/選択会場のIDを含む場合がある現在のページURL/)).toBeInTheDocument()
    expect(screen.getByText(/クリップボードへコピー/)).toBeInTheDocument()
    expect(screen.getByText(/広告配信や行動追跡を目的とするCookie/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /問い合わせ/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/お問い合わせはこちら|@|電話番号|運営会社/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('プライバシーポリシー｜座席抽選シミュレーター')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
