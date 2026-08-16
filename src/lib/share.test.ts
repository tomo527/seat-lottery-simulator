import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Seat } from '../types/venue'
import { buildShareText, buildXIntentUrl, canShareImageFile, prepareShareImage, shareResult, X_INTENT_ENDPOINT } from './share'
import { installCanvasStub, installUnsupportedCanvasStub, restoreCanvasStub } from '../test/canvasStub'

const seat: Seat = { venueId: 'v', venueName: '会場', layoutId: 'l', layoutName: '標準', sectionId: 's', sectionLabel: '2階', rowLabel: '南A', number: 15 }
const url = 'https://seat-lottery.example.com/?venue=nippon-budokan-standard'
const text = '座席は日本武道館の2階 南A列15番でした！'
const imageFile = () => new File([new Uint8Array([137, 80, 78, 71])], 'seat-lottery-result.png', { type: 'image/png' })

const setShareApis = (share: unknown, canShare: unknown) => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: share })
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: canShare })
}

beforeEach(() => { installCanvasStub() })

afterEach(() => {
  setShareApis(undefined, undefined)
  restoreCanvasStub()
  vi.restoreAllMocks()
})

describe('buildShareText', () => {
  it('会場・列・座席番号だけの基本形で、追加の注記を含めない', () => {
    const built = buildShareText('日本武道館', seat)
    expect(built).toBe(text)
    expect(built).not.toContain('\n')
    expect(built).not.toMatch(/シミュレーター|シミュレーション|遊び|※/)
    expect(built).not.toContain(url)
  })

  it('エリアがない自作座席でも自然な一文になる', () => {
    expect(buildShareText('マイ会場', { ...seat, sectionId: '', sectionLabel: undefined, rowLabel: 'A', number: 3 }))
      .toBe('座席はマイ会場のA列3番でした！')
  })

  it('列・番号の接尾辞を重複させない', () => {
    expect(buildShareText('明治座', { ...seat, sectionLabel: undefined, rowLabel: 'い列', number: 12 }))
      .toBe('座席は明治座のい列12番でした！')
  })

  it('長い日本語の会場名でも基本形を保つ', () => {
    expect(buildShareText('新国立劇場 中劇場（プロセニアム形式③ A・B号迫り使用）', { ...seat, sectionLabel: '1階', rowLabel: '12', number: 4 }))
      .toBe('座席は新国立劇場 中劇場（プロセニアム形式③ A・B号迫り使用）の1階 12列4番でした！')
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

describe('prepareShareImage', () => {
  it('共有前にPNGのFileを生成できる', async () => {
    const file = await prepareShareImage({ seat, venueName: '日本武道館' })
    expect(file).toBeInstanceOf(File)
    expect(file?.type).toBe('image/png')
  })

  it('Canvasを使えない環境ではnullを返す', async () => {
    installUnsupportedCanvasStub()
    await expect(prepareShareImage({ seat, venueName: '日本武道館' })).resolves.toBeNull()
  })
})

describe('canShareImageFile', () => {
  it('PNG未生成・API未提供・canShare falseをすべてファイル共有不可と判定する', () => {
    setShareApis(vi.fn(), vi.fn().mockReturnValue(true))
    expect(canShareImageFile(null)).toBe(false)
    expect(canShareImageFile(imageFile())).toBe(true)
    setShareApis(vi.fn(), vi.fn().mockReturnValue(false))
    expect(canShareImageFile(imageFile())).toBe(false)
    setShareApis(undefined, undefined)
    expect(canShareImageFile(imageFile())).toBe(false)
    setShareApis(vi.fn(), vi.fn().mockImplementation(() => { throw new TypeError('unsupported') }))
    expect(canShareImageFile(imageFile())).toBe(false)
  })
})

describe('shareResult', () => {
  it('ファイル共有可能なら待たずに同期でnavigator.shareを呼ぶ', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const canShare = vi.fn().mockReturnValue(true)
    setShareApis(share, canShare)
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const file = imageFile()

    const pending = shareResult(text, url, file)
    expect(share).toHaveBeenCalledTimes(1)

    await expect(pending).resolves.toBe('shared')
    expect(canShare).toHaveBeenCalledWith({ files: [file] })
    expect(share).toHaveBeenCalledWith({ files: [file], text, url })
    expect(share.mock.calls[0][0].files[0].type).toBe('image/png')
    expect(open).not.toHaveBeenCalled()
  })

  it('ファイル共有非対応なら待たずに同期でX Web Intentを開く', async () => {
    setShareApis(vi.fn(), vi.fn().mockReturnValue(false))
    const open = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window)

    const pending = shareResult(text, url, imageFile())
    expect(open).toHaveBeenCalledTimes(1)
    await expect(pending).resolves.toBe('intent')

    const [intentUrl, target, features] = open.mock.calls[0]
    expect(intentUrl).toBe(buildXIntentUrl(text, url))
    expect(new URL(String(intentUrl)).searchParams.get('text')).toBe(text)
    expect(new URL(String(intentUrl)).searchParams.get('url')).toBe(url)
    expect(target).toBe('_blank')
    expect(String(features)).toContain('width=620')
    expect(navigator.share).not.toHaveBeenCalled()
  })

  it('PNG未生成やWeb Share API非対応でもX Web Intentへ退避する', async () => {
    setShareApis(undefined, undefined)
    const open = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window)
    await expect(shareResult(text, url, null)).resolves.toBe('intent')
    setShareApis(vi.fn(), vi.fn().mockReturnValue(true))
    await expect(shareResult(text, url, null)).resolves.toBe('intent')
    expect(open).toHaveBeenCalledTimes(2)
    expect(navigator.share).not.toHaveBeenCalled()
  })

  it('共有シートのキャンセルはエラー扱いせず、Intentも開かない', async () => {
    setShareApis(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')), vi.fn().mockReturnValue(true))
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    await expect(shareResult(text, url, imageFile())).resolves.toBe('cancelled')
    expect(open).not.toHaveBeenCalled()
  })

  it('navigator.share呼び出し後の非Abortエラーではwindow.openへ再fallbackしない', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    setShareApis(vi.fn().mockRejectedValue(new DOMException('failed', 'NotAllowedError')), vi.fn().mockReturnValue(true))
    const open = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as unknown as Window)
    await expect(shareResult(text, url, imageFile())).resolves.toBe('failed')
    expect(open).not.toHaveBeenCalled()
  })

  it('ポップアップがブロックされた場合はblockedを返す', async () => {
    setShareApis(undefined, undefined)
    vi.spyOn(window, 'open').mockReturnValue(null)
    await expect(shareResult(text, url, null)).resolves.toBe('blocked')
  })
})
