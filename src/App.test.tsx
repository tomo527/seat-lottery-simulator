import { act, fireEvent, render, screen } from '@testing-library/react'
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

const chooseVenue = (name = '国立文楽劇場') => {
  const trigger = screen.queryByRole('button', { name: '会場を選ぶ' }) ?? screen.getByRole('button', { name: '会場を変更' })
  fireEvent.click(trigger)
  fireEvent.click(screen.getByRole('button', { name: `${name}を選ぶ` }))
}

const startVenueDraw = () => {
  render(<App />)
  chooseVenue()
  fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
}

const finishDraw = () => act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS))

describe('App', () => {
  it('遊びサイトとして簡潔な初期画面を表示する', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeInTheDocument()
    expect(screen.getByText('まだ会場が選択されていません。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
    expect(document.body.textContent).not.toMatch(/公式・構造確認|公式・配置確認|公式・列番号確認|公式資料で|公式情報確認日|データ精度|実際の位置関係や縮尺/)
    expect(document.querySelector('svg')).not.toBeInTheDocument()
  })

  it('会場名・都道府県・市区町村で検索し、地域で絞り込める', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    const search = screen.getByLabelText('会場名・所在地を検索')
    fireEvent.change(search, { target: { value: '文楽' } })
    expect(screen.getByRole('button', { name: '国立文楽劇場を選ぶ' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '大阪市西区' } })
    expect(screen.getByRole('button', { name: '京セラドーム大阪を選ぶ' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('地域'), { target: { value: '近畿' } })
    expect(screen.getByText('2件の会場')).toBeInTheDocument()
  })

  it('会場選択後も公式リンク・精度・個別注釈をDOMへ出さない', () => {
    render(<App />)
    chooseVenue('京セラドーム大阪')
    expect(screen.getByText('京セラドーム大阪')).toBeInTheDocument()
    expect(screen.getByText('大阪府 大阪市西区')).toBeInTheDocument()
    expect(screen.getByText('抽選対象 34,522席')).toBeInTheDocument()
    expect(document.querySelector('a[href^="https://www.kyoceradome-osaka.jp"]')).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/公式|確認日|データ精度|対象外|固定席のみ|センター席はイベント/)
  })

  it('有効URLとlocalStorageを復元し、不正URLは安全に未選択へ戻す', () => {
    window.history.replaceState({}, '', '/?venue=national-bunraku-theatre-standard')
    const { unmount } = render(<App />)
    expect(screen.getByText('国立文楽劇場')).toBeInTheDocument()
    unmount()
    window.history.replaceState({}, '', '/?venue=unknown')
    render(<App />)
    expect(screen.getByText('まだ会場が選択されていません。')).toBeInTheDocument()
  })

  it('1,799msでは結果を出さず、1,800msでテキスト結果だけを表示する', () => {
    vi.useFakeTimers()
    startVenueDraw()
    expect(screen.getByRole('heading', { name: '抽選中……' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS - 1))
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeInTheDocument()
    expect(screen.getAllByText('国立文楽劇場')).toHaveLength(2)
    expect(screen.getByText('列')).toBeInTheDocument()
    expect(screen.getByText('座席番号')).toBeInTheDocument()
    expect(document.querySelector('svg')).not.toBeInTheDocument()
    expect(document.querySelector('[data-presentation]')).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/公式資料|公式情報確認日|データ精度|座席図|ステージ/)
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

  it('抽選中は二重実行を防止する', () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    startVenueDraw()
    const count = setTimeoutSpy.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: '抽選中……' }))
    expect(setTimeoutSpy).toHaveBeenCalledTimes(count)
  })

  it('抽選中の会場変更でタイマーを取消し、古いcallbackも拒否する', () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    startVenueDraw()
    const staleCallback = setTimeoutSpy.mock.calls.at(-1)?.[0] as () => void
    const timer = setTimeoutSpy.mock.results.at(-1)?.value
    chooseVenue('京セラドーム大阪')
    expect(clearTimeoutSpy).toHaveBeenCalledWith(timer)
    act(staleCallback)
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
    expect(screen.getByText('京セラドーム大阪')).toBeInTheDocument()
  })

  it('抽選中の自作座席変更で古い結果を表示しない', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '自分で作る' }))
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    fireEvent.change(screen.getByLabelText('最後の座席番号'), { target: { value: '20' } })
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'あなたの席はこちら！' })).not.toBeInTheDocument()
  })

  it('unmount時に保留タイマーを解除する', () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<App />)
    chooseVenue()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('自作座席を抽選し、エリア未入力なら空のエリア行を表示しない', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '自分で作る' }))
    fireEvent.change(screen.getByLabelText(/会場名/), { target: { value: 'マイ会場' } })
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    finishDraw()
    expect(screen.getByText('マイ会場')).toBeInTheDocument()
    expect(screen.queryByText('エリア')).not.toBeInTheDocument()
    expect(document.querySelector('svg')).not.toBeInTheDocument()
  })
})
