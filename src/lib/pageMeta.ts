const DEFAULT_DESCRIPTION = '今日の席運を気軽に試せる、遊びのための座席抽選シミュレーターです。'

export const PAGE_META = {
  home: {
    title: '座席抽選シミュレーター',
    description: DEFAULT_DESCRIPTION,
  },
  terms: {
    title: '利用規約｜座席抽選シミュレーター',
    description: '座席抽選シミュレーターの利用条件、禁止事項、免責事項などをご案内します。',
  },
  privacy: {
    title: 'プライバシーポリシー｜座席抽選シミュレーター',
    description: '座席抽選シミュレーターにおけるブラウザ保存情報やアクセス情報の取り扱いをご案内します。',
  },
} as const

export function applyPageMeta(meta: { title: string; description: string }) {
  document.title = meta.title
  let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!description) {
    description = document.createElement('meta')
    description.name = 'description'
    document.head.append(description)
  }
  description.content = meta.description
}
