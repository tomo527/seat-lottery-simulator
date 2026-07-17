import { beforeEach, describe, expect, it } from 'vitest'
import { loadPreferences, savePreferences } from './preferences'

beforeEach(() => localStorage.clear())

describe('preferences', () => {
  it('壊れたlocalStorageデータを無視する', () => {
    localStorage.setItem('seat-lottery-preferences-v1', '{broken')
    expect(loadPreferences()).toEqual({})
  })

  it('会場だけを保存・復元する', () => {
    savePreferences({ venueId: 'demo' })
    expect(loadPreferences()).toEqual({ venueId: 'demo' })
  })

  it('旧バージョンの当落設定は安全に無視する', () => {
    localStorage.setItem('seat-lottery-preferences-v1', JSON.stringify({ venueId: 'demo', lotteryMode: 'chance-and-seat', probability: 70 }))
    expect(loadPreferences()).toEqual({ venueId: 'demo' })
  })
})
