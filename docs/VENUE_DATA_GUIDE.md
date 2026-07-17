# 会場座席データ追加ガイド

会場データは`src/data/venues/`へ置き、UIへ直接記述しません。型の正本は`src/types/venue.ts`、production一覧は`src/data/venues/index.ts`です。座席表画像ではなく、公式資料で確認できた事実だけを手作業で構造化します。

## 調査と情報源の優先順位

1. 会場公式サイト
2. 会場公式PDF
3. 施設管理者・主催者が公開した公式資料
4. 公演公式が公開したイベント固有座席表

一般ユーザー作成の座席表、まとめサイト、SNS投稿、画像検索結果だけを根拠にしません。公式資料で読めない範囲は登録せず、収容人数から座席番号を補完しません。公式画像を保存・転載・背景表示・トレースせず、確認できた区分名、列、番号、位置関係をデータとして入力し、本サイト独自のSVGまたはCSSで描画します。

## 型の階層

```text
Venue
├─ seatDataAccuracy
├─ seatMapPresentation
├─ sources[]
└─ layouts: VenueLayout[]
   └─ sections: VenueSeatArea[]
      ├─ variability
      ├─ includedInVenueLottery
      ├─ map?（確認済みの位置関係だけ）
      └─ rows: VenueRow[]
         ├─ seatRanges: { from, to }[]
         └─ excludedSeats?: number[]
```

### 座席情報の信頼度

- `official-exact`: 公式資料から区分、列、番号、配置関係を確認できる。独自の簡易エリア図と抽選位置を表示できる
- `official-structure`: 公式資料からエリアやブロックの位置関係を確認できる。エリア単位の概略図だけを表示する
- `official-range`: 公式資料から列・番号範囲を確認できるが、配置は確認できない。長方形グリッドだけを表示する
- `demo`: テスト専用の架空データ。production一覧へ含めない

`official-*`は将来も常に正しいという意味ではありません。改修や公演差異を`notice`へ明記します。実在会場には最低1件の`VenueSeatDataSource`が必須です。

### 描画方法

- `verified-section-map`: `official-exact`または`official-structure`で、位置関係まで根拠がある場合だけ使う。確認できないステージや形状を追加しない
- `seat-grid`: `official-range`で使う。列・番号の抽選用グリッドであり、実際の位置・向き・縮尺を表さない
- `summary-only`: 配置も列範囲も十分に確認できない、または安全な描画が難しい場合に使う。図を出さず結果テキストだけを表示する

`official-range`へ`map`座標を設定するとデータ検証が失敗します。`map`は`viewBox="0 0 100 76"`内の独自概略図用の矩形です。公式画像の輪郭をなぞらず、確認済みエリア間の関係が伝わる最小限の長方形で表現します。

## 固定席と公演で変わる席

- `fixed`: 常設固定席。公式資料で確認できた範囲を通常抽選へ含められる
- `venue-pattern`: 会場公式が公開した標準パターン。使用パターンが公式に決まっている場合だけ、そのレイアウトで抽選できる
- `event-specific`: 公演ごとに異なるアリーナ、センター、フロア、花道周辺、仮設席。イベント固有の公式資料がない会場共通抽選には含めない

`event-specific`には必ず`includedInVenueLottery: false`と`exclusionReason`を設定します。会場公式に実在が確認できても、その公演の配置が不明なら固定席として割り当てません。誤って抽選対象にすると検証が失敗します。

## 座席範囲・欠番・除外席

```ts
{
  label: 'C',
  seatRanges: [{ from: 1, to: 12 }, { from: 15, to: 30 }],
  excludedSeats: [4, 20],
}
```

13・14番は欠番、4・20番は除外席となり、いずれも抽選されません。`from`と`to`は安全な正整数かつ`from <= to`です。同じ列の範囲を重複させません。

## 情報源と確認日

```ts
sources: [{
  kind: 'venue-official',
  publisher: '施設運営者名',
  title: '公式ページまたはPDFの名称',
  url: 'https://example.com/official-seat-page',
  checkedAt: '2026-07-17',
}]
```

`kind`は`venue-official`、`facility-manager`、`organizer-official`、`event-official`のいずれかです。直接確認できるHTTPSの公式ページと、実在する日付を`YYYY-MM-DD`形式で保存します。会場ごとに`docs/venues/<venue-id>.md`を作り、登録・未登録範囲、変動部分、描画方法、既知の制約を記録します。

## 追加・レビュー手順

1. 公式資料を優先順位に沿って確認し、URLと確認日を記録する
2. 読めた区分・列・番号だけを下書きし、不明箇所を「推定」で埋めない
3. `variability`と抽選対象可否を区分する
4. 根拠に合わせて精度と描画方法を選ぶ。情報不足なら`summary-only`にする
5. `src/data/venues/realVenues.ts`へ追加し、production配列へdemoが混ざっていないことを確認する
6. 会場別根拠資料を`docs/venues/`へ追加する
7. `validateProductionVenues()`のテストで、重複、範囲、除外席、source、変動席を検証する。Vite設定も同じ検証を実行するため、不正データではdev/build/previewが開始しない
8. 公式資料とデータを別担当者が照合し、モバイルで注意書きと図の誤認可能性をレビューする

公演によって座席構成が違う場合は、共通データに混ぜません。公式標準パターンは個別`VenueLayout`、イベント固有資料は将来の公演単位データとして分離します。情報が足りなければ、精密そうに見える図を出さない判断を優先します。
