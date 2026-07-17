export function LotteryAnimation() {
  return (
    <div className="drawing-card">
      <div className="stage-lights" aria-hidden="true"><i /><i /></div>
      <div className="drawing-ticket" aria-hidden="true">
        <span className="ticket-star">✦</span>
        <span className="ticket-numbers"><i>07</i><i>24</i><i>51</i></span>
      </div>
      <h2>抽選中……</h2>
      <p className="drawing-sub">今日の席運を確認しています</p>
      <div className="drawing-dots" aria-hidden="true"><i /><i /><i /></div>
    </div>
  )
}
