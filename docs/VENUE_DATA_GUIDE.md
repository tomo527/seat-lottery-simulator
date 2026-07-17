# 会場座席データ追加ガイド

会場データは`src/data/venues/`へ置き、UIへ直接記述しません。productionへ追加できるのは、採用した代表パターンの全席を公式資料から構造化できる会場だけです。調査メタデータは開発者向けに保持し、通常のユーザー画面へは情報源、精度、確認日、除外理由を表示しません。

## 情報源の優先順位

1. 会場公式サイト
2. 会場公式PDF
3. 施設管理者・主催者の公式資料
4. 公演公式のイベント固有資料

一般ユーザー作成の座席表、まとめサイト、SNS投稿、画像検索結果だけを根拠にしません。読み取れない番号を収容人数から補完しません。公式画像はリポジトリへ保存・転載・背景表示・トレースせず、確認できた区分、列、番号だけを構造化します。

## 代表パターン

1会場につき`representativePattern`を1件だけ決め、同じIDの`VenueLayout`を1件登録します。

```ts
representativePattern: {
  id: 'standard-all-seats',
  name: '標準客席 全席',
  coverage: 'complete',
  expectedSeatCount: 753,
  selectionReason: '公式資料が標準として示す全席構成',
  notIncludedPatterns: ['別構成'],
}
```

優先順位は、公式の標準・基本・通常構成、一般的な利用に近い公式パターン、公式収容数と利用範囲、完全に構造化できるパターンの順です。異なるパターンを混在させません。全席を確実に登録できない場合は、部分範囲を公開せずproduction一覧へ追加しません。

## 型と座席範囲

- `Venue`: 会場、所在地、内部の精度・情報源・代表パターン
- `VenueLayout`: 採用した代表パターン（productionでは1件）
- `VenueSeatArea`: 公式に存在するエリアまたはブロック
- `VenueRow`: 列と座席番号範囲
- `excludedSeats`: 公式資料で確認できる欠番・除外席

```ts
{
  label: 'C',
  seatRanges: [{ from: 1, to: 12 }, { from: 15, to: 30 }],
  excludedSeats: [4, 20],
}
```

`from`と`to`は正の安全な整数かつ`from <= to`です。同じエリア・列で範囲を重複させません。公式に名称がないエリアを生成しません。

## fixed / venue-pattern / event-specific

- `fixed`: 常設固定席
- `venue-pattern`: 会場公式が公開する標準パターンの座席。採用パターンが明確な場合に全席を含める
- `event-specific`: 公演ごとに異なる仮設席。会場共通productionパターンへ混在させない

productionの代表レイアウト内は全エリアを抽選対象にします。event-specificや抽選対象外エリアを代表レイアウトへ入れると検証が失敗します。

## 情報源と確認日

実在会場には1件以上のHTTPS公式情報源が必要です。

```ts
sources: [{
  kind: 'venue-official',
  publisher: '施設運営者名',
  title: '公式ページまたはPDF名',
  url: 'https://example.com/official-seat-page',
  checkedAt: '2026-07-17',
}]
```

URLと確認日は内部メタデータおよび`docs/venues/<venue-id>.md`に残しますが、ユーザー向けDOMへ出力しません。

## 追加・レビュー手順

1. 公式資料を優先順位どおり調査する
2. 代表パターンを1つ決定し、採用理由と別パターンを記録する
3. 代表パターンの全区分・全列・全番号を構造化する
4. 欠番と重複を資料と照合する
5. `expectedSeatCount`を資料または公式データの全件数から記録する
6. `docs/venues/`へ情報源、確認日、全範囲、総数、完全性の根拠、制約を書く
7. `validateProductionVenues()`とテストを実行する
8. 別担当レビューで、先頭・中間・末尾、総数、重複、別パターン混在がないことを確認する

検証は、productionのdemo混入、部分データを示すID・名称、情報源欠落、複数レイアウト、総数不一致、重複ID・列・座席範囲、不正範囲、範囲外除外席、event-specific混入を拒否します。Vite起動・build時にも同じ検証を実行します。

京セラドーム大阪の公式JSONは`node scripts/import-kyocera-seat-data.mjs`で決定論的に変換し、取得元SHA-256と総数を生成ファイルへ記録します。生成後は必ず差分と検証結果をレビューしてください。
