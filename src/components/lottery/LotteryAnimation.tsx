const STEPS = ['抽選結果を確認しています', '座席情報を組み立てています', '結果を準備しています']

export function LotteryAnimation() {
  return (
    <div className="drawing-card" role="status" aria-live="polite">
      <div className="orbit" aria-hidden="true"><span>★</span></div>
      <p className="eyebrow">NOW DRAWING</p>
      <h2>{STEPS[0]}</h2>
      <div className="drawing-dots" aria-hidden="true"><i /><i /><i /></div>
      <p className="drawing-sub">{STEPS[1]}。少しだけお待ちください。</p>
    </div>
  )
}
