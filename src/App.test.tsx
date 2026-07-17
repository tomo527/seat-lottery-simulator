import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { DRAW_ANIMATION_DURATION_MS, REDUCED_MOTION_DRAW_DURATION_MS } from './domain/lottery/constants'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const selectVenue = (name = '東京国際フォーラム ホールC') => {
  const trigger = screen.queryByRole('button', { name: '会場を選ぶ' }) ?? screen.getByRole('button', { name: '会場を変更' })
  fireEvent.click(trigger)
  fireEvent.click(screen.getByRole('button', { name: `${name}を選ぶ` }))
}

const startVenueDraw = () => {
  render(<App />)
  selectVenue()
  fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
}

describe('App', () => {
  it('遊び用途の見出しだけを表示し、当落設定を表示しない', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeInTheDocument()
    expect(screen.queryByText(/PLAY ONLY|SEAT LOTTERY EXPERIENCE|抽選モードを選ぶ|STEP 01|STEP 02/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/当選確率/)).not.toBeInTheDocument()
  })

  it('保存値がなければ会場未選択で、不正URLも安全に扱う', () => {
    window.history.replaceState({}, '', '/?venue=unknown-venue')
    render(<App />)
    expect(screen.getByText('まだ会場が選択されていません。')).toBeInTheDocument()
    expect(screen.getByText('会場を選択してください')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
  })

  it('有効なURL会場IDを復元する', () => {
    window.history.replaceState({}, '', '/?venue=tokyo-international-forum-hall-c')
    render(<App />)
    expect(screen.getByText('東京国際フォーラム ホールC')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
  })

  it('保存会場を復元し、古い当落設定は無視する', () => {
    localStorage.setItem('seat-lottery-preferences-v1', JSON.stringify({ venueId: 'kyocera-dome-osaka-stand-subset', lotteryMode: 'chance-and-seat', probability: 10 }))
    render(<App />)
    expect(screen.getByText('京セラドーム大阪（通常野球開催時）')).toBeInTheDocument()
    expect(screen.queryByText(/当選確率|当落/)).not.toBeInTheDocument()
  })

  it('会場名・所在地検索と地域絞り込みができる', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    const search = screen.getByLabelText('会場名・所在地を検索')
    fireEvent.change(search, { target: { value: '横浜' } })
    expect(screen.getByRole('button', { name: '横浜アリーナを選ぶ' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '千代田区' } })
    expect(screen.getByRole('button', { name: '東京国際フォーラム ホールCを選ぶ' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('地域'), { target: { value: '近畿' } })
    expect(screen.getByText('1件の会場')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '京セラドーム大阪（通常野球開催時）を選ぶ' })).toBeInTheDocument()
  })

  it('選択後に公式データ範囲と変動席の除外を簡潔に示す', () => {
    render(<App />)
    selectVenue('横浜アリーナ')
    expect(screen.queryByLabelText('会場名・所在地を検索')).not.toBeInTheDocument()
    expect(screen.getByText(/固定アリーナ席Aブロックの一部/)).toBeInTheDocument()
    expect(screen.getByText(/センター席はイベントにより配置が変わる/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '公式座席情報を確認' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('button', { name: '会場を変更' })).toHaveFocus()
    expect(window.location.search).toContain('yokohama-arena-fixed-a-subset')
  })

  it('抽選前は図を出さず、1800ms後に結果と精度に合う図を表示する', () => {
    vi.useFakeTimers()
    startVenueDraw()
    expect(document.querySelector('[data-presentation]')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '抽選中……' })).toBeInTheDocument()
    expect(screen.getByText('今日の席運を確認しています')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS - 1))
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeInTheDocument()
    expect(document.querySelector('[data-presentation="verified-section-map"]')).toBeInTheDocument()
    expect(screen.getByText('セクション・エリア')).toBeInTheDocument()
    expect(screen.queryByText(/チケットをご用意できました/)).not.toBeInTheDocument()
  })

  it('reduced motionでは400ms後に結果を表示する', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)', media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    }))
    vi.useFakeTimers()
    startVenueDraw()
    act(() => vi.advanceTimersByTime(REDUCED_MOTION_DRAW_DURATION_MS - 1))
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeInTheDocument()
  })

  it('二重実行せず、会場変更で保留タイマーを解除する', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    startVenueDraw()
    const drawTimer = setTimeoutSpy.mock.results.at(-1)?.value
    const timerCalls = setTimeoutSpy.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: '抽選中……' }))
    expect(setTimeoutSpy).toHaveBeenCalledTimes(timerCalls)
    selectVenue('横浜アリーナ')
    expect(clearTimeoutSpy).toHaveBeenCalledWith(drawTimer)
  })

  it('会場変更後は古いcallbackが実行されても結果を反映しない', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    startVenueDraw()
    const staleCallback = setTimeoutSpy.mock.calls.at(-1)?.[0]
    selectVenue('横浜アリーナ')
    act(() => (staleCallback as () => void)())
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
    expect(screen.getByText('横浜アリーナ')).toBeInTheDocument()
  })

  it('自作座席の変更で古い結果を表示しない', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '自分で作る' }))
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    fireEvent.change(screen.getByLabelText('最後の列'), { target: { value: 'A' } })
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
  })

  it('unmount時に保留タイマーを解除する', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<App />)
    selectVenue()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    const drawTimer = setTimeoutSpy.mock.results.at(-1)?.value
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalledWith(drawTimer)
  })

  it('自作座席から従来どおり抽選できる', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '自分で作る' }))
    expect(screen.getByText('760席から今日の1席を抽選します')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS))
    expect(screen.getByRole('figure', { name: '自作座席の簡易座席図' })).toBeInTheDocument()
  })

  it('不正な自作入力の近くにエラーを表示する', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '自分で作る' }))
    const firstSeat = screen.getByLabelText('最初の座席番号')
    await user.clear(firstSeat)
    await user.type(firstSeat, '0')
    await waitFor(() => expect(screen.getByText('1以上の安全な整数で入力してください。')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
  })
})
