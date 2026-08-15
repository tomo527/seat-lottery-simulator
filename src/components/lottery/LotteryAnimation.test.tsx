import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LotteryAnimation } from './LotteryAnimation'

describe('LotteryAnimation', () => {
  it('落ち着いた3段階の案内とaria-hiddenの装飾を表示する', () => {
    render(<LotteryAnimation />)
    expect(screen.getByRole('heading', { name: '抽選中……' })).toBeInTheDocument()
    expect(screen.getByText('今日の席運を確認しています')).toBeInTheDocument()
    expect(screen.getByText('運命の1席を選んでいます')).toBeInTheDocument()
    expect(screen.getByText('もうすぐ結果が届きます')).toBeInTheDocument()
    expect(document.querySelector('.miko-scene')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('.drawing-progress')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('video, audio, img, svg')).not.toBeInTheDocument()
  })

  it('抽選中に具体的な座席番号・列番号を表示しない', () => {
    render(<LotteryAnimation />)
    expect(screen.queryByText(/[A-Z]列/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\d+番/)).not.toBeInTheDocument()
  })
})
