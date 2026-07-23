import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { DRAW_ANIMATION_DURATION_MS } from './domain/lottery/constants'
import { prepareVenueSampler } from './domain/seats/rangeSampler'
import type { VenueCatalogEntry } from './types/venue'

const loadVenueSeatData = vi.hoisted(() => vi.fn())
vi.mock('./data/venue-db/loadVenue', () => ({ loadVenueSeatData }))

const samplerFor = (venue: VenueCatalogEntry) => prepareVenueSampler({
  schemaVersion: 1,
  venueId: venue.id,
  patternId: 'test-pattern',
  ranges: [{ rowLabel: 'A', from: 1, to: venue.seatCount }],
  totalSeatCount: venue.seatCount,
})

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/')
  loadVenueSeatData.mockReset()
  loadVenueSeatData.mockImplementation(async (venue: VenueCatalogEntry) => samplerFor(venue))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const chooseVenue = async (name = 'Hakuju Hall') => {
  const trigger = screen.queryByRole('button', { name: '会場を選ぶ' }) ?? screen.getByRole('button', { name: '会場を変更' })
  fireEvent.click(trigger)
  fireEvent.click(screen.getByRole('button', { name: `${name}を選ぶ` }))
  await waitFor(() => expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeEnabled())
}

describe('App', () => {
  it('初期表示では詳細を読まず、東京10会場を絞り込める', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeInTheDocument()
    expect(screen.getByText('まだ会場が選択されていません。')).toBeInTheDocument()
    expect(loadVenueSeatData).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    fireEvent.change(screen.getByLabelText('エリア'), { target: { value: '関東' } })
    fireEvent.change(screen.getByLabelText('都道府県'), { target: { value: '東京都' } })
    expect(screen.getByText('絞り込み結果 10件')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '会場の検索結果' }).querySelectorAll('button')).toHaveLength(10)
  })

  it('会場名・略称をNFKC正規化して検索し、所在地は対象にしない', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    const search = screen.getByLabelText('会場名で検索')
    fireEvent.change(search, { target: { value: '  ＩＩＮＯ　ＨＡＬＬ  ' } })
    expect(screen.getByRole('button', { name: 'イイノホールを選ぶ' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '渋谷区' } })
    expect(screen.queryByRole('button', { name: 'Hakuju Hallを選ぶ' })).not.toBeInTheDocument()
  })

  it('選択した会場だけを読み込み、読込中は抽選できない', async () => {
    let resolve!: (value: ReturnType<typeof samplerFor>) => void
    loadVenueSeatData.mockImplementationOnce((venue: VenueCatalogEntry) => new Promise((done) => { resolve = done }).then(() => samplerFor(venue)))
    render(<App />)
    const trigger = screen.getByRole('button', { name: '会場を選ぶ' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Hakuju Hallを選ぶ' }))
    expect(screen.getByText('座席データを読み込んでいます')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
    expect(loadVenueSeatData).toHaveBeenCalledTimes(1)
    act(() => resolve(samplerFor(loadVenueSeatData.mock.calls[0][0])))
    await waitFor(() => expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeEnabled())
  })

  it('選択中の会場タブを再度押しても読込済みデータを維持する', async () => {
    render(<App />)
    await chooseVenue()
    fireEvent.click(screen.getByRole('button', { name: '会場から選ぶ' }))
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
    expect(loadVenueSeatData).toHaveBeenCalledTimes(1)
  })

  it('読込失敗を安全な案内に変換する', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    loadVenueSeatData.mockRejectedValueOnce(new Error('network details'))
    render(<App />)
    const trigger = screen.getByRole('button', { name: '会場を選ぶ' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Hakuju Hallを選ぶ' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('座席データを読み込めませんでした。もう一度会場を選択してください。')
    expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()
  })

  it('読込失敗後に同じ会場を選び直すと再読込できる', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    loadVenueSeatData.mockRejectedValueOnce(new Error('network details'))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hakuju Hallを選ぶ' }))
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: '会場を変更' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hakuju Hallを選ぶ' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '座席を抽選する' })).toBeEnabled())
    expect(loadVenueSeatData).toHaveBeenCalledTimes(2)
  })

  it('会場切替時は遅れて届いた古いresponseを無視する', async () => {
    const pending = new Map<string, (value: ReturnType<typeof samplerFor>) => void>()
    loadVenueSeatData.mockImplementation((venue: VenueCatalogEntry) => new Promise((resolve) => pending.set(venue.id, resolve)))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '会場を選ぶ' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hakuju Hallを選ぶ' }))
    fireEvent.click(screen.getByRole('button', { name: '会場を変更' }))
    fireEvent.click(screen.getByRole('button', { name: 'TOPPANホールを選ぶ' }))
    const first = loadVenueSeatData.mock.calls[0][0] as VenueCatalogEntry
    const second = loadVenueSeatData.mock.calls[1][0] as VenueCatalogEntry
    act(() => pending.get(second.id)?.(samplerFor(second)))
    await waitFor(() => expect(screen.getByText('408席から今日の1席を抽選します')).toBeInTheDocument())
    act(() => pending.get(first.id)?.(samplerFor(first)))
    expect(screen.getByText('TOPPANホール')).toBeInTheDocument()
    expect(screen.queryByText('300席から今日の1席を抽選します')).not.toBeInTheDocument()
  })

  it('2,999msと3,199msでは結果を出さず、3,200msで通知風のテキスト結果だけを表示する', async () => {
    render(<App />)
    await chooseVenue()
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    expect(screen.getByRole('heading', { name: '抽選中……' })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(2_999))
    expect(screen.queryByRole('heading', { name: '抽選結果のお知らせ' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(200))
    expect(screen.queryByRole('heading', { name: '抽選結果のお知らせ' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeInTheDocument()
    expect(screen.getByText(/厳正なる抽選の結果/)).toBeInTheDocument()
    expect(screen.getByText('SIMULATION')).toBeInTheDocument()
    expect(screen.getByText('※これは遊びのためのシミュレーションです。実際の座席割り当てとは関係ありません。')).toBeInTheDocument()
    expect(screen.getByText('A列')).toBeInTheDocument()
    expect(document.querySelector('svg')).not.toBeInTheDocument()
  })

  it('reduced motionでも3,200ms待ってから結果を表示する', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)', media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    }))
    render(<App />)
    await chooseVenue()
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    act(() => vi.advanceTimersByTime(DRAW_ANIMATION_DURATION_MS - 1))
    expect(screen.queryByRole('heading', { name: '抽選結果のお知らせ' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeInTheDocument()
  })

  it('抽選中は可愛い装飾を支援技術から隠し、進行状態を通知する', async () => {
    render(<App />)
    await chooseVenue()
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    expect(screen.getByTestId('lottery-animation')).toBeInTheDocument()
    expect(document.querySelector('.drawing-envelope')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('.drawing-sparkles')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('.ticket-numbers')).toHaveTextContent('A列12番')
    expect(screen.getByRole('status')).toHaveTextContent('抽選中です。今日の席運を確認しています。')
    expect(screen.getByRole('button', { name: '抽選中……' })).toBeDisabled()
  })

  it('抽選中の二重実行と、条件変更後の古いcallbackを拒否する', async () => {
    render(<App />)
    await chooseVenue()
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    const staleCallback = setTimeoutSpy.mock.calls.at(-1)?.[0] as () => void
    const count = setTimeoutSpy.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: '抽選中……' }))
    expect(setTimeoutSpy).toHaveBeenCalledTimes(count)
    fireEvent.click(screen.getByRole('button', { name: '会場を変更' }))
    fireEvent.click(screen.getByRole('button', { name: 'TOPPANホールを選ぶ' }))
    act(staleCallback)
    expect(screen.queryByRole('heading', { name: '抽選結果のお知らせ' })).not.toBeInTheDocument()
  })

  it('自作座席の変更で古い結果を取消し、unmountでもタイマーを解除する', async () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '自分で作る' }))
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    fireEvent.change(screen.getByLabelText('最後の座席番号'), { target: { value: '20' } })
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: '抽選結果のお知らせ' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '座席を抽選する' }))
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('有効URLを復元し、不正URLは安全に未選択へ戻す', async () => {
    window.history.replaceState({}, '', '/?venue=national-bunraku-theatre-standard')
    const { unmount } = render(<App />)
    expect(screen.getByText('国立文楽劇場')).toBeInTheDocument()
    await waitFor(() => expect(loadVenueSeatData).toHaveBeenCalledTimes(1))
    unmount()
    window.history.replaceState({}, '', '/?venue=unknown')
    render(<App />)
    expect(screen.getByText('まだ会場が選択されていません。')).toBeInTheDocument()
  })
})
