const STORAGE_KEY = 'seat-lottery-preferences-v1'

export type Preferences = {
  venueId?: string
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
