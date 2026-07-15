import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { LotteryAnimation } from './components/lottery/LotteryAnimation'
import { LotterySettings } from './components/lottery/LotterySettings'
import { ResultCard } from './components/lottery/ResultCard'
import { SeatMap } from './components/seat-map/SeatMap'
import { CustomSeatBuilder } from './components/venue/CustomSeatBuilder'
import { VenueSelector } from './components/venue/VenueSelector'
import { venues } from './data/venues'
import { runLottery, type LotteryMode, type LotteryResult } from './domain/lottery/lottery'
import { generateCustomSeats, validateCustomSeatInput, type CustomSeatInput } from './domain/seats/customSeats'
import { generateVenueSeats } from './domain/seats/venueSeats'
import { useReducedMotion } from './hooks/useReducedMotion'
import { loadPreferences, savePreferences } from './lib/preferences'
import { buildShareText, shareResult } from './lib/share'

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

const initialPreferences = loadPreferences()

const initialVenueId = (): string => {
  const queryVenue = new URLSearchParams(window.location.search).get('venue')
  if (queryVenue !== null) return venues.some((venue) => venue.id === queryVenue) ? queryVenue : ''
  if (initialPreferences.venueId && venues.some((venue) => venue.id === initialPreferences.venueId)) return initialPreferences.venueId
  return venues[0]?.id ?? ''
}

function App() {
  const [sourceMode, setSourceMode] = useState<SourceMode>('venue')
  const [selectedVenueId, setSelectedVenueId] = useState(initialVenueId)
  const [selectedLayoutId, setSelectedLayoutId] = useState(() => venues.find((venue) => venue.id === initialVenueId())?.layouts[0]?.id ?? '')
  const [customInput, setCustomInput] = useState(DEFAULT_CUSTOM)
  const [lotteryMode, setLotteryMode] = useState<LotteryMode>(initialPreferences.lotteryMode ?? 'seat-only')
  const [probability, setProbability] = useState(initialPreferences.probability ?? 50)
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<LotteryResult | null>(null)
  const [userError, setUserError] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const timeoutRef = useRef<number | null>(null)
  const drawSequenceRef = useRef(0)
  const settingsRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId)
  const selectedLayout = selectedVenue?.layouts.find((layout) => layout.id === selectedLayoutId) ?? selectedVenue?.layouts[0]
  const customValidation = useMemo(() => validateCustomSeatInput(customInput), [customInput])
  const customSeats = useMemo(() => generateCustomSeats(customInput), [customInput])
  const venueSeats = useMemo(
    () => selectedVenue && selectedLayout ? generateVenueSeats(selectedVenue, selectedLayout) : [],
    [selectedLayout, selectedVenue],
  )
  const availableSeats = sourceMode === 'venue' ? venueSeats : customSeats
  const venueName = sourceMode === 'venue' ? selectedVenue?.name ?? '未選択の会場' : customInput.venueName.trim() || 'マイ会場'
  const probabilityValid = Number.isFinite(probability) && probability >= 0 && probability <= 100
  const canDraw = availableSeats.length > 0 && probabilityValid && (sourceMode === 'venue' || Object.keys(customValidation.errors).length === 0)

  useEffect(() => {
    savePreferences({ venueId: selectedVenueId || undefined, lotteryMode, probability: probabilityValid ? probability : 50 })
  }, [lotteryMode, probability, probabilityValid, selectedVenueId])

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
  }, [cancelPendingDraw])

  const resetResult = () => {
    cancelPendingDraw()
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
    const nextVenue = venues.find((venue) => venue.id === venueId)
    setSelectedVenueId(venueId)
    setSelectedLayoutId(nextVenue?.layouts[0]?.id ?? '')
    resetResult()
    const url = new URL(window.location.href)
    url.searchParams.set('venue', venueId)
    window.history.replaceState({}, '', url)
  }

  const changeLayout = (layoutId: string) => {
    setSelectedLayoutId(layoutId)
    resetResult()
  }

  const startDraw = () => {
    if (phase === 'drawing') return
    if (!canDraw) {
      setUserError(sourceMode === 'venue' ? '有効な座席を含む会場とレイアウトを選んでください。' : '座席範囲のエラーを直してから抽選してください。')
      return
    }
    try {
      const drawSequence = cancelPendingDraw()
      const nextResult = runLottery(lotteryMode, availableSeats, probability)
      setPhase('drawing')
      setResult(null)
      setShareStatus('')
      setUserError('')
      const duration = import.meta.env.MODE === 'test' ? 0 : reducedMotion ? 100 : 1800
      timeoutRef.current = window.setTimeout(() => {
        if (drawSequenceRef.current !== drawSequence) return
        timeoutRef.current = null
        setResult(nextResult)
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
    const url = new URL(window.location.href)
    if (sourceMode === 'venue' && selectedVenueId) url.searchParams.set('venue', selectedVenueId)
    const text = buildShareText(venueName, result)
    const outcome = await shareResult(text, url.toString())
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
        <span className="header-badge">PLAY ONLY</span>
      </header>

      <main>
        <section className="hero-section">
          <p className="eyebrow"><span aria-hidden="true">●</span> SEAT LOTTERY EXPERIENCE</p>
          <h1>今日の運で、<br /><em>どの席に出会う？</em></h1>
          <p className="hero-lead">ライブ前の願掛けに。架空の座席抽選を、ちょっと楽しく体験できます。</p>
          <div className="hero-notice">
            <span aria-hidden="true">i</span>
            <p><strong>遊びのためのシミュレーションです</strong>実際のチケット抽選・当選確率・座席割り当てを予測または再現するものではありません。</p>
          </div>
        </section>

        <section className="setup-card" ref={settingsRef} tabIndex={-1} aria-labelledby="setup-heading">
          <div className="section-heading">
            <span className="step-number">01</span>
            <div><p className="eyebrow">PICK YOUR SEATS</p><h2 id="setup-heading">抽選する座席を決める</h2></div>
          </div>

          <div className="source-tabs" role="tablist" aria-label="座席の作り方">
            <button type="button" role="tab" aria-selected={sourceMode === 'venue'} onClick={() => changeSource('venue')}>会場から選ぶ</button>
            <button type="button" role="tab" aria-selected={sourceMode === 'custom'} onClick={() => changeSource('custom')}>自分で作る</button>
          </div>

          <div role="tabpanel" className="source-panel">
            {sourceMode === 'venue' ? (
              <>
                <VenueSelector venues={venues} selectedVenueId={selectedVenueId} onSelect={changeVenue} />
                {selectedVenue && (
                  <details className="details-panel">
                    <summary>選択内容の詳細と座席図</summary>
                    <div className="details-content">
                      {selectedVenue.layouts.length > 1 && (
                        <label className="layout-select"><span>レイアウト</span><select value={selectedLayout?.id} onChange={(event) => changeLayout(event.target.value)}>{selectedVenue.layouts.map((layout) => <option value={layout.id} key={layout.id}>{layout.name}</option>)}</select></label>
                      )}
                      <p className="venue-notice">{selectedVenue.notice}</p>
                      {selectedLayout && <SeatMap venue={selectedVenue} layout={selectedLayout} />}
                    </div>
                  </details>
                )}
              </>
            ) : (
              <CustomSeatBuilder value={customInput} onChange={(next) => { setCustomInput(next); resetResult() }} />
            )}
          </div>

          <div className="divider" />
          <div className="section-heading compact">
            <span className="step-number">02</span>
            <div><p className="eyebrow">CHOOSE A MODE</p><h2>抽選モードを選ぶ</h2></div>
          </div>
          <LotterySettings
            mode={lotteryMode}
            onModeChange={(mode) => { setLotteryMode(mode); resetResult() }}
            probability={probability}
            onProbabilityChange={(value) => { setProbability(value); resetResult() }}
          />

          <form className="draw-area" onSubmit={(event) => { event.preventDefault(); startDraw() }}>
            <p>{canDraw ? `${availableSeats.length.toLocaleString('ja-JP')}席から運命の1席を抽選します` : '有効な座席範囲を設定してください'}</p>
            <button className="draw-button" type="submit" disabled={!canDraw || phase === 'drawing'}>
              <span aria-hidden="true">✦</span>{phase === 'drawing' ? '抽選中です…' : '座席を抽選する'}<span aria-hidden="true">→</span>
            </button>
            {userError && <p className="form-error centered" role="alert">{userError}</p>}
          </form>
        </section>

        <div className="result-region" aria-live="polite" aria-atomic="true">
          {phase === 'drawing' && <LotteryAnimation />}
          {phase === 'result' && result && (
            <ResultCard
              result={result}
              venueName={venueName}
              venue={sourceMode === 'venue' ? selectedVenue : undefined}
              layout={sourceMode === 'venue' ? selectedLayout : undefined}
              customSeats={sourceMode === 'custom' ? customSeats : undefined}
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
