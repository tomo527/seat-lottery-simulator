import type { LotteryMode } from '../../domain/lottery/lottery'

const PRESETS = [10, 30, 50, 70, 90]

type Props = {
  mode: LotteryMode
  onModeChange: (mode: LotteryMode) => void
  probability: number
  onProbabilityChange: (probability: number) => void
}

export function LotterySettings({ mode, onModeChange, probability, onProbabilityChange }: Props) {
  const isPreset = PRESETS.includes(probability)
  return (
    <div className="lottery-settings">
      <fieldset className="mode-options">
        <legend>抽選モード</legend>
        <label className={mode === 'seat-only' ? 'is-selected' : ''}>
          <input type="radio" name="lottery-mode" checked={mode === 'seat-only'} onChange={() => onModeChange('seat-only')} />
          <span><strong>座席だけ抽選</strong><small>必ずどこか1席が出ます</small></span>
        </label>
        <label className={mode === 'chance-and-seat' ? 'is-selected' : ''}>
          <input type="radio" name="lottery-mode" checked={mode === 'chance-and-seat'} onChange={() => onModeChange('chance-and-seat')} />
          <span><strong>当落＋座席抽選</strong><small>当選したときだけ座席が出ます</small></span>
        </label>
      </fieldset>

      {mode === 'chance-and-seat' && (
        <div className="probability-settings">
          <label htmlFor="probability-preset">シミュレーション上の当選確率</label>
          <div className="probability-row">
            <select id="probability-preset" value={isPreset ? String(probability) : 'custom'} onChange={(event) => onProbabilityChange(event.target.value === 'custom' ? 55 : Number(event.target.value))}>
              {PRESETS.map((preset) => <option value={preset} key={preset}>{preset}%</option>)}
              <option value="custom">自由入力</option>
            </select>
            {!isPreset && (
              <label className="custom-probability">
                <span className="sr-only">自由入力の当選確率</span>
                <input aria-label="自由入力の当選確率" type="number" min="0" max="100" step="0.1" value={probability} aria-invalid={probability < 0 || probability > 100} onChange={(event) => onProbabilityChange(Number(event.target.value))} />
                <span>%</span>
              </label>
            )}
          </div>
          {(probability < 0 || probability > 100 || !Number.isFinite(probability)) && <p className="form-error" role="alert">0%以上100%以下で入力してください。</p>}
          <p className="inline-notice">この確率は遊びのための設定値です。実際のチケット当選確率とは無関係です。</p>
        </div>
      )}
    </div>
  )
}
