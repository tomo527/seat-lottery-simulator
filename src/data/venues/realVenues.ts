import type { Venue, VenueRow, VenueSeatRange } from '../../types/venue.js'
import {
  KYOCERA_BASEBALL_EXPECTED_SEAT_COUNT,
  KYOCERA_BASEBALL_SOURCE_SHA256,
  kyoceraBaseballCompactSections,
} from './generated/kyoceraBaseballSeats.js'

const parseRanges = (value: string): VenueSeatRange[] => value.split(',').map((part) => {
  const [from, to = from] = part.split('-').map(Number)
  return { from, to }
})

const kyoceraSections = kyoceraBaseballCompactSections.map((section) => ({
  id: section.id,
  label: section.label,
  variability: 'venue-pattern' as const,
  includedInVenueLottery: true,
  rows: Object.entries(section.rows).map(([label, compactRanges]) => ({
    label,
    seatRanges: parseRanges(compactRanges),
  })),
}))

const bunrakuCentralRows: VenueRow[] = [
  { label: '1', seatRanges: [{ from: 3, to: 34 }] },
  { label: '2', seatRanges: [{ from: 2, to: 23 }, { from: 25, to: 35 }] },
  { label: '3', seatRanges: [{ from: 1, to: 36 }] },
  { label: '4', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '5', seatRanges: [{ from: 1, to: 36 }] },
  { label: '6', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '7', seatRanges: [{ from: 1, to: 36 }] },
  { label: '8', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '9', seatRanges: [{ from: 2, to: 35 }] },
  { label: '10', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '11', seatRanges: [{ from: 1, to: 36 }] },
  { label: '12', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '13', seatRanges: [{ from: 1, to: 36 }] },
  { label: '14', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '15', seatRanges: [{ from: 1, to: 36 }] },
  { label: '16', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '17', seatRanges: [{ from: 1, to: 36 }] },
  { label: '18', seatRanges: [{ from: 1, to: 23 }, { from: 25, to: 36 }] },
  { label: '19', seatRanges: [{ from: 3, to: 34 }] },
]

const bunrakuLeftRows = (): VenueRow[] => Array.from({ length: 12 }, (_, index) => ({
  label: String(index + 1),
  seatRanges: [{ from: index === 0 ? 3 : index === 1 ? 2 : 1, to: 4 }],
}))

const bunrakuRightRows = (): VenueRow[] => Array.from({ length: 12 }, (_, index) => ({
  label: String(index + 1),
  seatRanges: [{ from: 1, to: index === 0 ? 2 : index === 1 ? 3 : 4 }],
}))

export const realVenues: Venue[] = [
  {
    id: 'national-bunraku-theatre-standard',
    name: '国立文楽劇場',
    region: '近畿',
    prefecture: '大阪府',
    city: '大阪市中央区',
    seatDataAccuracy: 'official-exact',
    representativePattern: {
      id: 'standard-all-seats',
      name: '文楽劇場 全席（標準）',
      coverage: 'complete',
      expectedSeatCount: 753,
      selectionReason: '会場公式が「全席 753席」として公開する、花道・出語り床を設置しない標準座席表を採用。',
      notIncludedPatterns: ['花道設置時 677席', '出語り床設置時 731席', '小ホール 159席'],
    },
    sources: [
      {
        kind: 'venue-official',
        publisher: '独立行政法人 日本芸術文化振興会',
        title: '国立文楽劇場施設の概要',
        url: 'https://www.ntj.jac.go.jp/bunraku/facilities/outline/',
        checkedAt: '2026-07-17',
      },
      {
        kind: 'venue-official',
        publisher: '独立行政法人 日本芸術文化振興会',
        title: '文楽劇場 座席表',
        url: 'https://www.ntj.jac.go.jp/bunraku/facilities/seats1/',
        checkedAt: '2026-07-17',
      },
      {
        kind: 'venue-official',
        publisher: '独立行政法人 日本芸術文化振興会',
        title: '文楽劇場 詳細座席図（PDF）',
        url: 'https://www.ntj.jac.go.jp/assets/files/bunraku/zaseki/zaseki_bunraku_1.pdf',
        checkedAt: '2026-07-17',
      },
    ],
    internalNotes: [
      '中央座席663席、左側座席45席、右側座席45席の合計753席。',
      '車椅子用スペースは座席番号を持つ客席として図示されていないため、753席の番号集合には含めない。',
    ],
    layouts: [
      {
        id: 'standard-all-seats',
        name: '文楽劇場 全席（標準）',
        sections: [
          { id: 'center-seats', label: '中央座席', variability: 'fixed', includedInVenueLottery: true, rows: bunrakuCentralRows },
          { id: 'left-seats', label: '左側座席', variability: 'fixed', includedInVenueLottery: true, rows: bunrakuLeftRows() },
          { id: 'right-seats', label: '右側座席', variability: 'fixed', includedInVenueLottery: true, rows: bunrakuRightRows() },
        ],
      },
    ],
  },
  {
    id: 'kyocera-dome-osaka-standard-baseball',
    name: '京セラドーム大阪',
    region: '近畿',
    prefecture: '大阪府',
    city: '大阪市西区',
    seatDataAccuracy: 'official-exact',
    representativePattern: {
      id: 'standard-baseball-stand-seats',
      name: '通常野球開催時 スタンド席',
      coverage: 'complete',
      expectedSeatCount: KYOCERA_BASEBALL_EXPECTED_SEAT_COUNT,
      selectionReason: '会場公式が「一般的な野球開催時」として提供する座席検索データに列挙されたスタンド席全席を採用。',
      notIncludedPatterns: ['コンサート時の可動アリーナ席', 'イベントごとに変更される座席配置'],
    },
    sources: [
      {
        kind: 'venue-official',
        publisher: '株式会社大阪シティドーム',
        title: '京セラドーム大阪 座席検索',
        url: 'https://www.kyoceradome-osaka.jp/seat/index.php',
        checkedAt: '2026-07-17',
      },
      {
        kind: 'venue-official',
        publisher: '株式会社大阪シティドーム',
        title: '京セラドーム大阪 公式座席検索データ',
        url: 'https://www.kyoceradome-osaka.jp/app/_src/data.json',
        checkedAt: '2026-07-17',
      },
    ],
    internalNotes: [
      `公式JSONを連続範囲へ変換。取得時SHA-256: ${KYOCERA_BASEBALL_SOURCE_SHA256}`,
      '中央A〜L、1塁側・3塁側の下段、上段、FA・FBブロックを含む20区分・34,522席。',
    ],
    layouts: [
      {
        id: 'standard-baseball-stand-seats',
        name: '通常野球開催時 スタンド席',
        sections: kyoceraSections,
      },
    ],
  },
]
