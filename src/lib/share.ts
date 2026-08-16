import { formatRowLabel, formatSeatNumber } from '../domain/lottery/lottery'
import type { Seat } from '../types/venue'

export type ShareOutcome = 'intent' | 'blocked'

export const X_INTENT_ENDPOINT = 'https://x.com/intent/tweet'

const INTENT_WINDOW = { width: 620, height: 660 }

export const buildShareText = (venueName: string, seat: Seat): string =>
  `座席抽選シミュレーターの結果、${venueName}の${seat.sectionLabel ? `${seat.sectionLabel} ` : ''}${formatRowLabel(seat.rowLabel)}${formatSeatNumber(seat.number)}でした！`

export const buildXIntentUrl = (text: string, url: string): string =>
  `${X_INTENT_ENDPOINT}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

// OS標準の共有メニューを経由せず、クリックのuser activationのままXの投稿画面を開く。
export const shareResult = (text: string, url: string): ShareOutcome => {
  const { width, height } = INTENT_WINDOW
  const viewportWidth = window.outerWidth || window.innerWidth || width
  const viewportHeight = window.outerHeight || window.innerHeight || height
  const left = Math.max(0, Math.round((window.screenX || 0) + (viewportWidth - width) / 2))
  const top = Math.max(0, Math.round((window.screenY || 0) + (viewportHeight - height) / 3))
  try {
    const popup = window.open(buildXIntentUrl(text, url), '_blank', `popup=yes,width=${width},height=${height},left=${left},top=${top}`)
    if (!popup) return 'blocked'
    popup.focus?.()
    return 'intent'
  } catch (error) {
    console.warn('Could not open the X post window.', error)
    return 'blocked'
  }
}
