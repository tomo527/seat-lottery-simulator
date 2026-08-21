# 静的会場データベース運用ガイド

会場データは`data/venue-sources/<venue-id>.json`を調査・編集上のsource of truthとし、軽量catalogと会場別runtime JSONを決定論的に生成します。通常画面へ情報源、確認日、精度、調査注釈は表示しません。公式PDFや画像そのものも保存、転載、表示、トレースしません。

## ディレクトリとコマンドの責務

```text
data/venue-sources/<venue-id>.json       調査根拠、代表パターン、明示的な全range
src/data/venue-db/catalog.generated.json 検索用の軽量catalog（生成物）
public/venue-db/venues/<venue-id>.json    lazy loadするruntime range（生成物）
scripts/venues/                           authoring / build / check / validate / report
```

- `venues:new`: 基本検証を通るdraft雛形を新規作成する。既存ファイルは上書きしない。
- `venues:review`: 1会場または全会場の決定論的なレビュー要約とproduction blockerを表示する。
- `venues:build`: 全sourceを検証した後、productionだけからcatalogとdetailを生成する。
- `venues:check`: sourceから期待される生成物とバイト単位で比較する。手編集や生成漏れを検出する。
- `venues:validate`: 全statusの基本schema、production gate、runtime生成物、席数、漏えい、容量上限を検証する。
- `venues:report`: 会場数、地域・都道府県別件数、coverage目標との差分、range・席数・ファイル容量を表示する。

`npm run build`は引き続き`venues:check`と`venues:validate`を必須ゲートにします。生成物は手編集しません。

## status

`status`は必須で、次の3値だけを許可します。未知値や未指定はエラーです。

- `draft`: 調査、range入力、検証中。runtime生成対象外だが、ID、所在地、source、rangeなどの基本検証対象。未入力時は`expectedSeatCount: null`、`ranges: []`で表現する。
- `production`: 宣言した代表scopeの実在番号集合を公開根拠から完全転記し、捏造防止・source・range・runtime gateを通過したデータ。全variant、独立2 generation、厳密総数一致、wheelchair完全解決は必須ではない。
- `rejected`: 閉館、対象外、または信頼できる公開情報から実在番号集合を作れないため見送ったデータ。`rejectionReason`を必須とし、0席・`ranges: []`を許可してruntime生成対象外とする。

schema v1では`draft`や`rejected`をproductionと同じファイルに混在させず、1ファイルを1会場・1代表パターンとして扱います。schema v2ではtop-level `status`を会場調査状態、`configurations[].status/selectable`をconfigurationごとの公開可否として分離します。完全なconfigurationと不完全な公式variantは同居できますが、不完全variantは`draft`かつ`selectable: false`でなければなりません。

## source schema

```json
{
  "schemaVersion": 1,
  "status": "production",
  "id": "example-hall-standard",
  "name": "Example Hall",
  "prefecture": "東京都",
  "city": "渋谷区",
  "aliases": ["Exampleホール"],
  "venueType": "hall",
  "representativePattern": {
    "id": "standard",
    "name": "通常座席",
    "coverage": "complete",
    "expectedSeatCount": 300,
    "selectionReason": "公式の標準座席表を採用。",
    "notIncludedPatterns": []
  },
  "sources": [
    {
      "id": "official-seat-map",
      "official": true,
      "roles": ["seat-structure", "seat-count"],
      "publisher": "施設運営者",
      "title": "座席表",
      "url": "https://example.com/seat.pdf",
      "checkedAt": "2026-07-24"
    }
  ],
  "registeredScope": "代表パターンの座席表に番号がある全席。",
  "completenessBasis": "公式座席表の全番号と公式総席数を照合。",
  "transformation": "同一列の連続番号をrangeへ圧縮。",
  "knownLimitations": [],
  "verification": {
    "status": "verified",
    "checkedAt": "2026-07-24",
    "method": "independent-official-source-review",
    "seatStructure": "matched",
    "seatCount": "matched",
    "unresolvedIssues": []
  },
  "ranges": [
    {
      "areaId": "first-floor",
      "areaLabel": "1階",
      "rowLabel": "A",
      "from": 1,
      "to": 20,
      "excluded": [13]
    }
  ]
}
```

schema v1は既存sourceと生成物の互換契約として維持します。build/runtime内部では1 configurationへ正規化しますが、既存source JSON、catalog、runtime detail、fingerprintへv2 fieldを追加しません。

## schema v2: representative configurations

1会場に複数の明確な代表配置がある場合、固定standだけを登録する場合、または代表実公演layoutを明示する場合にschema v2を使います。最初から全variantを揃える必要はなく、まず1つの有用なconfigurationをproduction化できます。概形は次のとおりです。

```json
{
  "schemaVersion": 2,
  "status": "production",
  "id": "example-theatre",
  "name": "Example Theatre",
  "prefecture": "東京都",
  "city": "中央区",
  "aliases": [],
  "venueType": "theater",
  "sources": [],
  "configurations": [
    {
      "id": "with-pit",
      "canonicalName": "オーケストラピット使用時",
      "issuerDefinedCondition": "施設運営者がピット使用時として公開した座席図を使用する場合。",
      "definitionAuthority": "issuer",
      "sourceGeneration": "2026-08 current official seat map",
      "sourceIds": ["official-seat-map", "official-seat-count"],
      "differenceBasisSourceIds": ["official-seat-map"],
      "status": "production",
      "selectable": true,
      "numberedSeatSetComplete": true,
      "capacityFitting": false,
      "repositoryInventedDifferences": false,
      "expectedSeatCount": 300,
      "scope": {
        "kind": "official-variant",
        "issuerDefined": true,
        "containsEventDependentSeatIds": false
      },
      "scopeDisclosure": "公式のオーケストラピット使用時配置です。",
      "wheelchairSemantics": {
        "status": "resolved",
        "description": "公式資料記載の置換関係を反映。",
        "sourceIds": ["official-seat-map"]
      },
      "verification": {
        "status": "verified",
        "checkedAt": "2026-08-12",
        "method": "independent-official-source-review",
        "seatStructure": "matched",
        "seatCount": "matched",
        "rangeDiff": 0,
        "unresolvedIssues": []
      },
      "ranges": [
        { "areaId": "main", "areaLabel": "客席", "rowLabel": "通し番号", "from": 1, "to": 300 }
      ]
    }
  ]
}
```

top-level `status: production`は、少なくとも1件の`production`かつ`selectable: true`のconfigurationがあることを意味します。会場に未完了variantが存在すること自体は、別の完全なconfigurationを妨げません。反対に、top-levelが`draft`または`rejected`ならselectable production configurationを持てません。

各selectable production configurationは、宣言したscopeに対する完全な番号集合、source generation、参照source、1席以上の機械検証、`capacityFitting: false`、`repositoryInventedDifferences: false`を満たします。`definitionAuthority`は`issuer`、`official-event`、`representative-evidence`のいずれかで、issuerがdefaultと明記していなくても`selectionBasis`に採用理由を残せます。`confidence`は`verified`、`representative`、`approximate`です。既存productionは後方互換のため、厳密verificationから`verified`を推定します。

`expectedSeatCount`は文章上の公式総数として保持でき、番号図から計算したmapped countとの差はwarningとquality metadataに残します。差を消すために番号を削除してはいけません。`verification.status`は`reviewed`または`verified`、`seatStructure: matched`をproductionに要求しますが、`seatCount: mismatched`、非0/`null`の`rangeDiff`、具体的な`unresolvedIssues`はblockerではありません。

車いす転換番号が不明なら通常番号席をそのまま登録し、`wheelchairSemantics.status: not-reflected`と`accessibilityConversionNotReflected: true`を記録します。実公演で使われた仮設番号を採用する場合は`representativeEventLayout: true`、`scope.kind: representative-event`、公式`event-layout` source、共通またはconfiguration disclosureを必須にします。repositoryによるseat ID創作、capacity fitting、根拠のないconfiguration差分は引き続き禁止です。

### fixed-only configuration

`scope.kind: fixed-only`は、公開された固定stand番号図を宣言scopeの全番号として転記できる場合に許可します。`canonicalName`は「固定スタンド席・代表配置」等の限定を明示し、`scope`には`excludesDynamicAreas: true`、`maximumCapacity: false`、非空の`excludedAreas`、mapped countと同じ`exactSubtotal`を記録します。`scopeDisclosure`には固定席のみでarena/floor等を含まないことを明示します。公称固定席subtotalとの差はmetadataに残し、番号を削って合わせません。

v2 catalogは会場を`venueGroupId`で1件にまとめ、configurationごとに`(venueId, configurationId)`と個別`dataPath`を持ちます。configurationが1件なら従来同様に直接利用し、複数なら会場選択後に明示選択します。fixed-only disclosureはconfiguration選択時と抽選結果の両方に表示します。

`sources[].id`は会場内で安定かつ一意なslugにします。`official`は公式資料かを明示します。`roles`は`seat-structure`、`seat-count`、`facility`、`event-layout`から選びます。productionにはseat-structure sourceと、施設・構造・席数・実公演layoutのいずれかを支える公式sourceが必要です。公式資料だけで番号が不足する場合は、信頼できるsecondaryを`official: false`かつ`seat-structure`として参照し、公式資料との非矛盾確認と採用理由をmetadataに残せます。SNS単独・出所不明画像は不可です。

連続番号は`from`から`to`へ圧縮し、公式な欠番だけを`excluded`へ昇順で記録します。同一列が分断される場合はrangeを分けます。推測による補完はしません。`areaId`を指定するproduction rangeには、結果表示に使える一意の`areaLabel`も必須です。

areaのcanonical keyはruntime、validation、review、生成処理のすべてで`range.areaId ?? "main"`です。単一メインエリアでラベル表示が不要なら`areaId`と`areaLabel`を両方省略します。areaを表示するときだけ両方を明示します。省略形式と明示的な`areaId: "main"`は同じruntime areaへ統合されるため、同一会場内で混在させるとエラーです。

## 基本検証とproduction gate

全statusで、ファイル名とID、schema version、slug、名称・所在地、都道府県マッピング、venue type、別名正規化、会場間検索語衝突、source ID・role・HTTPS・確認日、range正整数、excluded、区間重複、area対応を検証します。schema v1は`representativePattern`とtop-level verification、schema v2は各configurationのselection basis、scope、source参照、wheelchair metadata、confidence、verificationを検証します。draft/rejected configurationは空rangeと未確定席数`null`を許可し、production/selectable configurationは1席以上の有効mapped setを必須とします。重複確認はcanonical area・NFKC rowごとに行い、全席`Seat[]`へ展開しません。

productionのhard gateは、宣言scopeの完全な番号range、登録範囲・根拠・変換方法・制約、seat-structure source、公式supporting source、source参照、reviewed/verifiedかつmatchedなstructure、capacity fitting禁止、repository-invented IDs/differences禁止です。公式総数との一致、独立2 generation、`rangeDiff: 0`、wheelchair/companion完全置換、全variant、空の`unresolvedIssues`はconfidence情報でありhard gateではありません。`TODO`、`TBD`、`未設定`、`placeholder`や`demo`/`sample`/`partial`の不完全productionは引き続き拒否します。

文字列の前後空白は保存時エラーです。`rowLabel`、`areaId`、`areaLabel`はNFKC比較も行い、NFKC後に同じrow/areaになる別表記の重複を拒否します。`venues:new`のCLI引数は暗黙にtrimせず、前後空白を明確なエラーとして拒否します。

エラーは生成やproduction化を止めます。警告は止めませんがレビュー対象です。現在の警告は、確認日から365日超のsourceと、1行が25 range超へ細分化されたデータです。閾値は`scripts/venues/constants.mjs`にあります。catalog 100KB未満、detail 1件300KB未満、DB全体2MB未満の上限も同じファイルへ集約しています。

東京都10会場は品質条件ではありません。`venues:report`のcoverage目標としてだけ表示し、`venues:validate`の成否へ影響しません。

## 新規draftの作成

```bash
npm run venues:new -- \
  --id example-hall-standard \
  --name "Example Hall" \
  --prefecture 東京都 \
  --city 渋谷区 \
  --type hall
```

PowerShellでは1行で実行するか、バッククォートで改行します。typeは`theater`、`hall`、`arena`、`stadium`、`dome`のいずれかです。

雛形は`representativePattern.id/name`を空文字、`coverage: "draft"`、`expectedSeatCount: null`、`ranges: []`として作成します。架空席やplaceholder seatは生成しません。空sourceと未完了verificationも含むため、statusだけをproductionへ変更してもproduction gateは通りません。

主なエラー例:

```text
Invalid --id: use lowercase letters, digits, and hyphens.
Invalid --type: expected one of theater, hall, arena, stadium, dome.
Unknown --prefecture: 不明県
Refusing to overwrite existing source: .../example-hall-standard.json
```

## 1会場レビュー

```bash
npm run venues:review -- --id hakuju-hall-standard
npm run venues:review -- --all
```

出力はID、status、名称、所在地、type、alias、代表パターン、coverage、公式sourceとrole・確認日、verification、期待席数と計算席数、area別席数・row数、range・excluded数、先頭・中央・末尾offsetの座席、不連続range、小さな欠番候補、areaLabel不足、validation error、warning、production blockerを含みます。座席全一覧は生成しません。出力順とsample offsetは決定論的です。編集中にnull range、欠落from/to、不正excluded、壊れた代表パターン等があっても、validなrangeだけを集計し、集計不能箇所を明示してレビュー結果を返します。JSON構文エラーとファイル不存在だけは明確な非ゼロ終了です。

小さなgapはあくまで人間が確認する候補です。自動補完しません。規則的な入力のために一時的なCSV/TSV変換を行う場合も、最終source JSONには明示rangeだけを残し、previewで重複、欠番、総数を確認してください。OCRだけで確定せず、公式資料にない列や番号を生成しません。

## 会場追加workflowと二段階レビュー

会場・バッチの選定、難度routing、第1パス、独立レビュー、統合、検証、HANDOFFの順序は[`VENUE_WORKFLOW.md`](VENUE_WORKFLOW.md)だけをcanonical workflowとします。このガイドはschema、evidence、production gate、range/inventory/batchのデータ契約を定義し、agent別の手順書は持ちません。

第1パスと独立レビューの入力テンプレートは次を再利用します。テンプレートは作業開始用であり、ルールの正本ではありません。

- [第1パス: 会場追加draft作成](prompts/VENUE_ADD_DRAFT.md)
- [第2パス: 独立レビュー](prompts/VENUE_INDEPENDENT_REVIEW.md)

独立generation不足はconfidenceを`representative`へ下げる理由であり、宣言scopeの実在番号集合が確認できていればproduction blockerではありません。

`checkedAt`とverification日付は日本の調査暦日として扱い、通常検証のtodayはOS・CI timezoneに依存しない`Asia/Tokyo`基準です。テストでは`options.today`を注入できます。

全production会場のfingerprintは`data/venue-fingerprints/production.json`へ集約します。ID、名称、所在地、aliases、type、代表パターン、期待・計算席数、全range、source metadata、verification method、先頭・中央・末尾offsetを固定し、catalogのproduction ID集合とmanifestのID集合が完全一致することをテストします。fingerprintはbuild時に自動更新しません。値が変わった場合はsnapshot値だけを更新せず、公式資料から独立再確認してからreview対象manifestを更新します。

## runtimeと抽選

catalogだけをmain bundleへ含め、選択した`dataPath`だけをlazy loadします。runtime JSONへsource、確認日、verification、調査注釈は含めません。抽選はrangeの累積席数からoffsetを1つ選び、二分探索後に該当rangeの1席だけを解決します。数万席でも全席配列を保存・生成しません。ランタイムDBやD1への移行は行いません。

## 都道府県inventory

`data/venue-inventory/<jurisdiction>.json`は、production sourceとは別に候補、調査状態、適格性を追跡する台帳です。東京都inventoryの発見元は、東京都生活文化局の最新「都内ホール・劇場等リスト」です。公式Excelは一時取得して正規化とchecksum確認にだけ使い、リポジトリへ保存しません。座席rangeの根拠には、各会場の公式座席表と公式席数資料を別途使用します。

未回答、URL欠落、現役状態未確認の公式リスト行も削除せず、`operationalStatus: "unknown"`、`eligibility: "needs-research"`、`researchStatus: "not-started"`などで残します。これにより未調査候補をcoverageの分母から隠しません。施設内の独立したホールは個別候補とし、旧名称、ネーミングライツ名称、施設名だけの重複はduplicate reportで人間が確認します。

```bash
npm run venues:inventory:report
```

reportは総件数、active、eligibility、research status、assessment coverage、eligible production coverage、区市町村、venue type、席数帯、operational status、priority別未着手、duplicate候補、sourceとの不整合を決定論的に表示します。

```text
assessment coverage
= eligibility判定済み件数 / inventory総件数

eligible production coverage
= productionになったeligible会場数 / eligibleと確定した会場数
```

`eligible production coverage`だけを上げるために未調査候補を除外してはいけません。production inventoryはactiveかつeligibleで、同じIDのsourceもproductionである必要があります。production sourceが対象都道府県inventoryに存在しない場合もエラーです。

### release coverageの3指標

主要会場universeのrelease判断では、次を混同しません。

- `research completeness` = PRODUCTION / HOLD / CONTRADICTIONへformal disposition済みの候補数 / universe総数。
- `user-visible production coverage` = production catalogから実際に抽選できる候補数 / universe総数。
- `schema-addressable coverage` = production済み、現行schemaでlosslessに処理可能、またはissuerが完全定義したconfiguration/fixed-only subsetを承認済みschema拡張で処理可能な候補数 / universe総数。

formal dispositionは調査工程の完了であり、user-visible coverageではありません。旧B/Cのうち、公式basic/current-linked map、実公演layout、固定stand番号図、またはofficial+secondaryで実在番号集合を作れる候補は新policyで再評価します。

release gateは「全addressable変換」や旧adequacy blockerではなく、アプリ正常動作、主要用途を代表する会場、東京主要会場の実用的な厚み、代表配置であることの共通開示、データ破損・架空seat IDなしで判断します。research completeness、addressable conversion、raw floorは情報指標として残してもrelease blockerにはしません。

## batch運用

`data/venue-batches/<batch-id>.json`は大量調査の作業範囲を固定します。1件のsourceへ複数inventory itemを割り当てず、batch targetはinventoryに存在するstable IDまたは`venueSourceId`を参照します。

```bash
npm run venues:batch:report -- --batch tokyo-wave-1
npm run venues:review -- --batch tokyo-wave-1
```

batch reportはproduction、draft、blockedなどの状態別件数と各候補を表示します。batch reviewはsourceがある候補を通常のレビュー形式で要約し、source未作成の候補も省略せず表示します。第1パスはdraftと`verification.status: "pending"`のまま完了させ、第2パスは第1パスのrangeを正解とみなさず公式資料から独立抽出します。不一致は`unresolvedIssues`とinventoryのblocking reasonへ残し、解消するまでproductionへ変更しません。

research statusは実作業の段階に合わせて`draft-created`、`range-entry-in-progress`、`first-pass-complete`、`independent-review-in-progress`、`independent-review-mismatch`、`independent-review-complete`、`production`、`blocked`、`rejected`を使い分けます。第2パス不一致には具体的な`blockingReason`が必須です。作業開始時点の30 draftは次で決定論的に確認できます。

```bash
npm run venues:readiness:report
```

同じinventory候補を複数waveへ通常候補として登録するとvalidation errorです。再調査として持ち越す場合だけ、後続batchの`carryOvers`へ`carryOverFrom`、`previousStatus`、`recheckReason`、`recheckNotBefore`を明記します。名称が似ていても別ホールである場合はinventory IDを分け、施設名だけで同一候補と判断しません。

改修中、長期休館中、閉館済み、または座席構成を変える改修・運用終了が公式発表済みの会場は新規production化しません。「近い将来」は独立レビュー日から12か月以内を運用上の目安とし、予定日、公式確認日、blocking reason、再確認条件をinventoryへ記録します。現在activeでも12か月以内の終了予定がある場合は原則blockedとし、例外判断を推測で行いません。

## 大量生成の原子性と容量

`venues:build`は全sourceとinventory整合性を検証した後、catalogと全production detailを一時ディレクトリへ生成します。すべての書き込みが成功した場合だけ既存生成物を置換し、失敗時は置換前のcatalogとdetailを復元します。detailディレクトリ単位で置換するため、stale detailも残りません。

容量閾値は`scripts/venues/constants.mjs`の`SIZE_LIMITS`へ集約しています。従来のcatalog 100 KB、1 detail 300 KB、DB全体2 MBはsoft limitとしてレビュー警告を出します。hard limitはcatalog 5 MB、1 detail 10 MB、DB全体100 MBで、超過は生成・検証エラーにします。`venues:report`は現行detailの平均、中央値、最大値と、100・300・500会場時の推定catalog/detail/DBサイズを表示します。

会場数が増えてもcatalogだけをmain bundleへ含め、detailは1会場ずつlazy loadします。500会場予測または実測catalogがsoft limitを継続的に超え、初期bundleの計測でも悪化が確認された時点を地域別catalog chunkの再検討条件とします。range重複検証と抽選のどちらも全席`Seat[]`へ展開しません。

Cloudflare Workers Static Assetsの現行上限は1 asset 25 MiB、1 versionあたりFree 20,000 files／Paid 100,000 filesです。外部上限は変更され得るため、容量閾値を変更する際は公式ドキュメントを再確認し、soft limitを単に削除しないでください。
