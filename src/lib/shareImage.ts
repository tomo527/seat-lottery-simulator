import { formatRowLabel, formatSeatNumber } from '../domain/lottery/lottery'
import type { Seat } from '../types/venue'

export type ShareCardDetails = {
  seat: Seat
  venueName: string
  configurationName?: string
  scopeDisclosure?: string
}

export type ShareCardRow = { label: string; value: string; emphasis?: boolean }

export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630
export const SHARE_IMAGE_FILE_NAME = 'seat-lottery-result.png'
export const SHARE_IMAGE_MIME_TYPE = 'image/png'
export const SHARE_IMAGE_NOTICE = '※これは遊びのためのシミュレーションです。実際の座席割り当てとは関係ありません。'

export const buildShareCardRows = ({ seat, venueName, configurationName, scopeDisclosure }: ShareCardDetails): ShareCardRow[] => [
  { label: '会場', value: venueName },
  ...(configurationName ? [{ label: '座席配置', value: configurationName }] : []),
  ...(scopeDisclosure ? [{ label: '抽選範囲', value: scopeDisclosure }] : []),
  ...(seat.sectionLabel ? [{ label: 'エリア', value: seat.sectionLabel }] : []),
  { label: '列', value: formatRowLabel(seat.rowLabel), emphasis: true },
  { label: '座席番号', value: formatSeatNumber(seat.number), emphasis: true },
]

const CARD = { x: 36, y: 28, width: 1128, height: 574, radius: 28 }
const CONTENT_LEFT = 92
const CONTENT_RIGHT = 1108
const VALUE_LEFT = 282
const HEADER_BOTTOM = 160
const DETAILS_TOP = 188
const DETAILS_BOTTOM = 536
const FONT_STACK = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", "Meiryo", system-ui, sans-serif'
const FIT_SCALES = [1, 0.94, 0.88, 0.82, 0.76, 0.7]

type Ctx = CanvasRenderingContext2D

const fontOf = (weight: number, size: number) => `${weight} ${Math.round(size)}px ${FONT_STACK}`

const setLetterSpacing = (ctx: Ctx, spacing: string) => {
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing
}

const wrapLines = (ctx: Ctx, text: string, maxWidth: number, maxLines: number): string[] => {
  const lines: string[] = []
  let current = ''
  for (const character of Array.from(text)) {
    if (current !== '' && ctx.measureText(current + character).width > maxWidth) {
      lines.push(current)
      current = character
    } else current += character
  }
  if (current !== '') lines.push(current)
  if (lines.length === 0) return ['']
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  kept[maxLines - 1] = `${kept[maxLines - 1].slice(0, -1)}…`
  return kept
}

const roundedRectPath = (ctx: Ctx, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, width, height, radius)
  else ctx.rect(x, y, width, height)
}

const horizontalLine = (ctx: Ctx, left: number, right: number, y: number, color: string, dashed: boolean) => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.setLineDash(dashed ? [7, 7] : [])
  ctx.beginPath()
  ctx.moveTo(left, y)
  ctx.lineTo(right, y)
  ctx.stroke()
  ctx.restore()
}

type MeasuredRow = ShareCardRow & { lines: string[]; valueSize: number; lineHeight: number; height: number }

const measureRows = (ctx: Ctx, rows: ShareCardRow[], scale: number): MeasuredRow[] => rows.map((row) => {
  const valueSize = (row.emphasis ? 40 : 27) * scale
  ctx.font = fontOf(row.emphasis ? 900 : 800, valueSize)
  const lines = wrapLines(ctx, row.value, CONTENT_RIGHT - VALUE_LEFT, row.emphasis ? 1 : 2)
  const lineHeight = valueSize * 1.34
  return { ...row, lines, valueSize, lineHeight, height: lines.length * lineHeight + 22 * scale }
})

const fitRows = (ctx: Ctx, rows: ShareCardRow[]) => {
  const available = DETAILS_BOTTOM - DETAILS_TOP
  const lastScale = FIT_SCALES[FIT_SCALES.length - 1]
  for (const scale of FIT_SCALES) {
    const measured = measureRows(ctx, rows, scale)
    const total = measured.reduce((sum, row) => sum + row.height, 0)
    if (total <= available || scale === lastScale) {
      return { measured, scale, gap: Math.max(0, Math.min(30, (available - total) / Math.max(1, measured.length - 1))) }
    }
  }
  return { measured: measureRows(ctx, rows, 1), scale: 1, gap: 0 }
}

const paintHeader = (ctx: Ctx) => {
  ctx.save()
  roundedRectPath(ctx, CARD.x, CARD.y, CARD.width, CARD.height, CARD.radius)
  ctx.clip()
  const band = ctx.createLinearGradient(CARD.x, CARD.y, CARD.x + CARD.width, HEADER_BOTTOM)
  band.addColorStop(0, '#f5f3fb')
  band.addColorStop(1, '#ffffff')
  ctx.fillStyle = band
  ctx.fillRect(CARD.x, CARD.y, CARD.width, HEADER_BOTTOM - CARD.y)
  ctx.restore()
  horizontalLine(ctx, CARD.x, CARD.x + CARD.width, HEADER_BOTTOM, '#e6e2ea', false)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  setLetterSpacing(ctx, '5px')
  ctx.font = fontOf(900, 22)
  ctx.fillStyle = '#5140c7'
  ctx.fillText('SEAT LOTTERY NOTICE', CONTENT_LEFT, 88)
  setLetterSpacing(ctx, '0px')
  ctx.font = fontOf(900, 46)
  ctx.fillStyle = '#1d134b'
  ctx.fillText('抽選結果のお知らせ', CONTENT_LEFT, 142)
}

const paintStamp = (ctx: Ctx) => {
  setLetterSpacing(ctx, '4px')
  ctx.font = fontOf(900, 21)
  const width = ctx.measureText('SIMULATION').width + 34
  const height = 46
  const left = CONTENT_RIGHT - width
  roundedRectPath(ctx, left, 56, width, height, 8)
  ctx.fillStyle = '#fff7f7'
  ctx.fill()
  ctx.strokeStyle = '#ffadb1'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#a92f3b'
  ctx.fillText('SIMULATION', left + 17, 56 + height / 2 + 8)
  setLetterSpacing(ctx, '0px')
}

const paintRows = (ctx: Ctx, rows: ShareCardRow[]) => {
  const { measured, scale, gap } = fitRows(ctx, rows)
  const blockHeight = measured.reduce((sum, row) => sum + row.height, 0) + gap * Math.max(0, measured.length - 1)
  let top = DETAILS_TOP + Math.max(0, (DETAILS_BOTTOM - DETAILS_TOP - blockHeight) / 2)
  measured.forEach((row, index) => {
    const firstBaseline = top + row.lineHeight * 0.76
    ctx.font = fontOf(800, 20 * scale)
    ctx.fillStyle = '#77708e'
    ctx.fillText(row.label, CONTENT_LEFT, firstBaseline)
    ctx.font = fontOf(row.emphasis ? 900 : 800, row.valueSize)
    ctx.fillStyle = row.emphasis ? '#3a2a9b' : '#1d134b'
    row.lines.forEach((line, lineIndex) => {
      ctx.fillText(line, VALUE_LEFT, firstBaseline + row.lineHeight * lineIndex)
    })
    top += row.height + gap
    if (index < measured.length - 1) horizontalLine(ctx, CONTENT_LEFT, CONTENT_RIGHT, top - gap / 2, '#efecf2', false)
  })
}

const paintNotice = (ctx: Ctx) => {
  horizontalLine(ctx, CONTENT_LEFT, CONTENT_RIGHT, 546, '#c9c4d1', true)
  ctx.font = fontOf(500, 19)
  ctx.fillStyle = '#6f687f'
  wrapLines(ctx, SHARE_IMAGE_NOTICE, CONTENT_RIGHT - CONTENT_LEFT, 2).forEach((line, index) => {
    ctx.fillText(line, CONTENT_LEFT, 576 + index * 24)
  })
}

export const paintShareCard = (ctx: Ctx, details: ShareCardDetails) => {
  const background = ctx.createLinearGradient(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT)
  background.addColorStop(0, '#f3f0ff')
  background.addColorStop(1, '#fffdf6')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT)

  roundedRectPath(ctx, CARD.x, CARD.y, CARD.width, CARD.height, CARD.radius)
  ctx.fillStyle = '#fffefb'
  ctx.fill()
  ctx.strokeStyle = '#d5d1df'
  ctx.lineWidth = 2
  ctx.stroke()

  paintHeader(ctx)
  paintStamp(ctx)
  paintRows(ctx, buildShareCardRows(details))
  paintNotice(ctx)
}

const renderShareImageBlob = (details: ShareCardDetails): Promise<Blob | null> => new Promise((resolve) => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = SHARE_IMAGE_WIDTH
    canvas.height = SHARE_IMAGE_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx || typeof canvas.toBlob !== 'function') return resolve(null)
    paintShareCard(ctx, details)
    canvas.toBlob((blob) => resolve(blob), SHARE_IMAGE_MIME_TYPE)
  } catch (error) {
    console.warn('Could not render the share image.', error)
    resolve(null)
  }
})

export const createShareImageFile = async (details: ShareCardDetails): Promise<File | null> => {
  const blob = await renderShareImageBlob(details)
  if (!blob) return null
  try {
    return new File([blob], SHARE_IMAGE_FILE_NAME, { type: SHARE_IMAGE_MIME_TYPE })
  } catch (error) {
    console.warn('Could not create the share image file.', error)
    return null
  }
}
