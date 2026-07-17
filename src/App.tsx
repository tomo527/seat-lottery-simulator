import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { LotteryAnimation } from './components/lottery/LotteryAnimation'
import { ResultCard } from './components/lottery/ResultCard'
import { CustomSeatBuilder } from './components/venue/CustomSeatBuilder'
import { VenueSelector } from './components/venue/VenueSelector'
import { venues } from './data/venues'
import { DRAW_ANIMATION_DURATION_MS, REDUCED_MOTION_DRAW_DURATION_MS } from './domain/lottery/constants'
import { drawSeat, formatSeatLabel } from './domain/lottery/lottery'
import { generateCustomSeats, validateCustomSeatInput, type CustomSeatInput } from './domain/seats/customSeats'
import { generateVenueSeats } from './domain/seats/venueSeats'
import { useReducedMotion } from './hooks/useReducedMotion'
import { loadPreferences, savePreferences } from './lib/preferences'
import { buildShareText, shareResult } from './lib/share'
import type { Seat } from './types/venue'

type SourceMode = 'venue' | 'custom'
type Phase = 'idle' | 'drawing' | 'result'

const DEFAULT_CUSTOM: CustomSeatInput = {
  venueName: '',
  areaName: '',
  rowKind: 'alphabet',
  firstRow: 'A',
  lastRow: 'S',
  firstSeat: '1',
  lastSeat: '40',
}

const initialVenueId = (): string => {
  const queryVenue = new URLSearchParams(window.location.search).get('venue')
  if (queryVenue !== null) return venues.some((venue) => venue.id === queryVenue) ? queryVenue : ''
  const storedVenueId = loadPreferences().venueId
  return storedVenueId && venues.some((venue) => venue.id === storedVenueId) ? storedVenueId : ''
}

function App() {
  const [sourceMode, setSourceMode] = useState<SourceMode>('venue')
  const [selectedVenueId, setSelectedVenueId] = useState(initialVenueId)
  const [customInput, setCustomInput] = useState(DEFAULT_CUSTOM)
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<Seat | null>(null)
  const [userError, setUserError] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const timeoutRef = useRef<number | null>(null)
  const drawSequenceRef = useRef(0)
  const shareSequenceRef = useRef(0)
  const settingsRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId)
  const selectedLayout = selectedVenue?.layouts[0]
  const customValidation = useMemo(() => validateCustomSeatInput(customInput), [customInput])
  const customSeats = useMemo(() => generateCustomSeats(customInput), [customInput])
  const venueSeats = useMemo(
    () => selectedVenue && selectedLayout ? generateVenueSeats(selectedVenue, selectedLayout) : [],
    [selectedLayout, selectedVenue],
  )
  const availableSeats = sourceMode === 'venue' ? venueSeats : customSeats
  const venueName = sourceMode === 'venue' ? selectedVenue?.name ?? '未選択の会場' : customInput.venueName.trim() || 'マイ会場'
  const canDraw = availableSeats.length > 0 && (sourceMode === 'venue' || Object.keys(customValidation.errors).length === 0)

  useEffect(() => {
    savePreferences({ venueId: selectedVenueId || undefined })
  }, [selectedVenueId])

  const cancelPendingDraw = useCallback(() => {
    drawSequenceRef.current += 1
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    return drawSequenceRef.current
  }, [])

  useEffect(() => () => {
    cancelPendingDraw()
    shareSequenceRef.current += 1
  }, [cancelPendingDraw])

  const resetResult = () => {
    cancelPendingDraw()
    shareSequenceRef.current += 1
    setPhase('idle')
    setResult(null)
    setShareStatus('')
    setUserError('')
  }

  const changeSource = (mode: SourceMode) => {
    setSourceMode(mode)
    resetResult()
    const url = new URL(window.location.href)
    if (mode === 'custom') url.searchParams.delete('venue')
    else if (selectedVenueId) url.searchParams.set('venue', selectedVenueId)
    window.history.replaceState({}, '', url)
  }

  const changeVenue = (venueId: string) => {
    setSelectedVenueId(venueId)
    resetResult()
    const url = new URL(window.location.href)
    url.searchParams.set('venue', venueId)
    window.history.replaceState({}, '', url)
  }

  const changeCustomInput = (next: CustomSeatInput) => {
    setCustomInput(next)
    resetResult()
  }

  const startDraw = () => {
    if (phase === 'drawing') return
    if (!canDraw) {
      setUserError(sourceMode === 'venue' ? '会場を選択してください。' : '座席範囲のエラーを直してから抽選してください。')
      return
    }
    try {
      shareSequenceRef.current += 1
      const drawSequence = cancelPendingDraw()
      const nextSeat = drawSeat(availableSeats)
      setPhase('drawing')
      setResult(null)
      setShareStatus('')
      setUserError('')
      const duration = reducedMotion ? REDUCED_MOTION_DRAW_DURATION_MS : DRAW_ANIMATION_DURATION_MS
      timeoutRef.current = window.setTimeout(() => {
        if (drawSequenceRef.current !== drawSequence) return
        timeoutRef.current = null
        setResult(nextSeat)
        setPhase('result')
      }, duration)
    } catch (error) {
      console.error('Lottery could not be completed.', error)
      setUserError('抽選を完了できませんでした。入力内容を確認して、もう一度お試しください。')
      setPhase('idle')
    }
  }

  const changeConditions = () => {
    resetResult()
    window.setTimeout(() => {
      settingsRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
      settingsRef.current?.focus({ preventScroll: true })
    }, 0)
  }

  const handleShare = async () => {
    if (!result) return
    const shareSequence = ++shareSequenceRef.current
    const url = new URL(window.location.href)
    if (sourceMode === 'venue' && selectedVenueId) url.searchParams.set('venue', selectedVenueId)
    const text = buildShareText(venueName, result)
    const outcome = await shareResult(text, url.toString())
    if (shareSequenceRef.current !== shareSequence) return
    setShareStatus(
      outcome === 'copied' ? '共有文をクリップボードにコピーしました。' :
      outcome === 'shared' ? '共有メニューを開きました。' :
      outcome === 'cancelled' ? '' :
      'この環境では共有やコピーを利用できません。共有文を手動でコピーしてください。',
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="座席抽選シミュレーター トップ">
          <span className="brand-mark" aria-hidden="true">★</span>
          <span>座席抽選<br /><strong>シミュレーター</strong></span>
        </a>
      </header>

      <main>
        <section className="hero-section">
          <h1>あなたの今日の席運は？</h1>
          <p className="hero-lead">ライブ前の願掛けに。架空の座席抽選を、ちょっと楽しく体験できます。</p>
          <div className="hero-notice">
            <span aria-hidden="true">i</span>
            <p><strong>遊びのためのシミュレーションです</strong>実際の座席割り当てを予測または再現するものではありません。</p>
          </div>
        </section>

        <section className="setup-card" ref={settingsRef} tabIndex={-1} aria-labelledby="setup-heading">
          <div className="section-heading">
            <h2 id="setup-heading">{sourceMode === 'venue' ? '抽選する会場を選ぶ' : '抽選する座席を作る'}</h2>
          </div>

          <div className="source-tabs" role="group" aria-label="座席の作り方">
            <button id="venue-source-button" type="button" aria-pressed={sourceMode === 'venue'} aria-controls="seat-source-panel" onClick={() => changeSource('venue')}>会場から選ぶ</button>
            <button id="custom-source-button" type="button" aria-pressed={sourceMode === 'custom'} aria-controls="seat-source-panel" onClick={() => changeSource('custom')}>自分で作る</button>
          </div>

          <div id="seat-source-panel" aria-labelledby={sourceMode === 'venue' ? 'venue-source-button' : 'custom-source-button'} className="source-panel">
            {sourceMode === 'venue' ? (
              <VenueSelector venues={venues} selectedVenueId={selectedVenueId} onSelect={changeVenue} />
            ) : (
              <CustomSeatBuilder value={customInput} onChange={changeCustomInput} />
            )}
          </div>

          <form className="draw-area" onSubmit={(event) => { event.preventDefault(); startDraw() }}>
            <p>{canDraw ? `${availableSeats.length.toLocaleString('ja-JP')}席から今日の1席を抽選します` : sourceMode === 'venue' ? '会場を選択してください' : '有効な座席範囲を設定してください'}</p>
            <button className="draw-button" type="submit" disabled={!canDraw || phase === 'drawing'}>
              <span aria-hidden="true">✦</span>{phase === 'drawing' ? '抽選中……' : '座席を抽選する'}<span aria-hidden="true">→</span>
            </button>
            {userError && <p className="form-error centered" role="alert">{userError}</p>}
          </form>
        </section>

        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {phase === 'drawing' ? '抽選中です。今日の席運を確認しています。' : phase === 'result' && result ? `抽選結果を表示しました。${formatSeatLabel(result)}です。` : ''}
        </div>
        <div className="result-region">
          {phase === 'drawing' && <LotteryAnimation />}
          {phase === 'result' && result && (
            <ResultCard
              seat={result}
              venueName={venueName}
              shareStatus={shareStatus}
              onRetry={startDraw}
              onChangeConditions={changeConditions}
              onShare={handleShare}
            />
          )}
        </div>
      </main>

      <footer>
        <strong>座席抽選シミュレーター</strong>
        <p>すべての結果はエンターテインメント目的の架空シミュレーションです。</p>
        <span>NO REAL TICKET DATA · NO PREDICTIONS</span>
      </footer>
    </div>
  )
}

export default App
