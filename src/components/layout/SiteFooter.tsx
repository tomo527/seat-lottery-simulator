import './SiteLayout.css'

type SiteFooterProps = {
  currentPath?: '/' | '/terms' | '/privacy' | '/tokushoho'
}

export function SiteFooter({ currentPath }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <strong>座席抽選シミュレーター</strong>
      <p>すべての結果はエンターテインメント目的の架空シミュレーションです。</p>
      <nav className="legal-links" aria-label="法務情報">
        <a href="/terms" aria-current={currentPath === '/terms' ? 'page' : undefined}>利用規約</a>
        <span aria-hidden="true">｜</span>
        <a href="/privacy" aria-current={currentPath === '/privacy' ? 'page' : undefined}>プライバシーポリシー</a>
        <span aria-hidden="true">｜</span>
        <a href="/tokushoho" aria-current={currentPath === '/tokushoho' ? 'page' : undefined}>特定商取引法に基づく表記</a>
      </nav>
      <p className="site-copyright">© 2026 座席抽選シミュレーター</p>
      <span className="footer-tagline">NO REAL TICKET DATA · NO PREDICTIONS</span>
    </footer>
  )
}
