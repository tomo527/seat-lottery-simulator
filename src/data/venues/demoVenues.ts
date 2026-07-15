import type { Venue, VenueRow } from '../../types/venue'

const rows = (
  labels: string[],
  from: number,
  to: number,
  excludedByRow: Record<string, number[]> = {},
): VenueRow[] =>
  labels.map((label) => ({
    label,
    seatRanges: [{ from, to }],
    excludedSeats: excludedByRow[label],
  }))

export const demoVenues: Venue[] = [
  {
    id: 'demo-starlight-arena',
    name: '星見アリーナ',
    region: '関東',
    prefecture: '架空県',
    city: '星見市',
    description: '中央ステージと2層スタンドを想定した、完全架空のデモアリーナです。',
    approximateCapacity: 12000,
    accuracy: 'demo',
    notice: '動作確認用に作成した架空会場・架空座席です。実在の会場とは関係ありません。',
    layouts: [
      {
        id: 'center-stage',
        name: 'センターステージ（デモ）',
        stageLabel: 'CENTER STAGE',
        sections: [
          { id: 'arena-a', label: 'アリーナ A', map: { x: 34, y: 27, width: 32, height: 20, shape: 'rounded' }, rows: rows(['A', 'B', 'C', 'D', 'E'], 1, 30, { C: [13, 14] }) },
          { id: 'stand-west', label: '西スタンド', map: { x: 6, y: 19, width: 22, height: 42, shape: 'arc', rotation: -2 }, rows: rows(['1', '2', '3', '4', '5', '6'], 1, 36) },
          { id: 'stand-east', label: '東スタンド', map: { x: 72, y: 19, width: 22, height: 42, shape: 'arc', rotation: 2 }, rows: rows(['1', '2', '3', '4', '5', '6'], 1, 36) },
          { id: 'stand-south', label: '南スタンド', map: { x: 28, y: 54, width: 44, height: 15, shape: 'rounded' }, rows: rows(['1', '2', '3'], 1, 42) },
        ],
      },
      {
        id: 'end-stage',
        name: 'エンドステージ（デモ）',
        stageLabel: 'MAIN STAGE',
        sections: [
          { id: 'floor-a', label: 'フロア A', map: { x: 12, y: 31, width: 23, height: 30, shape: 'rectangle' }, rows: rows(['A', 'B', 'C', 'D'], 1, 28) },
          { id: 'floor-b', label: 'フロア B', map: { x: 39, y: 31, width: 23, height: 30, shape: 'rectangle' }, rows: rows(['A', 'B', 'C', 'D'], 1, 28) },
          { id: 'floor-c', label: 'フロア C', map: { x: 66, y: 31, width: 23, height: 30, shape: 'rectangle' }, rows: rows(['A', 'B', 'C', 'D'], 1, 28) },
        ],
      },
    ],
  },
  {
    id: 'demo-kirameki-hall',
    name: 'キラメキホール',
    region: '近畿',
    prefecture: '架空府',
    city: '光野市',
    description: '舞台との距離が近い扇形客席をイメージした、完全架空のデモホールです。',
    approximateCapacity: 1800,
    accuracy: 'demo',
    notice: '動作確認用に作成した架空会場・架空座席です。実在の会場とは関係ありません。',
    layouts: [
      {
        id: 'theater',
        name: '劇場レイアウト（デモ）',
        stageLabel: 'STAGE',
        sections: [
          { id: 'first-floor', label: '1階席', map: { x: 18, y: 27, width: 64, height: 25, shape: 'arc' }, rows: rows(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 1, 28, { A: [1, 28], H: [14] }) },
          { id: 'balcony', label: 'バルコニー', map: { x: 24, y: 57, width: 52, height: 12, shape: 'rounded' }, rows: rows(['1', '2', '3'], 1, 32) },
        ],
      },
    ],
  },
  {
    id: 'demo-ocean-dome',
    name: 'オーシャンドーム',
    region: '九州・沖縄',
    prefecture: '架空県',
    city: '潮風市',
    description: '波のように広がる3ブロックを持つ、完全架空のデモドームです。',
    approximateCapacity: 32000,
    accuracy: 'demo',
    notice: '動作確認用に作成した架空会場・架空座席です。実在の会場とは関係ありません。',
    layouts: [
      {
        id: 'wave-stage',
        name: 'ウェーブステージ（デモ）',
        stageLabel: 'WAVE STAGE',
        sections: [
          { id: 'blue', label: 'BLUE ブロック', map: { x: 7, y: 29, width: 26, height: 30, shape: 'arc', rotation: -5 }, rows: rows(['A', 'B', 'C', 'D', 'E', 'F'], 1, 40) },
          { id: 'aqua', label: 'AQUA ブロック', map: { x: 37, y: 27, width: 26, height: 34, shape: 'rounded' }, rows: rows(['A', 'B', 'C', 'D', 'E', 'F'], 1, 40, { D: [20, 21] }) },
          { id: 'coral', label: 'CORAL ブロック', map: { x: 67, y: 29, width: 26, height: 30, shape: 'arc', rotation: 5 }, rows: rows(['A', 'B', 'C', 'D', 'E', 'F'], 1, 40) },
        ],
      },
    ],
  },
  {
    id: 'demo-north-note-livehouse',
    name: 'ノースノート・ライブハウス',
    region: '北海道・東北',
    prefecture: '架空道',
    city: '音森市',
    description: '小規模ライブを想定した、完全架空のデモ会場です。',
    approximateCapacity: 620,
    accuracy: 'demo',
    notice: '動作確認用に作成した架空会場・架空座席です。実在の会場とは関係ありません。',
    layouts: [
      {
        id: 'seated',
        name: '着席レイアウト（デモ）',
        stageLabel: 'STAGE',
        sections: [
          { id: 'front', label: '前方席', map: { x: 15, y: 28, width: 70, height: 16, shape: 'rounded' }, rows: rows(['A', 'B', 'C'], 1, 24) },
          { id: 'rear', label: '後方席', map: { x: 10, y: 50, width: 80, height: 18, shape: 'rounded' }, rows: rows(['D', 'E', 'F', 'G'], 1, 28) },
        ],
      },
    ],
  },
]
