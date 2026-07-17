import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Seat } from '../types/venue'
import { buildClipboardText, buildShareText, shareResult } from './share'

const seat: Seat = { venueId: 'v', venueName: '会場', layoutId: 'l', layoutName: '標準', sectionId: 's', sectionLabel: 'Aエリア', rowLabel: 'B', number: 10 }
const url = 'https://example.com/?venue=v'

const setShareApis = (share: unknown, writeText: unknown) => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: share })
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
}

afterEach(() => {
  setShareApis(undefined, undefined)
  vi.restoreAllMocks()
})

describe('share copy', () => {
  it('共有本文に座席とシミュレーション表記を含み、当落とURLを含めない', () => {
    const text = buildShareText('会場', seat)
    expect(text).toContain('座席抽選シミュレーター')
    expect(text).toContain('Aエリア B列 10番')
    expect(text).toContain('シミュレーション')
    expect(text).not.toMatch(/当選|落選/)
    expect(text).not.toContain(url)
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

  it('Web Share API失敗時は本文とURLを結合してClipboardへフォールバックする', async () => {
    const share = vi.fn().mockRejectedValue(new Error('share failed'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    setShareApis(share, writeText)
    const text = buildShareText('会場', seat)

    await expect(shareResult(text, url)).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith(buildClipboardText(text, url))
  })

  it('Web Share APIのAbortErrorはcancelledとしClipboardへ送らない', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    setShareApis(share, writeText)

    await expect(shareResult(buildShareText('会場', seat), url)).resolves.toBe('cancelled')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('共有APIもClipboardも利用できない場合はunavailableを返す', async () => {
    setShareApis(undefined, undefined)
    await expect(shareResult(buildShareText('会場', seat), url)).resolves.toBe('unavailable')
  })
})
