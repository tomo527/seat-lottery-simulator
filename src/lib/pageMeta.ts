const SITE_ORIGIN = 'https://seat-lottery-simulator.studiotomo.workers.dev'
const HOME_TITLE = '座席抽選シミュレーター｜ライブ・イベント会場の座席をランダム抽選'
const HOME_DESCRIPTION = 'ライブ・コンサート・イベント会場の代表的な座席配置から、1〜4席をランダム抽選できる座席抽選シミュレーター。実際の座席割り当てとは無関係な、願掛け・運試し用の無料ツールです。'

export const PAGE_META = {
  home: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
  },
  terms: {
    title: '利用規約｜座席抽選シミュレーター',
    description: '座席抽選シミュレーターの利用条件、禁止事項、免責事項などをご案内します。',
    path: '/terms',
  },
  privacy: {
    title: 'プライバシーポリシー｜座席抽選シミュレーター',
    description: '座席抽選シミュレーターにおけるブラウザ保存情報やアクセス情報の取り扱いをご案内します。',
    path: '/privacy',
  },
  tokushoho: {
    title: '特定商取引法に基づく表記｜座席抽選シミュレーター',
    description: '座席抽選シミュレーターで任意にお受けする開発支援について、特定商取引法に基づく表記をご案内します。',
    path: '/tokushoho',
  },
} as const

const setMetaContent = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

export function applyPageMeta(meta: { title: string; description: string; path: string }) {
  document.title = meta.title
  const canonicalUrl = new URL(meta.path, SITE_ORIGIN).toString()
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = canonicalUrl
  setMetaContent('meta[name="description"]', 'name', 'description', meta.description)
  setMetaContent('meta[property="og:title"]', 'property', 'og:title', meta.title)
  setMetaContent('meta[property="og:description"]', 'property', 'og:description', meta.description)
  setMetaContent('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
  setMetaContent('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title)
  setMetaContent('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description)
}
