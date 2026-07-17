import { MAX_GENERATED_SEATS, validateCustomSeatInput, type CustomSeatInput, type RowKind } from '../../domain/seats/customSeats'

type Props = {
  value: CustomSeatInput
  onChange: (value: CustomSeatInput) => void
}

export function CustomSeatBuilder({ value, onChange }: Props) {
  const validation = validateCustomSeatInput(value)
  const update = <K extends keyof CustomSeatInput>(key: K, next: CustomSeatInput[K]) => onChange({ ...value, [key]: next })

  return (
    <div className="custom-builder">
      <div className="field-grid optional-fields">
        <label>
          <span>会場名 <small>任意</small></span>
          <input value={value.venueName} onChange={(event) => update('venueName', event.target.value)} placeholder="マイ会場" />
        </label>
        <label>
          <span>エリア名 <small>任意</small></span>
          <input value={value.areaName} onChange={(event) => update('areaName', event.target.value)} placeholder="アリーナ" />
        </label>
      </div>

      <fieldset className="row-kind">
        <legend>列の種類</legend>
        {([['alphabet', 'アルファベット'], ['number', '数字']] as [RowKind, string][]).map(([kind, label]) => (
          <label key={kind} className={value.rowKind === kind ? 'is-selected' : ''}>
            <input type="radio" name="row-kind" value={kind} checked={value.rowKind === kind} onChange={() => update('rowKind', kind)} />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="range-grid">
        <label>
          <span>最初の列</span>
          <input aria-invalid={Boolean(validation.errors.firstRow || validation.errors.range)} aria-describedby="first-row-error" value={value.firstRow} onChange={(event) => update('firstRow', event.target.value)} inputMode={value.rowKind === 'number' ? 'numeric' : 'text'} />
          <span className="field-error" id="first-row-error">{validation.errors.firstRow ?? validation.errors.range}</span>
        </label>
        <span className="range-separator" aria-hidden="true">→</span>
        <label>
          <span>最後の列</span>
          <input aria-invalid={Boolean(validation.errors.lastRow || validation.errors.range)} aria-describedby="last-row-error" value={value.lastRow} onChange={(event) => update('lastRow', event.target.value)} inputMode={value.rowKind === 'number' ? 'numeric' : 'text'} />
          <span className="field-error" id="last-row-error">{validation.errors.lastRow ?? validation.errors.range}</span>
        </label>
      </div>

      <div className="range-grid">
        <label>
          <span>最初の座席番号</span>
          <input type="number" min="1" step="1" aria-invalid={Boolean(validation.errors.firstSeat)} aria-describedby="first-seat-error" value={value.firstSeat} onChange={(event) => update('firstSeat', event.target.value)} />
          <span className="field-error" id="first-seat-error">{validation.errors.firstSeat}</span>
        </label>
        <span className="range-separator" aria-hidden="true">→</span>
        <label>
          <span>最後の座席番号</span>
          <input type="number" min="1" step="1" aria-invalid={Boolean(validation.errors.lastSeat)} aria-describedby="last-seat-error" value={value.lastSeat} onChange={(event) => update('lastSeat', event.target.value)} />
          <span className="field-error" id="last-seat-error">{validation.errors.lastSeat}</span>
        </label>
      </div>

      <div className={`seat-count ${Object.keys(validation.errors).length ? 'has-error' : ''}`} aria-live="polite">
        <span>生成される座席</span>
        <strong>{validation.count.toLocaleString('ja-JP')}席</strong>
        <small>上限 {MAX_GENERATED_SEATS.toLocaleString('ja-JP')}席</small>
      </div>
      {validation.errors.range && <p className="form-error" role="alert">{validation.errors.range}</p>}
    </div>
  )
}
