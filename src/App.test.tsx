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

const openVenuePicker = () => fireEvent.click(screen.getByRole('button', { name: '会場を選ぶ' }))

const selectVenue = (name = '星見アリーナ') => {
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
  it('不要なラベルや当落設定を表示せず、新しい見出しを表示する', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeInTheDocument()
    expect(screen.queryByText('PLAY ONLY')).not.toBeInTheDocument()
    expect(screen.queryByText('SEAT LOTTERY EXPERIENCE')).not.toBeInTheDocument()
    expect(screen.queryByText('抽選モードを選ぶ')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/当選確率/)).not.toBeInTheDocument()
    expect(screen.queryByText(/STEP 01|STEP 02|PICK YOUR SEATS|CHOOSE A MODE/)).not.toBeInTheDocument()
  })

  it('保存値がない初期状態では会場を未選択にする', () => {
    render(<App />)
    expect(screen.getByText('まだ会場が選択されていません。')).toBeInTheDocument()
    expect(screen.getByText('会場を選択してください')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
  })

  it('有効なURL会場IDを復元する', () => {
    window.history.replaceState({}, '', '/?venue=demo-kirameki-hall')
    render(<App />)
    expect(screen.getByText('キラメキホール')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
  })

  it('保存した会場を復元し、旧当落設定は無視する', () => {
    localStorage.setItem('seat-lottery-preferences-v1', JSON.stringify({ venueId: 'demo-ocean-dome', lotteryMode: 'chance-and-seat', probability: 10 }))
    render(<App />)
    expect(screen.getByText('オーシャンドーム')).toBeInTheDocument()
    expect(screen.queryByText(/当落|当選確率/)).not.toBeInTheDocument()
  })

  it('不正な会場IDは未選択として安全に扱う', () => {
    window.history.replaceState({}, '', '/?venue=unknown-venue')
    render(<App />)
    expect(screen.getByText('まだ会場が選択されていません。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
  })

  it('会場選択パネルを開き、会場名で検索できる', () => {
    render(<App />)
    openVenuePicker()
    const search = screen.getByLabelText('会場名・所在地を検索')
    fireEvent.change(search, { target: { value: 'キラメキ' } })
    expect(screen.getByText('1件の会場')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キラメキホールを選ぶ' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '星見アリーナを選ぶ' })).not.toBeInTheDocument()
  })

  it('都道府県または市区町村で会場を検索できる', () => {
    render(<App />)
    openVenuePicker()
    const search = screen.getByLabelText('会場名・所在地を検索')
    fireEvent.change(search, { target: { value: '光野市' } })
    expect(screen.getByRole('button', { name: 'キラメキホールを選ぶ' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '架空道' } })
    expect(screen.getByRole('button', { name: 'ノースノート・ライブハウスを選ぶ' })).toBeInTheDocument()
  })

  it('地域で絞り込める', () => {
    render(<App />)
    openVenuePicker()
    fireEvent.change(screen.getByLabelText('地域'), { target: { value: '九州・沖縄' } })
    expect(screen.getByText('1件の会場')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'オーシャンドームを選ぶ' })).toBeInTheDocument()
  })

  it('会場を選ぶとパネルを閉じ、選択内容と変更ボタンを表示する', () => {
    render(<App />)
    selectVenue('キラメキホール')
    expect(screen.queryByLabelText('会場名・所在地を検索')).not.toBeInTheDocument()
    expect(screen.getByText('キラメキホール')).toBeInTheDocument()
    expect(screen.getByText('架空会場')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '会場を変更' })).toHaveFocus()
    expect(window.location.search).toContain('demo-kirameki-hall')
    expect(JSON.parse(localStorage.getItem('seat-lottery-preferences-v1') ?? '{}')).toEqual({ venueId: 'demo-kirameki-hall' })
    fireEvent.click(screen.getByRole('button', { name: '会場を変更' }))
    expect(screen.getByLabelText('会場名・所在地を検索')).toBeInTheDocument()
  })

  it('抽選前は座席図とレイアウト選択を表示せず、抽選後だけ結果と座席図を表示する', () => {
    vi.useFakeTimers()
    startVenueDraw()
    expect(screen.queryByRole('img', { name: /簡易座席図/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('レイアウト')).not.toBeInTheDocument()
    expect(screen.queryByText(/センターステージ|エンドステージ/)).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS))
    expect(screen.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeInTheDocument()
    expect(screen.queryByText(/チケットをご用意できました/)).not.toBeInTheDocument()
    expect(screen.getByText('セクション・エリア')).toBeInTheDocument()
    expect(screen.getByText('列')).toBeInTheDocument()
    expect(screen.getByText('座席番号')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /簡易座席図/ })).toBeInTheDocument()
  })

  it('2400msの抽選演出が終わるまで結果を表示しない', () => {
    vi.useFakeTimers()
    startVenueDraw()
    expect(screen.getByRole('heading', { name: '抽選中……' })).toBeInTheDocument()
    expect(screen.getByText('抽選中です。今日の席運を確認しています。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '抽選中……' })).toBeDisabled()
    act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS - 1))
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeInTheDocument()
    expect(screen.getByText(/抽選結果を表示しました。.+です。/)).toBeInTheDocument()
  })

  it('reduced motionでは400msに短縮する', () => {
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

  it('同時に複数の抽選タイマーを開始せず、条件変更時に解除する', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    startVenueDraw()
    const drawTimer = setTimeoutSpy.mock.results.at(-1)?.value
    const timerCalls = setTimeoutSpy.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: '抽選中……' }))
    expect(setTimeoutSpy).toHaveBeenCalledTimes(timerCalls)
    selectVenue('キラメキホール')
    expect(clearTimeoutSpy).toHaveBeenCalledWith(drawTimer)
  })

  it('抽選中に会場を変更しても古い結果を表示しない', () => {
    vi.useFakeTimers()
    startVenueDraw()
    selectVenue('キラメキホール')
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
    expect(screen.getByText('キラメキホール')).toBeInTheDocument()
  })

  it('抽選中に自作座席を変更しても古い結果を表示しない', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '自分で作る' }))
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    fireEvent.change(screen.getByLabelText('最後の列'), { target: { value: 'A' } })
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
  })

  it('解除済みの古いタイマーcallbackが実行されても結果を反映しない', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    startVenueDraw()
    const staleCallback = setTimeoutSpy.mock.calls.at(-1)?.[0]
    expect(staleCallback).toBeTypeOf('function')
    selectVenue('キラメキホール')
    act(() => (staleCallback as () => void)())
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
  })

  it('unmount時に保留中の抽選タイマーを解除する', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<App />)
    selectVenue()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    const drawTimer = setTimeoutSpy.mock.results.at(-1)?.value
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalledWith(drawTimer)
  })

  it('自作座席から抽選し、結果後だけ自作座席図を表示する', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '自分で作る' }))
    expect(screen.getByText('760席から今日の1席を抽選します')).toBeInTheDocument()
    expect(screen.queryByRole('figure', { name: '自作座席の簡易座席図' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS))
    expect(screen.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: '自作座席の簡易座席図' })).toBeInTheDocument()
  })

  it('不正な自作入力の近くにバリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '自分で作る' }))
    const firstSeat = screen.getByLabelText('最初の座席番号')
    await user.clear(firstSeat)
    await user.type(firstSeat, '0')
    await waitFor(() => expect(screen.getByText('1以上の安全な整数で入力してください。')).toBeInTheDocument())
    expect(firstSeat).toHaveAttribute('aria-describedby', 'first-seat-error')
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
  })
})
