export function LotteryAnimation() {
  return (
    <div className="drawing-card" aria-labelledby="drawing-heading" data-testid="lottery-animation">
      <div className="drawing-glow" aria-hidden="true" />
      <div className="miko-scene" aria-hidden="true">
        <div className="miko-figure">
          <div className="miko-body">
            <span className="miko-sash" />
            <span className="miko-arm left" />
            <span className="miko-arm right" />
          </div>
          <div className="miko-head">
            <span className="miko-eye left" />
            <span className="miko-eye right" />
            <span className="miko-blush left" />
            <span className="miko-blush right" />
            <span className="miko-mouth" />
          </div>
          <span className="miko-twintail left" />
          <span className="miko-twintail right" />
          <span className="miko-ribbon left" />
          <span className="miko-ribbon right" />
        </div>
        <div className="lottery-box">
          <span className="lottery-box-lid" />
          <span className="lottery-box-hole" />
        </div>
      </div>
      <h2 id="drawing-heading">抽選中……</h2>
      <div className="drawing-copy">
        <p>今日の席運を確認しています</p>
        <p>運命の1席を選んでいます</p>
        <p>もうすぐ結果が届きます</p>
      </div>
      <p className="drawing-progress" aria-hidden="true"><i>.</i><i>.</i><i>.</i></p>
    </div>
  )
}
