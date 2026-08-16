import { afterEach, describe, expect, it, vi } from 'vitest'
import { installCanvasStub, installUnsupportedCanvasStub, restoreCanvasStub } from '../test/canvasStub'
import type { Seat } from '../types/venue'
import {
  buildShareCardRows,
  createShareImageFile,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_NOTICE,
  SHARE_IMAGE_WIDTH,
} from './shareImage'

const seat: Seat = { venueId: 'v', venueName: '会場', layoutId: 'l', layoutName: '標準', sectionId: 's', sectionLabel: '2階', rowLabel: '南A', number: 15 }

afterEach(() => { restoreCanvasStub(); vi.restoreAllMocks() })

describe('buildShareCardRows', () => {
  it('会場・エリア・列・座席番号を結果表示と同じ表記で並べる', () => {
    expect(buildShareCardRows({ seat, venueName: '日本武道館' })).toEqual([
      { label: '会場', value: '日本武道館' },
      { label: 'エリア', value: '2階' },
      { label: '列', value: '南A列', emphasis: true },
      { label: '座席番号', value: '15番', emphasis: true },
    ])
  })

  it('座席配置と抽選範囲は存在する場合だけ含める', () => {
    const rows = buildShareCardRows({ seat, venueName: '明治座', configurationName: '花道あり', scopeDisclosure: '固定席のみ。' })
    expect(rows.map((row) => row.label)).toEqual(['会場', '座席配置', '抽選範囲', 'エリア', '列', '座席番号'])
  })

  it('エリアのない自作座席では会場・列・座席番号だけになる', () => {
    const rows = buildShareCardRows({ seat: { ...seat, sectionId: '', sectionLabel: undefined, rowLabel: 'A列', number: 3 }, venueName: 'マイ会場' })
    expect(rows.map((row) => row.label)).toEqual(['会場', '列', '座席番号'])
    expect(rows.map((row) => row.value)).toEqual(['マイ会場', 'A列', '3番'])
  })
})

describe('createShareImageFile', () => {
  it('1200×630のPNGを生成し、必要な項目だけを描画する', async () => {
    const stub = installCanvasStub()
    const canvases: HTMLCanvasElement[] = []
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      const element = createElement(tagName, options)
      if (tagName === 'canvas') canvases.push(element as HTMLCanvasElement)
      return element
    })

    const file = await createShareImageFile({ seat, venueName: '日本武道館', configurationName: '花道あり', scopeDisclosure: '固定席のみ。' })

    expect(file).toBeInstanceOf(File)
    expect(file?.type).toBe('image/png')
    expect(file?.name).toBe('seat-lottery-result.png')
    expect(stub.blobType).toBe('image/png')
    expect(canvases[0].width).toBe(SHARE_IMAGE_WIDTH)
    expect(canvases[0].height).toBe(SHARE_IMAGE_HEIGHT)

    const drawn = stub.texts.join('\n')
    for (const expected of ['SEAT LOTTERY NOTICE', '抽選結果のお知らせ', 'SIMULATION', '会場', '日本武道館', '座席配置', '花道あり', '抽選範囲', 'エリア', '2階', '列', '南A列', '座席番号', '15番']) {
      expect(drawn).toContain(expected)
    }
    expect(stub.texts.join('')).toContain(SHARE_IMAGE_NOTICE.slice(0, 20))
    expect(drawn).not.toMatch(/もう一度抽選する|条件を変更する|Xで共有する/)
  })

  it('長い値は折り返して収め、はみ出す場合は省略記号にする', async () => {
    const stub = installCanvasStub()
    const longName = '東京国際フォーラム ホールA（長い会場名テストのための非常に長い表記）'
    await createShareImageFile({ seat, venueName: longName, scopeDisclosure: 'あ'.repeat(200) })
    const drawn = stub.texts.join('')
    expect(drawn).toContain(longName.slice(0, 20))
    expect(drawn).toContain('…')
  })

  it('Canvasを使えない環境ではnullを返す', async () => {
    installUnsupportedCanvasStub()
    await expect(createShareImageFile({ seat, venueName: '日本武道館' })).resolves.toBeNull()
  })
})
