import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Seat } from '../../types/venue'
import { ResultCard } from './ResultCard'

const baseSeat: Seat = {
  venueId: 'test', venueName: 'テストホール', layoutId: 'standard', layoutName: '標準',
  sectionId: 'first-floor', sectionLabel: '1階席', rowLabel: 'E列', number: 25,
}

const renderResult = (seat: Seat = baseSeat) => render(
  <ResultCard seats={[seat]} venueName="テストホール" shareStatus="" onRetry={vi.fn()} onChangeConditions={vi.fn()} onShare={vi.fn()} />,
)

const groupSeats = (numbers: number[]): Seat[] => numbers.map((number) => ({ ...baseSeat, number }))

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
    expect(screen.getByRole('button', { name: 'Xで共有する' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '結果を共有する' })).not.toBeInTheDocument()
  })

  it('scopeDisclosureを渡しても抽選範囲は結果に表示しない', () => {
    render(<ResultCard {...{
      seats: [baseSeat],
      venueName: 'テストホール',
      scopeDisclosure: '固定席のみ。アリーナ／floor席を含まず、会場最大収容配置ではありません。',
      shareStatus: '', onRetry: vi.fn(), onChangeConditions: vi.fn(), onShare: vi.fn(),
    }} />)
    expect(screen.queryByText('抽選範囲')).not.toBeInTheDocument()
    expect(screen.queryByText(/固定席のみ。アリーナ／floor席を含まず/)).not.toBeInTheDocument()
  })

  it('schema v2の選択configuration名を抽選結果に表示する', () => {
    render(<ResultCard {...{
      seats: [{ ...baseSeat, layoutId: 'with-hanamichi', layoutName: '花道あり' }],
      venueName: '明治座',
      configurationName: '花道あり',
      shareStatus: '', onRetry: vi.fn(), onChangeConditions: vi.fn(), onShare: vi.fn(),
    }} />)
    expect(screen.getByText('座席配置')).toBeInTheDocument()
    expect(screen.getByText('花道あり')).toBeInTheDocument()
  })

  it('複数枚は列を1つだけ表示し、座席番号を範囲でまとめる', () => {
    render(<ResultCard seats={groupSeats([15, 16, 17])} venueName="テストホール" shareStatus="" onRetry={vi.fn()} onChangeConditions={vi.fn()} onShare={vi.fn()} />)
    expect(screen.getAllByText('E列')).toHaveLength(1)
    expect(screen.getByText('15番〜17番')).toBeInTheDocument()
    expect(screen.getByText('1階席')).toBeInTheDocument()
    expect(screen.queryByText('16番')).not.toBeInTheDocument()
  })

  it('2枚でも範囲表示にし、列は重複させない', () => {
    render(<ResultCard seats={groupSeats([7, 8])} venueName="テストホール" shareStatus="" onRetry={vi.fn()} onChangeConditions={vi.fn()} onShare={vi.fn()} />)
    expect(screen.getByText('7番〜8番')).toBeInTheDocument()
    expect(screen.getAllByText(/^E列$/)).toHaveLength(1)
  })
})
