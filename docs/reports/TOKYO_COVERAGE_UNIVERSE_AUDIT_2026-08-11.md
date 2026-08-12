# Tokyo coverage universe audit

初回確認日: 2026-08-11（Asia/Tokyo）
current snapshot更新: 2026-08-12（SOL-CPLX-1完了後）
canonical inventory: [data/venue-coverage/tokyo-coverage-universe-2026-08-11.json](../../data/venue-coverage/tokyo-coverage-universe-2026-08-11.json)

この文書は2026-08-11のuniverse監査結果を起点とする。過去macroの結果はhistorical recordとして保持するが、件数・active queue・Exact next actionは上記canonical inventoryの現在値を用いる。

## 監査結果

東京の主要な座席指定型エンターテインメント会場を、既存inventoryのcurated target数から切り離して、公式施設ページ・公式座席ページ・東京都の施設リストを突合する候補universeとして再構築した。

| 指標 | 件数 |
|---|---:|
| Tokyo候補総数 | 76 |
| PRODUCTION | 8 |
| HOLD | 53 |
| CONTRADICTION | 2 |
| 未調査 | 13 |
| MUST | 44 |
| SHOULD | 28 |
| OPTIONAL | 4 |

現在のMUST内訳は PRODUCTION 4、HOLD 37、CONTRADICTION 2、未調査 1。SHOULD内訳は PRODUCTION 4、HOLD 16、未調査 8。OPTIONAL未調査は4でnon-blocking。MUST/SHOULD未調査が残るためrelease readinessはNOのまま。

### 件数のhistorical snapshot

| 時点 | PRODUCTION | HOLD | CONTRADICTION | 未調査 | MUST未調査 | SHOULD未調査 |
|---|---:|---:|---:|---:|---:|---:|
| LUNA-STD-2完了時 | 8 | 38 | 2 | 28 | 16 | 8 |
| TERRA-DENSE-1〜4完了時 | 8 | 50 | 2 | 16 | 4 | 8 |
| **SOL-CPLX-1完了後（現在）** | **8** | **53** | **2** | **13** | **1** | **8** |

上表の旧件数は各macro当時の結果であり、current queueとして扱わない。

`HOLD` と `CONTRADICTION` は既存inventory/sourceの状態を監査用4値へ正規化したもの。既存HOLD/CONTRADICTIONは新しいissuer-owned evidenceなしにqueueへ戻さない。

## 初回監査時に発見した主要未登録会場

以下は初回監査時に `data/venue-inventory/tokyo.json` に対応候補がなかった主要会場。後続macroで正式inventory recordを追加した対象はcurrent dispositionを併記する。

| 会場 | エリア | 通常/着席capacity | currentness | seat map | tier | difficulty/model | current disposition |
|---|---|---:|---|---|---|---|---|
| Kanadevia Hall（旧東京ドームシティホール） | 文京区・後楽 | 着席2,471 | active | 公式あり・arena event-dependent | MUST | COMPLEX / Sol | SOURCE/POLICY/SCHEMA HOLD |
| SGC HALL ARIAKE | 江東区・有明 | 着席最大3,767 | active（2026-03-27開業） | 公式基本図・event-dependent | MUST | COMPLEX / Sol | SOURCE/POLICY/SCHEMA HOLD |
| EX THEATER ARIAKE | 江東区・有明 | 最大1,546 | active（2026-04-25開場） | 公式最大図・event-dependent | MUST | COMPLEX / Sol | SOURCE/POLICY/SCHEMA HOLD |
| シアターH | 品川区・勝島 | 747 | active（2024-06開業） | 公式あり | MUST | STANDARD / Luna | SOURCE/POLICY HOLD |
| 東京建物 ぴあ シアター | 中央区・八重洲 | 806 | active（2026年プレオープン） | 公式案内あり | MUST | STANDARD / Luna | SOURCE/SCHEMA HOLD |
| 武蔵野の森総合スポーツプラザ メインアリーナ | 調布市・西町 | 約10,000 | active | 一部公式 | MUST | DENSE / Terra | SOURCE/POLICY/SCHEMA HOLD |
| 大手町三井ホール | 千代田区・大手町 | 560 | active | 公式あり・event-dependent | SHOULD | COMPLEX / Sol | 未調査 |
| MoN Takanawa: BOX 1000 | 港区・高輪 | 固定席最大1,200 | active | 一部公式・event-dependent | SHOULD | COMPLEX / Sol | 未調査 |

有明clusterの新規3会場は後続macroで正式inventory recordへ同期済み。SGC HALL ARIAKEとEX THEATER ARIAKEはSOL-CPLX-1で公式blocker付きHOLDとなり、未登録gapではない。

## 必須確認候補の分類

| 会場 | inventory状態 | tier | 判断 |
|---|---|---|---|
| 品川プリンスホテル ステラボール | HOLD（既存 `tokyo-official-0121`） | MUST | 876席の公式座席案内あり。1Fは固定椅子でなく用途別配置のため、座席抽選の代表patternをschema上確定する必要がある。既存HOLDは再調査queueへ戻さない。 |
| Kanadevia Hall | HOLD（`tokyo-coverage-kanadevia-hall`） | MUST | 固定バルコニー1,365席は確認済み。アリーナ990席の恒久番号、車いす/同伴、standard configurationが未定義。 |
| SGC HALL ARIAKE | HOLD（`tokyo-coverage-sgc-hall-ariake`） | MUST | 基本図と最大3,767は確認済み。1F dynamic floorと車いすlayoutが公演依存で恒久全館番号setがない。 |
| EX THEATER ARIAKE | HOLD（`tokyo-coverage-ex-theater-ariake`） | MUST | 最大1,546番号図は確認済み。前方撤去、pit/張出し/花道、車いすspace、standard configurationが公演依存。 |

## LUNA-STD-1 結果

| 会場 | currentness / representative pattern | 第1パス | 独立第2パス | 結果 |
|---|---|---|---|---|
| シアターH | 2024年開業・現役。1階581席＋車椅子6席または補助席、2階158席。公式座席図に番号席と車椅子アイコンあり。 | 運営者の施設概要・座席図・FAQで現役性、容量、番号図、車椅子6席を確認。 | 座席図を再読し、車椅子／補助席の置換番号が公式に定義されていないことを確認。 | SOURCE/POLICY HOLD。expected/calculatedとも未確定。 |
| 東京建物 ぴあ シアター | 2026年5月プレオープン・現役。1階593席＋2階213席＝806席、段床式固定席。 | 所有者・運営者公式ページで容量、固定席、演劇・ミュージカル・ライブ用途を確認。 | 公式主催者向けページ・公式イベントページを再確認。公開資料は詳細図面が問い合わせ対象で、全列・全番号は未公開。 | SOURCE/SCHEMA HOLD。expected/calculatedとも未確定。 |
| 天王洲 銀河劇場 | 現役746席。公式座席ページ/PDFは1階516・2階101・3階129の番号図を掲載。 | 公式座席ページとPDFで通常三層番号図・階別定員を確認。 | 現行利用案内で車椅子対応時は座席を外す運用を確認したが、撤去番号・公演別差分は未定義。 | POLICY/SCHEMA HOLD。expected/calculatedとも未確定。 |

このmacroの3件は、座席図を根拠に未確定番号を補完していない。正式HOLDは新しいissuer-owned evidenceが見つかった場合のみ再queueする。

## LUNA-STD-2 結果

| 会場 | currentness / representative pattern | 第1パス | 独立第2パス | 結果 |
|---|---|---|---|---|
| シアターGロッソ | 現行の東京ドームシティ施設。A〜Zの26列、765席。別枠車椅子3スペース。 | 現行公式座席図の全列・番号範囲を転記し、施設概要の765席・車椅子3台別枠と照合。expected 765 / calculated 765。 | 東京ドームシティ設備紹介と英語版公式座席案内で列数・番号範囲・765席・車椅子別枠を再照合。range差分0。 | **PRODUCTION**, `theater-g-rosso-standard`, 765席。 |
| IMM THEATER | 現行運営。705席（一般703、車椅子2）。公式座席表は基本形状で、公演により配置が異なる。 | 施設概要・公式座席表・705席を確認。公演可変と車椅子詳細が固定setを定義しないためrange停止。 | 2026年7月改定の公式利用規約と座席表注記を再確認。公演別客席形状・車椅子問い合わせのため一意性なし。 | **SOURCE/SCHEMA HOLD**, expected/calculated `null`/`null`。 |
| ニッショーホール | 現行運営。1,000席（1F 671＋車椅子1、2F 328）。現行公式1F/2F図あり。 | 現行ホールページ・客席図で容量と番号構造を確認。1F8列2番常時除外、3-4番・5-6番可変撤去注記のためrange停止。 | 現行客席PDFの注記を独立再確認。通常販売variantをissuerが指定していないため一意性なし。 | **SOURCE/POLICY/SCHEMA HOLD**, expected/calculated `null`/`null`。 |

G-ROSSOのみproduction gateを通過した。IMMとニッショーは番号schema・公演/販売variantを推測せず、正式HOLDとして記録した。既存59 production artifactsは不変。

## current coverage gap

- 大規模ライブ: 未調査は東京ドームのみ。国立代々木第一/第二、有明アリーナ、東京体育館、武蔵野の森、東京ガーデンシアターは公式blocker付きHOLDで、active queueではない。
- 有明の新設cluster: SGC HALL ARIAKE、EX THEATER ARIAKEは正式inventory/sourceへ登録し、SOL-CPLX-1で公式blocker付きHOLD。未登録gapは解消済み。
- 商業舞台/ミュージカル: 東京宝塚劇場、四季劇場［春］［秋］、電通四季劇場［海］、有明四季劇場、日本青年館、天王洲 銀河劇場、シアターH、東京建物 ぴあ シアター。
- 都心の可変型中規模会場: Kanadevia Hallは正式HOLD。SHOULD未調査はEX THEATER ROPPONGI、Zepp Haneda/Shinjuku、豊洲PIT、ヒューリックホール東京、大手町三井ホール、東京国際フォーラムB7、MoN Takanawa: BOX 1000の8件。
- 既存major HOLD/CONTRADICTION: 東京芸術劇場コンサートホール、東京オペラシティ、日生劇場、明治座、歌舞伎座、東京文化会館、Bunkamura、国立代々木等。これらは「未調査」ではないが、公式blockerを解消しない限りcoverage完了とは扱わない。

## 新しい release-seed-v1 gate

`data/venue-release-targets/release-seed-v1.json` に、旧48 targetをlegacy referenceへ降格し、Tokyo coverage universeを新しい分母とする契約を記録した。

- MUSTの未調査 = 0。
- SHOULDの未調査 = 0。
- OPTIONALはrelease blockerにしない。
- currentかつsource-completeで現行schemaにlosslessに表現可能なMUST/SHOULDは原則production化済みとする。
- production化不能なMUST/SHOULDは、issuer-owned blockerを持つ正式HOLD / CONTRADICTIONとして処理済みとする。
- HOLD / CONTRADICTIONは、issuer-owned official blocker、currentness、またはschema/policy blockerを明記する。
- 閉館・長期休館はcurrent active universeから除外するが、再開監視のrecord-only候補として削除しない。
- 明らかな主要会場の候補漏れがないことを、会場数ではなく用途・規模・地域cluster・currentnessで確認する。
- 既存productionの品質gate、二つの公式source pass、`expectedSeatCount == calculatedSeatCount`、生成物/fingerprint整合性は変更しない。
- この監査ではrelease readinessをYESへ変更しない。

## current 未調査queue

未調査13件のうちOPTIONAL record-only/non-blockingは4件（国立劇場大劇場/小劇場、帝国劇場、味の素スタジアム）。pre-release active queueはMUST 1件＋SHOULD 8件＝9件。既存HOLD/CONTRADICTIONは含めない。

### 1. Luna STANDARD（残り0件）

LUNA-STD-2で `theater-g-rosso` はPRODUCTION、`imm-theater` と `nissho-hall` は正式HOLD。残りのLuna STANDARD queueはない。

### 2. Terra DENSE（残り0件）

`TERRA-DENSE-1`〜`TERRA-DENSE-4`で12件すべて正式disposition済み。active Terra queueは0件であり、完了済みmacroを再度activeとして扱わない。

### 3. Sol COMPLEX（9 active件）

MUST: `tokyo-dome` の1件のみ。
SHOULD: `ex-theater-roppongi`, `zepp-haneda`, `zepp-shinjuku`, `toyosu-pit`, `hulic-hall-tokyo`, `otemachi-mitsui-hall`, `forum-b7`, `mon-takanawa-box1000` の8件。

Record-only/currentness hold: `ajinomoto-stadium`, `national-theatre-large`, `national-theatre-small`, `teikoku-theatre`。閉館/用途依存のためactive queueへ入れず、公式再開・公演利用の新証拠が出た時に再分類する。

## bounded macro案

`LUNA-STD-1`、`LUNA-STD-2`、`TERRA-DENSE-1`〜`TERRA-DENSE-4`、`SOL-CPLX-1`は完了済み。historical resultは保持するがactive macroではない。SOL-CPLX-1は3件すべて正式HOLD、production増加0。

Terra active queueは0件。MUST active queueは東京ドーム1件のみ。

**Exact next action:** `tokyo-dome` 1件のみをSol high bounded macroとして処理する。SHOULD 8件、OPTIONAL 4件、既存HOLD/CONTRADICTIONはこの次macroに含めない。

## source discipline

公式施設ページ・公式座席図・運営者/所有者の公式資料のみを座席構造・席数・currentnessの根拠として採用した。一般の会場一覧やチケットサイトは候補発見の補助にとどめ、座席rangeの根拠にはしていない。座席mapが公演依存・可変・車椅子/ピット変換を含む場合は、番号を推測せず `COMPLEX`/`Sol` またはHOLDへ送る。
