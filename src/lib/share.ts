import { formatSeatLabel, type LotteryResult } from '../domain/lottery/lottery'

export type ShareOutcome = 'shared' | 'copied' | 'unavailable' | 'cancelled'

export const buildShareText = (venueName: string, result: LotteryResult): string => {
  const outcome = result.status === 'won' ? `当選！ ${formatSeatLabel(result.seat)}` : '今回は落選'
  return `座席抽選シミュレーターで「${venueName}」を試しました。\n結果: ${outcome}\n※実際の抽選とは無関係なシミュレーションです。`
}

export const buildClipboardText = (text: string, url: string): string => `${text}\n${url}`

export const shareResult = async (text: string, url: string): Promise<ShareOutcome> => {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: '座席抽選シミュレーター', text, url })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }

  try {
    if (typeof navigator.clipboard?.writeText === 'function') {
      await navigator.clipboard.writeText(buildClipboardText(text, url))
      return 'copied'
    }
  } catch (error) {
    console.warn('Could not copy the simulation result.', error)
  }
  return 'unavailable'
}
