import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { VenueCatalogEntry } from '../../types/venue'
import { VenueSelector } from './VenueSelector'

const baseVenues: VenueCatalogEntry[] = [
  { id: 'shibuya-music', name: '渋谷ミュージックホール', searchAliases: ['ＳＨＩＢＵＹＡ　ＭＵＳＩＣ'], region: '関東', prefecture: '東京都', municipality: '渋谷区', venueType: 'hall', representativePatternName: '標準', seatCount: 300, dataPath: '/shibuya.json' },
  { id: 'central-hall', name: 'セントラルホール', searchAliases: ['中央会館'], region: '関東', prefecture: '東京都', municipality: '渋谷区', venueType: 'hall', representativePatternName: '標準', seatCount: 400, dataPath: '/central.json' },
  { id: 'chiyoda', name: '千代田コンサートホール', searchAliases: [], region: '関東', prefecture: '東京都', municipality: '千代田区', venueType: 'hall', representativePatternName: '標準', seatCount: 500, dataPath: '/chiyoda.json' },
  { id: 'osaka', name: '大阪イベントホール', searchAliases: ['浪花ホール'], region: '関西', prefecture: '大阪府', municipality: '大阪市', venueType: 'hall', representativePatternName: '標準', seatCount: 600, dataPath: '/osaka.json' },
]

const manyVenues: VenueCatalogEntry[] = Array.from({ length: 30 }, (_, index) => ({
  id: `venue-${index + 1}`,
  name: `テスト会場${index + 1}`,
  searchAliases: [],
  region: '関東',
  prefecture: '東京都',
  municipality: '千代田区',
  venueType: 'hall',
  representativePatternName: '標準',
  seatCount: index + 100,
  dataPath: `/venue-${index + 1}.json`,
}))

const openPicker = async (venues = baseVenues) => {
  const user = userEvent.setup()
  render(<VenueSelector venues={venues} selectedVenueId="" onSelect={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: '会場を選ぶ' }))
  return user
}

describe('VenueSelector', () => {
  it('最初の20件だけを表示し、さらに表示できる', async () => {
    const user = await openPicker(manyVenues)
    expect(screen.getAllByRole('button', { name: /テスト会場\d+を選ぶ/ })).toHaveLength(20)
    await user.click(screen.getByRole('button', { name: 'さらに表示' }))
    expect(screen.getAllByRole('button', { name: /テスト会場\d+を選ぶ/ })).toHaveLength(30)
    await waitFor(() => expect(screen.getByRole('button', { name: 'テスト会場21を選ぶ' })).toHaveFocus())
  })

  it('自由検索は会場名と明示的な別名だけをNFKC正規化して検索する', async () => {
    const user = await openPicker()
    const search = screen.getByLabelText('会場名で検索')
    await user.type(search, '  shibuya music  ')
    expect(screen.getByRole('button', { name: '渋谷ミュージックホールを選ぶ' })).toBeInTheDocument()
    await user.clear(search)
    await user.type(search, '中央会館')
    expect(screen.getByRole('button', { name: 'セントラルホールを選ぶ' })).toBeInTheDocument()
    await user.clear(search)
    await user.type(search, '渋谷区')
    expect(screen.queryByRole('button', { name: 'セントラルホールを選ぶ' })).not.toBeInTheDocument()
    expect(screen.getByText('絞り込み結果 0件')).toBeInTheDocument()
  })

  it('エリア、都道府県、市区町村が連動し、AND条件で絞り込む', async () => {
    const user = await openPicker()
    const area = screen.getByLabelText('エリア')
    const prefecture = screen.getByLabelText('都道府県')
    const municipality = screen.getByLabelText('市区町村')
    expect(municipality).toBeDisabled()
    expect(screen.getByText('都道府県を選択してください')).toBeInTheDocument()
    await user.selectOptions(area, '関東')
    expect(within(prefecture).getByRole('option', { name: '東京都' })).toBeInTheDocument()
    expect(within(prefecture).queryByRole('option', { name: '大阪府' })).not.toBeInTheDocument()
    await user.selectOptions(prefecture, '東京都')
    expect(municipality).toBeEnabled()
    expect(within(municipality).getByRole('option', { name: '渋谷区' })).toBeInTheDocument()
    expect(screen.getByText('絞り込み結果 3件')).toBeInTheDocument()
    await user.selectOptions(municipality, '渋谷区')
    await user.type(screen.getByLabelText('会場名で検索'), 'ホール')
    expect(screen.getByText('絞り込み結果 2件')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '千代田コンサートホールを選ぶ' })).not.toBeInTheDocument()
  })

  it('親フィルター変更時に不整合な子をリセットする', async () => {
    const user = await openPicker()
    await user.selectOptions(screen.getByLabelText('エリア'), '関東')
    await user.selectOptions(screen.getByLabelText('都道府県'), '東京都')
    await user.selectOptions(screen.getByLabelText('市区町村'), '渋谷区')
    await user.selectOptions(screen.getByLabelText('エリア'), '関西')
    expect(screen.getByLabelText('都道府県')).toHaveValue('')
    expect(screen.getByLabelText('市区町村')).toHaveValue('')
    expect(screen.getByLabelText('市区町村')).toBeDisabled()
    expect(screen.getByRole('button', { name: '大阪イベントホールを選ぶ' })).toBeInTheDocument()
  })

  it('絞り込みリセットで検索・地域階層・ページングを初期化する', async () => {
    const user = await openPicker(manyVenues)
    await user.click(screen.getByRole('button', { name: 'さらに表示' }))
    await user.type(screen.getByLabelText('会場名で検索'), 'テスト会場1')
    await user.selectOptions(screen.getByLabelText('エリア'), '関東')
    await user.selectOptions(screen.getByLabelText('都道府県'), '東京都')
    await user.selectOptions(screen.getByLabelText('市区町村'), '千代田区')
    await user.click(screen.getByRole('button', { name: '絞り込みをリセット' }))
    expect(screen.getByLabelText('会場名で検索')).toHaveValue('')
    expect(screen.getByLabelText('エリア')).toHaveValue('')
    expect(screen.getAllByRole('button', { name: /テスト会場\d+を選ぶ/ })).toHaveLength(20)
  })

  it('Escapeでパネルを閉じ、起点ボタンへフォーカスを戻す', async () => {
    const user = userEvent.setup()
    render(<VenueSelector venues={baseVenues} selectedVenueId="" onSelect={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: '会場を選ぶ' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByLabelText('会場名で検索')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
