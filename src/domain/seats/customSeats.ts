import type { Seat } from '../../types/venue'

export const MAX_GENERATED_SEATS = 50_000
export type RowKind = 'alphabet' | 'number'

export type CustomSeatInput = {
  venueName: string
  areaName: string
  rowKind: RowKind
  firstRow: string
  lastRow: string
  firstSeat: string
  lastSeat: string
}

export type CustomSeatValidation = {
  count: number
  errors: Partial<Record<'firstRow' | 'lastRow' | 'firstSeat' | 'lastSeat' | 'range', string>>
  rowLabels: string[]
}

const alphabetToNumber = (label: string): number | null => {
  const normalized = label.trim().toUpperCase()
  if (!/^[A-Z]{1,2}$/.test(normalized)) return null
  return [...normalized].reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0)
}

const numberToAlphabet = (value: number): string => {
  let number = value
  let result = ''
  while (number > 0) {
    number -= 1
    result = String.fromCharCode(65 + (number % 26)) + result
    number = Math.floor(number / 26)
  }
  return result
}

const positiveSafeInteger = (value: string): number | null => {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

export const generateAlphabetRows = (first: string, last: string): string[] => {
  const start = alphabetToNumber(first)
  const end = alphabetToNumber(last)
  if (start === null || end === null || start > end) return []
  return Array.from({ length: end - start + 1 }, (_, index) => numberToAlphabet(start + index))
}

export const generateNumberRows = (first: string, last: string): string[] => {
  const start = positiveSafeInteger(first)
  const end = positiveSafeInteger(last)
  if (start === null || end === null || start > end) return []
  const rowCount = end - start + 1
  if (!Number.isSafeInteger(rowCount) || rowCount > MAX_GENERATED_SEATS) return []
  return Array.from({ length: rowCount }, (_, index) => String(start + index))
}

export const validateCustomSeatInput = (input: CustomSeatInput): CustomSeatValidation => {
  const errors: CustomSeatValidation['errors'] = {}
  let rowStart: number | null
  let rowEnd: number | null

  if (input.rowKind === 'alphabet') {
    rowStart = alphabetToNumber(input.firstRow)
    rowEnd = alphabetToNumber(input.lastRow)
    if (rowStart === null) errors.firstRow = 'A〜ZZのアルファベットで入力してください。'
    if (rowEnd === null) errors.lastRow = 'A〜ZZのアルファベットで入力してください。'
  } else {
    rowStart = positiveSafeInteger(input.firstRow)
    rowEnd = positiveSafeInteger(input.lastRow)
    if (rowStart === null) errors.firstRow = '1以上の安全な整数で入力してください。'
    if (rowEnd === null) errors.lastRow = '1以上の安全な整数で入力してください。'
  }

  let rowCount = 0
  if (rowStart !== null && rowEnd !== null) {
    if (rowStart > rowEnd) {
      errors.range = '最初の列は最後の列より前にしてください。'
    } else {
      rowCount = rowEnd - rowStart + 1
    }
  }

  const firstSeat = positiveSafeInteger(input.firstSeat)
  const lastSeat = positiveSafeInteger(input.lastSeat)
  if (firstSeat === null) errors.firstSeat = '1以上の安全な整数で入力してください。'
  if (lastSeat === null) errors.lastSeat = '1以上の安全な整数で入力してください。'

  let seatsPerRow = 0
  if (firstSeat !== null && lastSeat !== null) {
    if (firstSeat > lastSeat) {
      errors.lastSeat = '最後の番号は最初の番号以上にしてください。'
    } else {
      seatsPerRow = lastSeat - firstSeat + 1
    }
  }

  let count = 0
  if (rowCount > 0 && seatsPerRow > 0 && Object.keys(errors).length === 0) {
    const total = rowCount * seatsPerRow
    if (!Number.isSafeInteger(total)) {
      errors.range = '指定範囲が大きすぎます。より小さい範囲を入力してください。'
    } else {
      count = total
      if (count > MAX_GENERATED_SEATS) {
        errors.range = `生成できる座席は${MAX_GENERATED_SEATS.toLocaleString('ja-JP')}席までです。`
      }
    }
  }

  if (count <= 0 && Object.keys(errors).length === 0) {
    errors.range = '座席が1席以上になる範囲を入力してください。'
  }

  let rowLabels: string[] = []
  if (Object.keys(errors).length === 0) {
    rowLabels = input.rowKind === 'alphabet'
      ? generateAlphabetRows(input.firstRow, input.lastRow)
      : generateNumberRows(input.firstRow, input.lastRow)
  }

  return { count, errors, rowLabels }
}

export const generateCustomSeats = (input: CustomSeatInput): Seat[] => {
  const validation = validateCustomSeatInput(input)
  if (Object.keys(validation.errors).length > 0) return []
  const firstSeat = Number(input.firstSeat)
  const lastSeat = Number(input.lastSeat)
  const venueName = input.venueName.trim() || 'マイ会場'
  const sectionLabel = input.areaName.trim() || undefined
  const seats: Seat[] = []

  for (const rowLabel of validation.rowLabels) {
    for (let number = firstSeat; number <= lastSeat; number += 1) {
      seats.push({
        venueId: 'custom',
        venueName,
        layoutId: 'custom-layout',
        layoutName: '自作レイアウト',
        sectionId: 'custom-section',
        sectionLabel,
        rowLabel,
        number,
      })
    }
  }
  return seats
}
