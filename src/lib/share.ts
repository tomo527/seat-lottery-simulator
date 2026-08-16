import { formatRowLabel, formatSeatNumbers } from '../domain/lottery/lottery'
import type { Seat } from '../types/venue'

export type ShareOutcome = 'intent' | 'blocked'

export const X_INTENT_ENDPOINT = 'https://x.com/intent/tweet'

const INTENT_WINDOW = { width: 600, height: 560 }
const INTENT_WINDOW_NAME = 'intent'
const DESKTOP_QUERY = '(min-width: 640px)'

export const buildShareText = (venueName: string, seats: readonly Seat[]): string => {
  const [seat] = seats
  return `座席抽選シミュレーターの結果、${venueName}の${seat.sectionLabel ? `${seat.sectionLabel} ` : ''}${formatRowLabel(seat.rowLabel)}${formatSeatNumbers(seats)}でした！`
}

export const buildXIntentUrl = (text: string, url: string): string =>
  `${X_INTENT_ENDPOINT}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

const prefersPopupWindow = (): boolean => {
  try {
    return typeof window.matchMedia === 'function' ? window.matchMedia(DESKTOP_QUERY).matches : true
  } catch {
    return true
  }
}

const popupFeatures = (): string => {
  const { width, height } = INTENT_WINDOW
  const viewportWidth = window.outerWidth || window.innerWidth || width
  const viewportHeight = window.outerHeight || window.innerHeight || height
  const left = Math.max(0, Math.round((window.screenX || 0) + (viewportWidth - width) / 2))
  const top = Math.max(0, Math.round((window.screenY || 0) + (viewportHeight - height) / 3))
  return `popup=yes,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,status=no,width=${width},height=${height},left=${left},top=${top}`
}

// OS標準の共有メニューを経由せず、クリックのuser activationのままXの投稿画面を開く。
export const shareResult = (text: string, url: string): ShareOutcome => {
  const intentUrl = buildXIntentUrl(text, url)
  try {
    // PCはX公式ウィジェットと同じ名前付きポップアップ、モバイルはXアプリ/Web Intentへの遷移に任せる。
    const popup = prefersPopupWindow()
      ? window.open(intentUrl, INTENT_WINDOW_NAME, popupFeatures())
      : window.open(intentUrl, '_blank')
    if (!popup) return 'blocked'
    popup.focus?.()
    return 'intent'
  } catch (error) {
    console.warn('Could not open the X post window.', error)
    return 'blocked'
  }
}
