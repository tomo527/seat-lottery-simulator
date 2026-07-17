export function LotteryAnimation() {
  return (
    <div className="drawing-card" aria-labelledby="drawing-heading">
      <div className="stage-lights" aria-hidden="true"><i /><i /></div>
      <div className="drawing-ticket" aria-hidden="true">
        <span className="ticket-star">☆</span>
        <span className="ticket-numbers"><i>07</i><i>24</i><i>51</i></span>
      </div>
      <h2 id="drawing-heading">抽選中……</h2>
      <div className="drawing-copy">
        <p>今日の席運を確認しています</p>
        <p>運命の1席を選んでいます</p>
      </div>
      <div className="drawing-dots" aria-hidden="true"><i /><i /><i /></div>
    </div>
  )
}
