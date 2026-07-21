# 静的会場データベース運用ガイド

会場データは更新頻度が低いため、ランタイムDBではなく、調査sourceから軽量catalogと会場別JSONを決定論的に生成します。初期画面はcatalogだけを読み、座席範囲は会場選択時にlazy loadします。通常画面へ情報源、確認日、精度、調査注釈は表示しません。

## ディレクトリと責務

```text
data/venue-sources/<venue-id>.json       調査根拠、代表パターン、全range（bundle対象外）
src/data/venue-db/catalog.generated.json 検索用の軽量メタデータ
public/venue-db/venues/<venue-id>.json    runtime用の圧縮range
scripts/venues/                           build / check / validate / report
```

sourceは公式情報源、確認日、採用・不採用パターン、登録範囲、完全性の根拠、制約、変換方法を保持します。generatedは手編集しません。軽量catalogには`name`、会場名検索専用の`searchAliases`、`region`、`prefecture`、`municipality`、種別、席数、detailのパスを保存します。

## 検索用地域フィールド

会場検索は、会場名検索と「エリア→都道府県→市区町村」の3段階フィルターで構成します。会場名検索は`name`と、正式名称の別表記・略称として明示した`searchAliases`だけが対象です。所在地を会場名検索へ混ぜません。すべての文字列は前後空白を除去し、Unicode NFKCと大文字・小文字の正規化後に比較します。

sourceの`prefecture`と`city`は生成時にcatalogの`prefecture`と`municipality`へ変換され、`region`は`scripts/venues/regions.mjs`の全国共通マッピングから決定します。UIコンポーネント内へ地域対応表を重複定義しません。新しい会場を追加する際は、都道府県名を都道府県コード相当の正式表記で指定し、市区町村を空にせず、同じ会場内で正規化後に重複する別名を登録しないでください。

## 情報源と代表パターン

情報源は、会場公式サイト、会場公式PDF、施設管理者・主催者の公式資料、公演公式のイベント固有資料の順で優先します。一般ユーザーの座席表、まとめサイト、SNS、画像検索だけを根拠にしません。公式画像・PDFはリポジトリへ保存、転載、外部表示、トレースせず、確認できた事実だけを手作業で構造化します。

1会場につき代表パターンは1つです。公式の標準・基本・通常、固定席全体、一般的な利用に近い公式パターン、完全に列・番号を構造化できるパターンの順に選びます。異なるパターンを混在させず、一部だけしか確定できない会場はproductionへ入れません。

## sourceとrange形式

```json
{
  "schemaVersion": 1,
  "status": "production",
  "id": "example-hall-standard",
  "representativePattern": {
    "id": "standard",
    "name": "通常座席",
    "coverage": "complete",
    "expectedSeatCount": 300
  },
  "sources": [{ "publisher": "施設運営者", "title": "座席表", "url": "https://example.com/seat.pdf", "checkedAt": "2026-07-20" }],
  "ranges": [{ "areaId": "first-floor", "areaLabel": "1階", "rowLabel": "A", "from": 1, "to": 20, "excluded": [13] }]
}
```

連続番号は`from`〜`to`で圧縮します。同一列が分断される場合はrangeを分けます。`excluded`はrange内の公式な欠番だけに使います。`seatCount`はrangeから自動計算され、`expectedSeatCount`との一致を検証します。数万席をSeatオブジェクトとして保存・生成しません。

## 追加手順

1. 公式資料を調査し、完全に構造化できる代表パターンを決める。
2. `data/venue-sources/<venue-id>.json`へ調査情報と全rangeを追加する。
3. `npm run venues:build`でcatalogとdetailを生成する。
4. `npm run venues:check`でgeneratedがsourceと同期していることを確認する。
5. `npm run venues:validate`でID、所在地、range、重複、欠番、総数、source、完全性、東京件数、ファイルサイズを検証する。
6. `npm run venues:report`で会場数、地域別件数、range数、席数、全体・最大ファイルサイズを確認する。
7. 先頭・中間・末尾の決定論的抽選、検索、lazy load、E2Eを実行する。

`npm run build`はcheckとvalidateを必須ゲートとして実行します。catalogはID、名称、会場名検索用別名、エリア、都道府県、市区町村、種別、内部パターン名、席数、dataPathだけを含み、source URLや全rangeを含めません。生成順と別名順は決定論的で、`venues:check`がsourceとの同期を検証します。

## lazy loadingと抽選

`catalog.generated.json`はmain bundleに含まれますが、`public/venue-db/venues/*.json`は含まれません。選択した`dataPath`だけをfetchし、成功した会場はメモリキャッシュします。切替時はAbortControllerとrequest sequenceで古いresponseを無視します。

抽選はrangeごとの有効席数を累積し、`crypto.getRandomValues()`のrejection samplingで全席offsetを1つ選びます。累積配列を二分探索し、該当range内で`excluded`を飛ばしてSeatを1件だけ返すため、全席配列は生成しません。

## 規模拡張とD1移行

数百会場でも軽量catalog、20件ずつの表示、会場別fetchで運用できます。catalog 100KB、detail 1件300KB、今回規模の全detail 2MBを上限目安として検証します。

数百〜数千会場を超える、管理画面から頻繁に更新する、デプロイなしで更新する、複雑なサーバー検索が必要、イベント別パターンを動的管理する、のいずれかが必要になった段階でD1等を検討します。現段階では静的DBの方が単純で、配信・キャッシュ・保守の負担が小さい設計です。
