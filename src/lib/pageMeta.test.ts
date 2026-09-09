import { afterEach, describe, expect, it } from 'vitest'
import { applyPageMeta, PAGE_META } from './pageMeta'

afterEach(() => {
  document.head.innerHTML = ''
})

describe('applyPageMeta', () => {
  it('ホームのcanonicalと共有用メタデータを正規URLにそろえる', () => {
    applyPageMeta(PAGE_META.home)

    expect(document.title).toBe(PAGE_META.home.title)
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', PAGE_META.home.description)
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://seat-lottery-simulator.studiotomo.workers.dev/')
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', PAGE_META.home.title)
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://seat-lottery-simulator.studiotomo.workers.dev/')
    expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute('content', PAGE_META.home.description)
  })

  it('法務ページではcanonicalと共有用メタデータを現在のページへ更新する', () => {
    applyPageMeta(PAGE_META.privacy)

    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://seat-lottery-simulator.studiotomo.workers.dev/privacy')
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', PAGE_META.privacy.title)
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://seat-lottery-simulator.studiotomo.workers.dev/privacy')
  })
})
