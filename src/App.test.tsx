import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('App', () => {
  const startDrawThenChange = (changeConditions: () => void) => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    expect(screen.getByText('抽選結果を確認しています')).toBeInTheDocument()
    changeConditions()
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'チケットをご用意できました！' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '今回はご用意できませんでした' })).not.toBeInTheDocument()
  }

  it('抽選中に会場を変更しても古い結果を表示しない', () => {
    startDrawThenChange(() => fireEvent.click(screen.getByRole('radio', { name: /キラメキホール/ })))
  })

  it('抽選中に座席作成方法を変更しても古い結果を表示しない', () => {
    startDrawThenChange(() => fireEvent.click(screen.getByRole('tab', { name: '自分で作る' })))
    expect(screen.getByText('760席')).toBeInTheDocument()
  })

  it('抽選中にレイアウトを変更しても古い結果を表示しない', () => {
    startDrawThenChange(() => fireEvent.change(screen.getByLabelText('レイアウト'), { target: { value: 'end-stage' } }))
  })

  it('抽選中に抽選モードを変更しても古い結果を表示しない', () => {
    startDrawThenChange(() => fireEvent.click(screen.getByRole('radio', { name: /当落＋座席抽選/ })))
  })

  it('抽選中に当選確率を変更しても古い結果を表示しない', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('radio', { name: /当落＋座席抽選/ }))
    fireEvent.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    fireEvent.change(screen.getByLabelText('シミュレーション上の当選確率'), { target: { value: '70' } })
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'チケットをご用意できました！' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '今回はご用意できませんでした' })).not.toBeInTheDocument()
  })

  it('抽選中に自作座席入力を変更しても古い結果を表示しない', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: '自分で作る' }))
    fireEvent.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    fireEvent.change(screen.getByLabelText('最後の列'), { target: { value: 'A' } })
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('heading', { name: 'チケットをご用意できました！' })).not.toBeInTheDocument()
  })

  it('同時に複数の抽選タイマーを開始せず、条件変更時に解除する', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    render(<App />)
    const baselineSetTimeoutCalls = setTimeoutSpy.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    expect(setTimeoutSpy).toHaveBeenCalledTimes(baselineSetTimeoutCalls + 1)
    const drawTimer = setTimeoutSpy.mock.results.at(-1)?.value
    fireEvent.click(screen.getByRole('button', { name: '抽選中です…' }))
    expect(setTimeoutSpy).toHaveBeenCalledTimes(baselineSetTimeoutCalls + 1)
    fireEvent.click(screen.getByRole('radio', { name: /キラメキホール/ }))
    expect(clearTimeoutSpy).toHaveBeenCalledWith(drawTimer)
  })

  it('解除済みの古いタイマーcallbackが実行されても結果を反映しない', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    const staleCallback = setTimeoutSpy.mock.calls.at(-1)?.[0]
    expect(staleCallback).toBeTypeOf('function')
    fireEvent.click(screen.getByRole('radio', { name: /キラメキホール/ }))
    act(() => (staleCallback as () => void)())
    expect(screen.queryByRole('heading', { name: 'チケットをご用意できました！' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '今回はご用意できませんでした' })).not.toBeInTheDocument()
  })

  it('unmount時に保留中の抽選タイマーを解除する', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<App />)
    const baselineSetTimeoutCalls = setTimeoutSpy.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    expect(setTimeoutSpy).toHaveBeenCalledTimes(baselineSetTimeoutCalls + 1)
    const drawTimer = setTimeoutSpy.mock.results.at(-1)?.value
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalledWith(drawTimer)
  })

  it('不正な会場IDは未選択として安全に扱う', () => {
    window.history.replaceState({}, '', '/?venue=unknown-venue')
    const { container } = render(<App />)
    expect(container.querySelector('input[name="venue"]:checked')).toBeNull()
    expect(screen.getByRole('button', { name: /座席を抽選する/ })).toBeDisabled()
  })

  it('会場を選択できる', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('radio', { name: /キラメキホール/ }))
    expect(screen.getByRole('radio', { name: /キラメキホール/ })).toBeChecked()
    expect(window.location.search).toContain('demo-kirameki-hall')
  })

  it('抽選モードを変更できる', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('radio', { name: /当落＋座席抽選/ }))
    expect(screen.getByLabelText('シミュレーション上の当選確率')).toBeInTheDocument()
  })

  it('抽選後に当選結果と座席を表示する', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    expect(await screen.findByRole('heading', { name: 'チケットをご用意できました！' })).toBeInTheDocument()
    expect(screen.getByText('座席番号')).toBeInTheDocument()
    expect(screen.getAllByText(/実際のチケット抽選・当選確率/)).toHaveLength(2)
  })

  it('落選時は座席番号を表示しない', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('radio', { name: /当落＋座席抽選/ }))
    await user.selectOptions(screen.getByLabelText('シミュレーション上の当選確率'), 'custom')
    const customProbability = screen.getByLabelText('自由入力の当選確率')
    await user.clear(customProbability)
    await user.type(customProbability, '0')
    await user.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    expect(await screen.findByRole('heading', { name: '今回はご用意できませんでした' })).toBeInTheDocument()
    expect(screen.queryByText('座席番号')).not.toBeInTheDocument()
    expect(screen.getByText('落選のため、座席は生成されていません。')).toBeInTheDocument()
  })

  it('自作座席から抽選できる', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: '自分で作る' }))
    expect(screen.getByText('760席')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /座席を抽選する/ }))
    expect(await screen.findByRole('heading', { name: 'チケットをご用意できました！' })).toBeInTheDocument()
    expect(screen.getByText('自作レイアウト')).toBeInTheDocument()
  })

  it('不正入力の近くにバリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: '自分で作る' }))
    const firstSeat = screen.getByLabelText('最初の座席番号')
    await user.clear(firstSeat)
    await user.type(firstSeat, '0')
    await waitFor(() => expect(screen.getByText('1以上の安全な整数で入力してください。')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /座席を抽選する/ })).toBeDisabled()
  })
})
