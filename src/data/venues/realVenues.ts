import type { Venue, VenueRow } from '../../types/venue.js'

const rows = (from: number, to: number, seatsFrom: number, seatsTo: number): VenueRow[] =>
  Array.from({ length: to - from + 1 }, (_, index) => ({
    label: String(from + index),
    seatRanges: [{ from: seatsFrom, to: seatsTo }],
  }))

export const realVenues: Venue[] = [
  {
    id: 'tokyo-international-forum-hall-c',
    name: '東京国際フォーラム ホールC',
    region: '関東',
    prefecture: '東京都',
    city: '千代田区',
    description: '公式座席表で確認した固定席の一部を登録しています。',
    approximateCapacity: 1_502,
    seatDataAccuracy: 'official-exact',
    seatMapPresentation: 'verified-section-map',
    seatDataScope: '1階席の一部（1〜13列・17〜27/28番）',
    notice: '公式座席表から列・番号と1階席内の配置を確認した範囲のみを抽選対象にしています。全1,502席を網羅するデータではありません。',
    variabilityNotice: '車いす対応席は催事によって異なる場合があります。登録範囲外の席は抽選対象に含めていません。',
    sources: [
      {
        kind: 'venue-official',
        publisher: '株式会社東京国際フォーラム',
        title: 'ホールC 座席表',
        url: 'https://www.t-i-forum.co.jp/organizer/facilities/c/seat/',
        checkedAt: '2026-07-17',
      },
    ],
    layouts: [
      {
        id: 'fixed-seats-verified-subset',
        name: '固定席・確認済み範囲',
        sections: [
          {
            id: 'first-floor',
            label: '1階席',
            variability: 'fixed',
            includedInVenueLottery: true,
            map: { x: 18, y: 15, width: 64, height: 52 },
            rows: Array.from({ length: 13 }, (_, index) => {
              const row = index + 1
              return { label: String(row), seatRanges: [{ from: 17, to: row % 2 === 0 ? 27 : 28 }] }
            }),
          },
        ],
      },
    ],
  },
  {
    id: 'yokohama-arena-fixed-a-subset',
    name: '横浜アリーナ',
    region: '関東',
    prefecture: '神奈川県',
    city: '横浜市港北区',
    description: '公式座席案内で確認した固定席の構造と一部座席を登録しています。',
    seatDataAccuracy: 'official-structure',
    seatMapPresentation: 'verified-section-map',
    seatDataScope: '固定アリーナ席Aブロックの一部（A1〜A2列・16〜58番）',
    notice: '公式資料で確認できた固定アリーナ席Aブロックの一部だけを抽選対象にしています。ほかの固定席は未登録です。',
    variabilityNotice: 'センター席はイベントにより配置が変わるため、会場共通の抽選対象に含めていません。',
    sources: [
      {
        kind: 'venue-official',
        publisher: '株式会社横浜アリーナ',
        title: '座席案内',
        url: 'https://www.yokohama-arena.co.jp/seatguide/index.html',
        checkedAt: '2026-07-17',
      },
      {
        kind: 'venue-official',
        publisher: '株式会社横浜アリーナ',
        title: 'Aパターン座席案内',
        url: 'https://www.yokohama-arena.co.jp/seatguide/astage.html',
        checkedAt: '2026-07-17',
      },
    ],
    layouts: [
      {
        id: 'fixed-seats-verified-subset',
        name: '固定席・確認済み範囲',
        sections: [
          {
            id: 'arena-a',
            label: 'アリーナ席 Aブロック',
            variability: 'fixed',
            includedInVenueLottery: true,
            map: { x: 23, y: 50, width: 54, height: 20 },
            rows: [
              { label: 'A1', seatRanges: [{ from: 16, to: 58 }] },
              { label: 'A2', seatRanges: [{ from: 16, to: 58 }] },
            ],
          },
          {
            id: 'center-seats',
            label: 'センター席',
            variability: 'event-specific',
            includedInVenueLottery: false,
            exclusionReason: 'イベントにより配置が変わるため',
            map: { x: 30, y: 18, width: 40, height: 22 },
            rows: [],
          },
        ],
      },
    ],
  },
  {
    id: 'kyocera-dome-osaka-stand-subset',
    name: '京セラドーム大阪（通常野球開催時）',
    region: '近畿',
    prefecture: '大阪府',
    city: '大阪市西区',
    description: '公式座席検索が示す通常野球開催時パターンの一部を登録しています。',
    seatDataAccuracy: 'official-range',
    seatMapPresentation: 'seat-grid',
    seatDataScope: '通常野球開催時パターン・1塁側下段の一部（1〜3列・101〜109番）',
    notice: '公式座席検索が案内する通常野球開催時の列・番号だけを抽選用グリッドとして登録しています。実際の位置関係や縮尺は表しません。',
    variabilityNotice: 'コンサート等では一部の座席位置やアリーナ席が変わるため、この標準パターン以外はシミュレーションに含めていません。',
    sources: [
      {
        kind: 'venue-official',
        publisher: '株式会社大阪シティドーム',
        title: '京セラドーム大阪 座席検索',
        url: 'https://www.kyoceradome-osaka.jp/seat/',
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
    layouts: [
      {
        id: 'fixed-stand-verified-subset',
        name: '固定スタンド席・確認済み範囲',
        sections: [
          {
            id: 'first-base-lower',
            label: '1塁側・下段',
            variability: 'venue-pattern',
            includedInVenueLottery: true,
            rows: rows(1, 3, 101, 109),
          },
          {
            id: 'concert-arena',
            label: 'コンサート時のアリーナ席',
            variability: 'event-specific',
            includedInVenueLottery: false,
            exclusionReason: 'コンサートごとに配置が変わる可動席のため',
            rows: [],
          },
        ],
      },
    ],
  },
]
