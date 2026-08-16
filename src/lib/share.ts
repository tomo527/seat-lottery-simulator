import { formatRowLabel, formatSeatNumber } from '../domain/lottery/lottery'
import { createShareImageFile } from './shareImage'
import type { Seat } from '../types/venue'

export type ShareOutcome = 'shared' | 'intent' | 'blocked' | 'cancelled' | 'failed'

export const X_INTENT_ENDPOINT = 'https://x.com/intent/tweet'

const INTENT_WINDOW = { width: 620, height: 660 }

export const prepareShareImage = createShareImageFile

export const buildShareText = (venueName: string, seat: Seat): string =>
  `座席は${venueName}の${seat.sectionLabel ? `${seat.sectionLabel} ` : ''}${formatRowLabel(seat.rowLabel)}${formatSeatNumber(seat.number)}でした！`

export const buildXIntentUrl = (text: string, url: string): string =>
  `${X_INTENT_ENDPOINT}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

export const canShareImageFile = (file: File | null): file is File => {
  if (!file || typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false
  try {
    return navigator.canShare({ files: [file] })
  } catch {
    return false
  }
}

const openXIntentWindow = (text: string, url: string): ShareOutcome => {
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

// 事前生成したPNGだけを受け取り、user activationを消費する呼び出しを同期的に行う。
export const shareResult = (text: string, url: string, file: File | null): Promise<ShareOutcome> => {
  if (!canShareImageFile(file)) return Promise.resolve(openXIntentWindow(text, url))
  return navigator.share({ files: [file], text, url }).then((): ShareOutcome => 'shared', (error: unknown): ShareOutcome => {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    console.warn('Could not share the result image.', error)
    return 'failed'
  })
}
