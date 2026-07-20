import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { VenueCatalogEntry } from '../../types/venue'
import { VenueSelector } from './VenueSelector'

const venues: VenueCatalogEntry[] = Array.from({ length: 30 }, (_, index) => ({
  id: `venue-${index + 1}`,
  name: `テスト会場${index + 1}`,
  prefecture: index < 15 ? '東京都' : '大阪府',
  city: index < 15 ? `千代田区${index + 1}` : `大阪市${index + 1}`,
  aliases: index === 0 ? ['ＴＥＳＴ　ＨＡＬＬ'] : [],
  venueType: 'hall',
  representativePatternName: '標準',
  seatCount: index + 100,
  dataPath: `/venue-db/venues/venue-${index + 1}.json`,
}))

describe('VenueSelector', () => {
  it('最初の20件だけを表示し、さらに表示できる', async () => {
    const user = userEvent.setup()
    render(<VenueSelector venues={venues} selectedVenueId="" onSelect={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    expect(screen.getAllByRole('button', { name: /テスト会場\d+を選ぶ/ })).toHaveLength(20)
    await user.click(screen.getByRole('button', { name: 'さらに表示' }))
    expect(screen.getAllByRole('button', { name: /テスト会場\d+を選ぶ/ })).toHaveLength(30)
    await waitFor(() => expect(screen.getByRole('button', { name: 'テスト会場21を選ぶ' })).toHaveFocus())
  })

  it('東京フィルターとNFKC正規化した略称・区名検索が使える', async () => {
    const user = userEvent.setup()
    render(<VenueSelector venues={venues} selectedVenueId="" onSelect={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    await user.selectOptions(screen.getByLabelText('地域'), '東京')
    expect(screen.getByText('15件の会場')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('会場名・所在地を検索'))
    await user.type(screen.getByLabelText('会場名・所在地を検索'), 'test hall')
    expect(screen.getByRole('button', { name: 'テスト会場1を選ぶ' })).toBeInTheDocument()
    await user.clear(screen.getByLabelText('会場名・所在地を検索'))
    await user.type(screen.getByLabelText('会場名・所在地を検索'), '千代田区2')
    expect(screen.getByRole('button', { name: 'テスト会場2を選ぶ' })).toBeInTheDocument()
  })

  it('Escapeでパネルを閉じ、起点ボタンへフォーカスを戻す', async () => {
    const user = userEvent.setup()
    render(<VenueSelector venues={venues} selectedVenueId="" onSelect={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: '会場を選ぶ' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByLabelText('会場名・所在地を検索')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
