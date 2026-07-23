import './SiteLayout.css'

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="座席抽選シミュレーター トップ">
        <span className="brand-mark" aria-hidden="true">★</span>
        <span>座席抽選<br /><strong>シミュレーター</strong></span>
      </a>
    </header>
  )
}
