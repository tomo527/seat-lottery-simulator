import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Venue } from '../../types/venue'
import { VenueSelector } from './VenueSelector'

const venues: Venue[] = Array.from({ length: 30 }, (_, index) => ({
  id: `venue-${index + 1}`,
  name: `架空会場${index + 1}`,
  region: index % 2 === 0 ? '関東' : '近畿',
  prefecture: index % 2 === 0 ? '東京都' : '大阪府',
  city: `テスト市${index + 1}`,
  seatDataAccuracy: 'demo',
  representativePattern: { id: 'layout', name: 'デモ', coverage: 'complete', expectedSeatCount: index + 1, selectionReason: 'test', notIncludedPatterns: [] },
  sources: [],
  internalNotes: [],
  layouts: [],
}))

describe('VenueSelector', () => {
  it('多数の会場をコンパクトなスクロールリスト内に収める', async () => {
    const user = userEvent.setup()
    const { container } = render(<VenueSelector venues={venues} selectedVenueId="" onSelect={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    expect(screen.getByLabelText('会場名・所在地を検索')).toHaveFocus()
    expect(screen.getByRole('list', { name: '会場の検索結果' })).toHaveClass('venue-compact-list')
    expect(screen.getAllByRole('button', { name: /架空会場\d+を選ぶ/ })).toHaveLength(30)
    expect(container.querySelector('.venue-card')).not.toBeInTheDocument()
  })

  it('所在地検索と地域絞り込みができる', async () => {
    const user = userEvent.setup()
    render(<VenueSelector venues={venues} selectedVenueId="" onSelect={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    await user.type(screen.getByLabelText('会場名・所在地を検索'), 'テスト市2')
    expect(screen.getByRole('button', { name: '架空会場2を選ぶ' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '架空会場1を選ぶ' })).not.toBeInTheDocument()
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
