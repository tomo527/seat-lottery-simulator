import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Seat } from '../types/venue'
import { buildClipboardText, buildShareText, shareResult } from './share'

const seat: Seat = { venueId: 'v', venueName: '会場', layoutId: 'l', layoutName: '標準', sectionId: 's', sectionLabel: 'Aエリア', rowLabel: 'B', number: 10 }
const url = 'https://example.com/?venue=v'
const setShareApis = (share: unknown, writeText: unknown) => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: share })
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: writeText ? { writeText } : undefined })
}

afterEach(() => { setShareApis(undefined, undefined); vi.restoreAllMocks() })

describe('share copy', () => {
  it('会場・エリア・列・番号とシミュレーション表記だけを含む', () => {
    const text = buildShareText('会場', seat)
    expect(text).toContain('座席抽選シミュレーター')
    expect(text).toContain('Aエリア B列 10番')
    expect(text).toContain('シミュレーション')
    expect(text).not.toMatch(/公式|確認日|データ精度|座席図/)
    expect(text).not.toContain(url)
  })

  it('エリアがない場合は自然に省略する', () => {
    expect(buildShareText('会場', { ...seat, sectionLabel: undefined })).toContain('「B列 10番」')
  })

  it('Web Share APIでは本文とURLフィールドを分ける', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn()
    setShareApis(share, writeText)
    const text = buildShareText('会場', seat)
    await expect(shareResult(text, url)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith({ title: '座席抽選シミュレーター', text, url })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('Web Share失敗時は本文とURLをClipboardへコピーする', async () => {
    const share = vi.fn().mockRejectedValue(new Error('share failed'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    setShareApis(share, writeText)
    const text = buildShareText('会場', seat)
    await expect(shareResult(text, url)).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith(buildClipboardText(text, url))
  })

  it('AbortErrorはcancelled、API未提供時はunavailableを返す', async () => {
    const writeText = vi.fn()
    setShareApis(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')), writeText)
    await expect(shareResult(buildShareText('会場', seat), url)).resolves.toBe('cancelled')
    expect(writeText).not.toHaveBeenCalled()
    setShareApis(undefined, undefined)
    await expect(shareResult(buildShareText('会場', seat), url)).resolves.toBe('unavailable')
  })
})
