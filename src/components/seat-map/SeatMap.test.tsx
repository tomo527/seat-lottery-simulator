import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { realVenues } from '../../data/venues/realVenues'
import { generateVenueSeats } from '../../domain/seats/venueSeats'
import type { Venue } from '../../types/venue'
import { SeatMap } from './SeatMap'

const venue = (id: string) => realVenues.find((item) => item.id === id)!

describe('SeatMap', () => {
  it('official-exactは公式情報に基づくsection mapを表示する', () => {
    const target = venue('tokyo-international-forum-hall-c')
    const layout = target.layouts[0]
    const seat = generateVenueSeats(target, layout)[0]
    const { container } = render(<SeatMap venue={target} layout={layout} highlightedSeat={seat} />)
    expect(container.querySelector('[data-presentation="verified-section-map"]')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /公式情報に基づくエリア概略図/ })).toBeInTheDocument()
    expect(screen.getByText('1階席')).toBeInTheDocument()
  })

  it('official-structureはエリア概略図だけを表示する', () => {
    const target = venue('yokohama-arena-fixed-a-subset')
    const layout = target.layouts[0]
    const seat = generateVenueSeats(target, layout)[0]
    render(<SeatMap venue={target} layout={layout} highlightedSeat={seat} />)
    expect(screen.getByText(/エリア単位の独自概略図/)).toBeInTheDocument()
    expect(screen.getByText('アリーナ席 Aブロック')).toBeInTheDocument()
  })

  it('official-rangeは座席グリッドを表示し、抽選席を強調する', () => {
    const target = venue('kyocera-dome-osaka-stand-subset')
    const layout = target.layouts[0]
    const seat = generateVenueSeats(target, layout)[0]
    const { container } = render(<SeatMap venue={target} layout={layout} highlightedSeat={seat} />)
    expect(container.querySelector('[data-presentation="seat-grid"]')).toBeInTheDocument()
    expect(container.querySelector('.mini-seat.selected')).toHaveTextContent(String(seat.number))
    expect(screen.getByText(/実際の位置関係や縮尺を表すものではありません/)).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/STAGE|ステージ|東スタンド|西スタンド/)
  })

  it('summary-onlyは不確かな図を表示しない', () => {
    const base = venue('tokyo-international-forum-hall-c')
    const target: Venue = { ...base, seatMapPresentation: 'summary-only' }
    const { container } = render(<SeatMap venue={target} layout={target.layouts[0]} />)
    expect(screen.getByText('座席図は表示していません')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    expect(container.querySelector('.seat-grid')).not.toBeInTheDocument()
  })
})
