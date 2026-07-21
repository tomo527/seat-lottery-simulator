import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Seat } from '../../types/venue'
import { ResultCard } from './ResultCard'

const baseSeat: Seat = {
  venueId: 'test', venueName: 'テストホール', layoutId: 'standard', layoutName: '標準',
  sectionId: 'first-floor', sectionLabel: '1階席', rowLabel: 'E列', number: 25,
}

const renderResult = (seat: Seat = baseSeat) => render(
  <ResultCard seat={seat} venueName="テストホール" shareStatus="" onRetry={vi.fn()} onChangeConditions={vi.fn()} onShare={vi.fn()} />,
)

describe('ResultCard', () => {
  it('通知風の結果とSIMULATION注記を表示し、接尾辞を重複させない', () => {
    renderResult()
    expect(screen.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeInTheDocument()
    expect(screen.getByText(/厳正なる抽選の結果/)).toBeInTheDocument()
    expect(screen.getByText('テストホール')).toBeInTheDocument()
    expect(screen.getByText('1階席')).toBeInTheDocument()
    expect(screen.getByText('E列')).toBeInTheDocument()
    expect(screen.getByText('25番')).toBeInTheDocument()
    expect(screen.queryByText('E列列')).not.toBeInTheDocument()
    expect(screen.queryByText('25番番')).not.toBeInTheDocument()
    expect(screen.getByText('SIMULATION')).toBeInTheDocument()
    expect(screen.getByText('※これは遊びのためのシミュレーションです。実際の座席割り当てとは関係ありません。')).toBeInTheDocument()
  })

  it('エリアがない場合はエリア行を作らず、禁止されたチケット要素を持たない', () => {
    const { container } = renderResult({ ...baseSeat, sectionId: '', sectionLabel: undefined, rowLabel: 'A' })
    expect(screen.queryByText('エリア')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.textContent).not.toMatch(/QRコード|バーコード|発券済み|入場可|チケットぴあ|ローチケ|e\+/)
    expect(container.querySelector('a')).not.toBeInTheDocument()
  })

  it('操作ボタンを通知カードの外側に分離する', () => {
    const { container } = renderResult()
    const notification = container.querySelector('.result-notification')
    expect(notification).not.toContainElement(screen.getByRole('button', { name: 'もう一度抽選する' }))
    expect(screen.getByRole('button', { name: '条件を変更する' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '結果を共有する' })).toBeInTheDocument()
  })
})
