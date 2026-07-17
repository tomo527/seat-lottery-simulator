import type { Venue } from '../../../types/venue'

export const demoVenue: Venue = {
  id: 'demo-seat-fixture',
  name: 'テスト用デモ会場',
  region: '関東',
  seatDataAccuracy: 'demo',
  representativePattern: {
    id: 'demo-layout',
    name: 'デモ',
    coverage: 'complete',
    expectedSeatCount: 2,
    selectionReason: '自動テスト専用',
    notIncludedPatterns: [],
  },
  sources: [],
  internalNotes: ['production一覧へ含めないfixtureです。'],
  layouts: [{
    id: 'demo-layout',
    name: 'デモ',
    sections: [{
      id: 'demo-area',
      label: 'デモエリア',
      variability: 'fixed',
      includedInVenueLottery: true,
      rows: [{ label: 'A', seatRanges: [{ from: 1, to: 2 }] }],
    }],
  }],
}
