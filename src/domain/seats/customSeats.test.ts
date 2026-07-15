import { describe, expect, it } from 'vitest'
import { generateAlphabetRows, generateCustomSeats, generateNumberRows, MAX_GENERATED_SEATS, validateCustomSeatInput, type CustomSeatInput } from './customSeats'

const validInput: CustomSeatInput = {
  venueName: 'テスト会場', areaName: 'テストエリア', rowKind: 'alphabet',
  firstRow: 'A', lastRow: 'C', firstSeat: '1', lastSeat: '4',
}

describe('custom seat generation', () => {
  it('アルファベット列を生成する', () => {
    expect(generateAlphabetRows('Y', 'AB')).toEqual(['Y', 'Z', 'AA', 'AB'])
  })

  it('数字列を生成する', () => {
    expect(generateNumberRows('2', '5')).toEqual(['2', '3', '4', '5'])
  })

  it('入力範囲の全座席を生成する', () => {
    const seats = generateCustomSeats(validInput)
    expect(seats).toHaveLength(12)
    expect(seats[0]).toMatchObject({ rowLabel: 'A', number: 1 })
    expect(seats.at(-1)).toMatchObject({ rowLabel: 'C', number: 4 })
  })

  it('不正な開始・終了範囲を拒否する', () => {
    const validation = validateCustomSeatInput({ ...validInput, firstRow: 'D', lastRow: 'A', firstSeat: '0', lastSeat: '-2' })
    expect(validation.errors.range).toBeDefined()
    expect(validation.errors.firstSeat).toBeDefined()
    expect(generateCustomSeats({ ...validInput, firstRow: 'D', lastRow: 'A' })).toEqual([])
  })

  it('生成上限を超える入力を拒否する', () => {
    const validation = validateCustomSeatInput({ ...validInput, firstRow: 'A', lastRow: 'ZZ', firstSeat: '1', lastSeat: '100' })
    expect(validation.count).toBeGreaterThan(MAX_GENERATED_SEATS)
    expect(validation.errors.range).toContain(MAX_GENERATED_SEATS.toLocaleString('ja-JP'))
    expect(generateCustomSeats({ ...validInput, firstRow: 'A', lastRow: 'ZZ', firstSeat: '1', lastSeat: '100' })).toEqual([])
  })

  it('50,000席は生成できる', () => {
    const input: CustomSeatInput = { ...validInput, rowKind: 'number', firstRow: '1', lastRow: '1', firstSeat: '1', lastSeat: '50000' }
    const validation = validateCustomSeatInput(input)
    expect(validation.errors).toEqual({})
    expect(validation.count).toBe(50_000)
    expect(generateCustomSeats(input)).toHaveLength(50_000)
  })

  it('50,001席は配列を生成せず拒否する', () => {
    const input: CustomSeatInput = { ...validInput, rowKind: 'number', firstRow: '1', lastRow: '1', firstSeat: '1', lastSeat: '50001' }
    const validation = validateCustomSeatInput(input)
    expect(validation.count).toBe(50_001)
    expect(validation.rowLabels).toEqual([])
    expect(validation.errors.range).toContain('50,000')
    expect(generateCustomSeats(input)).toEqual([])
  })

  it.each([
    ['数字列1〜1,000,000,000', { rowKind: 'number', firstRow: '1', lastRow: '1000000000', firstSeat: '1', lastSeat: '1' }],
    ['数字列1〜Number.MAX_SAFE_INTEGER', { rowKind: 'number', firstRow: '1', lastRow: String(Number.MAX_SAFE_INTEGER), firstSeat: '1', lastSeat: '1' }],
    ['座席番号1〜Number.MAX_SAFE_INTEGER', { rowKind: 'number', firstRow: '1', lastRow: '1', firstSeat: '1', lastSeat: String(Number.MAX_SAFE_INTEGER) }],
    ['掛け算結果が安全な整数を超える範囲', { rowKind: 'number', firstRow: '1', lastRow: '50000', firstSeat: '1', lastSeat: String(Number.MAX_SAFE_INTEGER) }],
  ])('%sをthrowせず、列配列も生成しない', (_label, values) => {
    const input: CustomSeatInput = { ...validInput, ...values } as CustomSeatInput
    expect(() => validateCustomSeatInput(input)).not.toThrow()
    const validation = validateCustomSeatInput(input)
    expect(validation.rowLabels).toEqual([])
    expect(validation.errors.range).toBeDefined()
    expect(() => generateCustomSeats(input)).not.toThrow()
    expect(generateCustomSeats(input)).toEqual([])
  })

  it('巨大な数字列を直接生成しようとしても空配列を返す', () => {
    expect(() => generateNumberRows('1', '1000000000')).not.toThrow()
    expect(generateNumberRows('1', '1000000000')).toEqual([])
  })

  it('空の座席範囲を通常のバリデーションエラーにする', () => {
    const input: CustomSeatInput = { ...validInput, firstSeat: '', lastSeat: '' }
    expect(() => validateCustomSeatInput(input)).not.toThrow()
    expect(validateCustomSeatInput(input).errors.firstSeat).toBeDefined()
    expect(validateCustomSeatInput(input).rowLabels).toEqual([])
  })

  it('アルファベットA〜ZZは従来どおり生成する', () => {
    const input: CustomSeatInput = { ...validInput, firstRow: 'A', lastRow: 'ZZ', firstSeat: '1', lastSeat: '1' }
    const validation = validateCustomSeatInput(input)
    expect(validation.errors).toEqual({})
    expect(validation.rowLabels).toHaveLength(702)
    expect(validation.rowLabels.at(-1)).toBe('ZZ')
  })
})
