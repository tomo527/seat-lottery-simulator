import type { LotteryMode } from '../domain/lottery/lottery'

const STORAGE_KEY = 'seat-lottery-preferences-v1'

export type Preferences = {
  venueId?: string
  lotteryMode?: LotteryMode
  probability?: number
}

export const loadPreferences = (): Preferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const value = parsed as Record<string, unknown>
    return {
      venueId: typeof value.venueId === 'string' ? value.venueId : undefined,
      lotteryMode: value.lotteryMode === 'seat-only' || value.lotteryMode === 'chance-and-seat' ? value.lotteryMode : undefined,
      probability: typeof value.probability === 'number' && value.probability >= 0 && value.probability <= 100 ? value.probability : undefined,
    }
  } catch {
    return {}
  }
}

export const savePreferences = (preferences: Preferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.warn('Could not save local preferences.', error)
  }
}
