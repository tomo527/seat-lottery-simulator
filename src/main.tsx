import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { applyPageMeta, PAGE_META } from './lib/pageMeta'
import { resolvePageRoute } from './lib/routes'
import { LegalPage } from './pages/LegalPage'

const root = createRoot(document.getElementById('root')!)
const route = resolvePageRoute(window.location.pathname)

if (route === 'terms' || route === 'privacy') {
  root.render(
    <StrictMode>
      <LegalPage route={route} />
    </StrictMode>,
  )
} else {
  applyPageMeta(PAGE_META.home)
  void import('./App.tsx').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
}
