import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LotteryAnimation } from './LotteryAnimation'

afterEach(() => {
  vi.useRealTimers()
})

describe('LotteryAnimation', () => {
  it('落ち着いた3段階の案内とaria-hiddenの装飾を表示する', () => {
    render(<LotteryAnimation />)
    expect(screen.getByRole('heading', { name: '抽選中……' })).toBeInTheDocument()
    expect(screen.getByText('今日の席運を確認しています')).toBeInTheDocument()
    expect(screen.getByText('運命の1席を選んでいます')).toBeInTheDocument()
    expect(screen.getByText('もうすぐ結果が届きます')).toBeInTheDocument()
    expect(document.querySelector('.lottery-sprite-wrap')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('.drawing-progress')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('video, audio, img, svg')).not.toBeInTheDocument()
  })

  it('抽選中に具体的な座席番号・列番号を表示しない', () => {
    render(<LotteryAnimation />)
    expect(screen.queryByText(/[A-Z]列/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\d+番/)).not.toBeInTheDocument()
  })

  it('スプライトのフレームが時間経過とともに実際に切り替わる', () => {
    vi.useFakeTimers()
    render(<LotteryAnimation />)
    const sprite = screen.getByTestId('lottery-sprite')
    const frameAt = (ms: number) => {
      act(() => vi.advanceTimersByTime(ms))
      return sprite.style.getPropertyValue('--frame')
    }
    expect(sprite.style.getPropertyValue('--frame')).toBe('0')
    const seenFrames = new Set<string>([frameAt(0)])
    for (let i = 0; i < 20; i += 1) seenFrames.add(frameAt(125))
    // 待機→手を伸ばす(0-3)の後、探るループ(4-11)へ入るため複数の異なるフレームが観測される
    expect(seenFrames.size).toBeGreaterThan(1)
    ;[...seenFrames].forEach((frame) => expect(Number(frame)).toBeGreaterThanOrEqual(0))
    ;[...seenFrames].forEach((frame) => expect(Number(frame)).toBeLessThanOrEqual(11))
  })

  it('reduced motionでは静止した探るフレームのまま切り替わらない', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)', media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    } as MediaQueryList))
    vi.useFakeTimers()
    render(<LotteryAnimation />)
    const sprite = screen.getByTestId('lottery-sprite')
    expect(sprite.style.getPropertyValue('--frame')).toBe('4')
    act(() => vi.advanceTimersByTime(4_000))
    expect(sprite.style.getPropertyValue('--frame')).toBe('4')
  })
})
