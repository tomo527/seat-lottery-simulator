import { useEffect, useRef } from 'react'
import { DRAW_ANIMATION_DURATION_MS } from '../../domain/lottery/constants'

const FRAME_INTERVAL_MS = 125 // ~8fps
const INTRO_FRAMES = [0, 1, 2, 3] // 待機 → 手を伸ばす（1回だけ再生）
const LOOP_FRAMES = [4, 5, 6, 7, 8, 9, 10, 11] // くじ筒の中を探る（残り時間ぶんループ）
const STATIC_REDUCED_MOTION_FRAME = LOOP_FRAMES[0]

export function LotteryAnimation() {
  const spriteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = spriteRef.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--frame', String(STATIC_REDUCED_MOTION_FRAME))
      return
    }

    const totalSteps = Math.round(DRAW_ANIMATION_DURATION_MS / FRAME_INTERVAL_MS)
    let step = 0
    const frameAtStep = (index: number) =>
      index < INTRO_FRAMES.length
        ? INTRO_FRAMES[index]
        : LOOP_FRAMES[(index - INTRO_FRAMES.length) % LOOP_FRAMES.length]

    el.style.setProperty('--frame', String(frameAtStep(0)))
    const intervalId = window.setInterval(() => {
      step += 1
      if (step >= totalSteps) {
        window.clearInterval(intervalId)
        return
      }
      el.style.setProperty('--frame', String(frameAtStep(step)))
    }, FRAME_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="drawing-card" aria-labelledby="drawing-heading" data-testid="lottery-animation">
      <div className="drawing-glow" aria-hidden="true" />
      <div className="lottery-sprite-wrap" aria-hidden="true">
        <div ref={spriteRef} className="lottery-sprite" data-testid="lottery-sprite" style={{ '--frame': 0 } as React.CSSProperties} />
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
