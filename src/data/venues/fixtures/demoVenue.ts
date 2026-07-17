import type { Venue } from '../../../types/venue'

export const demoVenue: Venue = {
  id: 'demo-seat-fixture',
  name: 'テスト用デモ会場',
  region: '関東',
  seatDataAccuracy: 'demo',
  seatMapPresentation: 'summary-only',
  seatDataScope: 'テスト用データ',
  notice: 'テスト専用の架空データです。',
  sources: [],
  layouts: [
    {
      id: 'demo-layout',
      name: 'デモ',
      sections: [
        {
          id: 'demo-area',
          label: 'デモエリア',
          variability: 'fixed',
          includedInVenueLottery: true,
          rows: [{ label: 'A', seatRanges: [{ from: 1, to: 2 }] }],
        },
      ],
    },
  ],
}
