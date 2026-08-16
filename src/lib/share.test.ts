import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Seat } from '../types/venue'
import { buildShareText, buildXIntentUrl, shareResult, X_INTENT_ENDPOINT } from './share'

const seat: Seat = { venueId: 'v', venueName: '会場', layoutId: 'l', layoutName: '標準', sectionId: 's', sectionLabel: '2階', rowLabel: '南A', number: 15 }
const url = 'https://seat-lottery.example.com/?venue=nippon-budokan-standard'
const text = '座席抽選シミュレーターの結果、日本武道館の2階 南A列15番でした！'

afterEach(() => { vi.restoreAllMocks() })

describe('buildShareText', () => {
  it('会場・エリア・列・座席番号を結果表示と同じ表記で1行にまとめる', () => {
    const built = buildShareText('日本武道館', seat)
    expect(built).toBe(text)
    expect(built).not.toContain('\n')
    expect(built).not.toMatch(/※|免責|遊び/)
    expect(built).not.toContain(url)
  })

  it('エリアがない自作座席でも自然な一文になる', () => {
    expect(buildShareText('マイ会場', { ...seat, sectionId: '', sectionLabel: undefined, rowLabel: 'A', number: 3 }))
      .toBe('座席抽選シミュレーターの結果、マイ会場のA列3番でした！')
  })

  it('列・番号の接尾辞を重複させない', () => {
    expect(buildShareText('明治座', { ...seat, sectionLabel: undefined, rowLabel: 'い列', number: 12 }))
      .toBe('座席抽選シミュレーターの結果、明治座のい列12番でした！')
  })

  it('長い日本語の会場名でも基本形を保つ', () => {
    expect(buildShareText('新国立劇場 中劇場（プロセニアム形式③ A・B号迫り使用）', { ...seat, sectionLabel: '1階', rowLabel: '12', number: 4 }))
      .toBe('座席抽選シミュレーターの結果、新国立劇場 中劇場（プロセニアム形式③ A・B号迫り使用）の1階 12列4番でした！')
  })
})

describe('buildXIntentUrl', () => {
  it('本文とURLをX Web Intentへ正しくエンコードする', () => {
    const intent = buildXIntentUrl(text, url)
    expect(intent.startsWith(`${X_INTENT_ENDPOINT}?`)).toBe(true)
    const params = new URL(intent).searchParams
    expect(params.get('text')).toBe(text)
    expect(params.get('url')).toBe(url)
    expect(intent).toContain(`text=${encodeURIComponent(text)}`)
    expect(intent).toContain(`url=${encodeURIComponent(url)}`)
    expect(intent).not.toContain(' ')
  })
})

describe('shareResult', () => {
  it('OS共有APIを使わず、同期でX Web Intentのウィンドウを開く', () => {
    const share = vi.fn()
    const canShare = vi.fn()
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: canShare })
    const open = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window)

    expect(shareResult(text, url)).toBe('intent')

    expect(share).not.toHaveBeenCalled()
    expect(canShare).not.toHaveBeenCalled()
    const [intentUrl, target, features] = open.mock.calls[0]
    expect(intentUrl).toBe(buildXIntentUrl(text, url))
    expect(new URL(String(intentUrl)).searchParams.get('text')).toBe(text)
    expect(new URL(String(intentUrl)).searchParams.get('url')).toBe(url)
    expect(target).toBe('_blank')
    expect(String(features)).toContain('width=620')
  })

  it('開いたウィンドウへフォーカスする', () => {
    const focus = vi.fn()
    vi.spyOn(window, 'open').mockReturnValue({ focus } as unknown as Window)
    shareResult(text, url)
    expect(focus).toHaveBeenCalledTimes(1)
  })

  it('ポップアップがブロックされた場合はblockedを返す', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    expect(shareResult(text, url)).toBe('blocked')
  })

  it('window.openが例外を投げてもblockedとして扱う', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(window, 'open').mockImplementation(() => { throw new Error('blocked by policy') })
    expect(shareResult(text, url)).toBe('blocked')
  })
})
