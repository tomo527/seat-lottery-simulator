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
    expect(screen.getByText(/各会場が公開する座席図・施設資料/)).toBeInTheDocument()
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

  it('利用規約で開発支援を任意・無償・特典なしとして定める', () => {
    render(<LegalPage route="terms" />)
    expect(screen.getByRole('heading', { name: '第10条（任意の開発支援）' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '第11条（準拠法）' })).toBeInTheDocument()
    expect(screen.getByText(/支援の有無にかかわらず、すべての機能を無料で利用できます/)).toBeInTheDocument()
    expect(screen.getByText(/開発支援は完全に任意であり、本サイトの利用条件ではありません/)).toBeInTheDocument()
    expect(screen.getByText(/抽選結果、当たりやすさ、抽選対象の座席が変わることはありません/)).toBeInTheDocument()
    expect(screen.getByText(/対価となる商品または役務の提供はありません/)).toBeInTheDocument()
    expect(screen.getByText(/Stripe社が提供するPayment Linkの決済ページ/)).toBeInTheDocument()
    expect(screen.getByText(/Stripeの管理画面等を通じて/)).toBeInTheDocument()
    expect(screen.getByText(/法令上返金が必要な場合/)).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/運営者は決済情報を取得しません/)
  })

  it('プライバシーポリシーで外部決済ページの構造を正確に説明する', () => {
    render(<LegalPage route="privacy" />)
    expect(screen.getByRole('heading', { name: '7. 開発支援（外部の決済ページ）' })).toBeInTheDocument()
    expect(screen.getByText(/本サイトがカード番号等の決済情報を取得・保存することはありません/)).toBeInTheDocument()
    expect(screen.getByText(/決済に関するSDKや埋め込みの決済フォームも読み込んでいない/)).toBeInTheDocument()
    expect(screen.getByText(/支援用のリンクを開かない限り、本サイトからStripe社への通信は発生しません/)).toBeInTheDocument()
    expect(screen.getByText(/運営者は、Stripeの管理画面等を通じて、支援額、決済状況その他Stripe社が提供する支払いに関する情報を確認できる場合があります/)).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/運営者は決済情報を取得しません/)
  })

  it('特定商取引法に基づく表記の必須項目を表示する', () => {
    const fetchSpy = vi.spyOn(window, 'fetch')
    render(<LegalPage route="tokushoho" />)
    expect(screen.getByRole('heading', { name: '特定商取引法に基づく表記', level: 1 })).toBeInTheDocument()
    for (const term of ['販売事業者（氏名）', '所在地', '電話番号', '開示請求・連絡方法', '販売価格', '販売価格以外に必要となる料金', '支払方法', '支払時期', '提供時期', 'キャンセル・返金', '支援による特典・役務の有無']) {
      expect(screen.getByText(term)).toBeInTheDocument()
    }
    expect(screen.getAllByText(/支援のお申込み前にご確認いただけるよう、遅滞なく開示します/)).toHaveLength(3)
    expect(screen.getByText(/1回あたり50円以上/)).toBeInTheDocument()
    expect(screen.getByText(/対価として引き渡す商品やデジタルコンテンツ、提供する役務はありません/)).toBeInTheDocument()
    expect(screen.getByText(/カード番号等の決済情報の入力と処理はStripe社の決済ページ上で行われ/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '特定商取引法に基づく表記' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('特定商取引法に基づく表記｜座席抽選シミュレーター')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('開示請求先のメールを表示し、氏名・住所・電話番号は請求時開示にとどめる', () => {
    render(<LegalPage route="tokushoho" />)
    const mail = screen.getByRole('link', { name: 'studiotomo99@gmail.com' })
    expect(mail).toHaveAttribute('href', 'mailto:studiotomo99@gmail.com')
    expect(screen.getByText(/氏名、所在地および電話番号の開示のご請求は、このメールアドレスで受け付けます/)).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/7日以内|営業日以内/)
    expect(document.body.textContent).not.toMatch(/https?:\/\//)
  })

  it('Payment Link設定後は受付無効の注意書きを表示しない', () => {
    render(<LegalPage route="tokushoho" />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/現在、開発支援の受付は無効です。/)
  })

  it('フッターから3つの法務ページへ移動できる', () => {
    render(<LegalPage route="terms" />)
    expect(screen.getByRole('link', { name: '利用規約' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: '特定商取引法に基づく表記' })).toHaveAttribute('href', '/tokushoho')
  })
})
