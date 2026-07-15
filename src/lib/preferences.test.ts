import { beforeEach, describe, expect, it } from 'vitest'
import { loadPreferences, savePreferences } from './preferences'

beforeEach(() => localStorage.clear())

describe('preferences', () => {
  it('壊れたlocalStorageデータを無視する', () => {
    localStorage.setItem('seat-lottery-preferences-v1', '{broken')
    expect(loadPreferences()).toEqual({})
  })

  it('許可された設定だけを復元する', () => {
    savePreferences({ venueId: 'demo', lotteryMode: 'chance-and-seat', probability: 70 })
    expect(loadPreferences()).toEqual({ venueId: 'demo', lotteryMode: 'chance-and-seat', probability: 70 })
  })
})
