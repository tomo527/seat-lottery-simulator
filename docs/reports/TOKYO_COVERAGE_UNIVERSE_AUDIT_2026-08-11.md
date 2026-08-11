# Tokyo coverage universe audit

確認日: 2026-08-11（Asia/Tokyo）
canonical inventory: [data/venue-coverage/tokyo-coverage-universe-2026-08-11.json](../../data/venue-coverage/tokyo-coverage-universe-2026-08-11.json)

初回監査後のbounded macro `LUNA-STD-1` を実施した。対象は `theater-h`、`pia-theater-yaesu`、`galaxy-theatre` の3件のみ。既存productionの座席data変更、既存HOLD/CONTRADICTIONの再調査、他の未調査候補への着手は行っていない。3件とも公式currentnessと代表pattern境界を確認したが、range転記・production gateは公式blockerのため停止した。

## 監査結果

東京の主要な座席指定型エンターテインメント会場を、既存inventoryのcurated target数から切り離して、公式施設ページ・公式座席ページ・東京都の施設リストを突合する候補universeとして再構築した。

| 指標 | 件数 |
|---|---:|
| Tokyo候補総数 | 76 |
| PRODUCTION | 7 |
| HOLD | 36 |
| CONTRADICTION | 2 |
| 未調査 | 31 |
| MUST | 44 |
| SHOULD | 28 |
| OPTIONAL | 4 |

MUSTの内訳は PRODUCTION 4、HOLD 22、CONTRADICTION 2、未調査 16。LUNA-STD-1の3件は全てHOLDへ移し、range・productionは増加していない。したがって新しいgateではMUST/SHOULD未調査が残っており、release readinessはNOのまま。

`HOLD` と `CONTRADICTION` は既存inventory/sourceの状態を監査用4値へ正規化したもの。既存HOLD/CONTRADICTIONは新しいissuer-owned evidenceなしにqueueへ戻さない。

## 新たに発見した主要未登録会場

以下は現行 `data/venue-inventory/tokyo.json` に対応候補がなく、今回のuniverseへ新規追加した主要会場。

| 会場 | エリア | 通常/着席capacity | currentness | seat map | numbered map | tier | difficulty/model |
|---|---|---:|---|---|---|---|---|
| Kanadevia Hall（旧東京ドームシティホール） | 文京区・後楽 | 着席2,471 | active | 公式あり | event-dependent | MUST | COMPLEX / Sol |
| SGC HALL ARIAKE | 江東区・有明 | 着席最大3,767 | active（2026-03-27開業） | 公式あり | あり（固定＋アリーナ要分離） | MUST | COMPLEX / Sol |
| EX THEATER ARIAKE | 江東区・有明 | 最大1,546 | active（2026-04-25開場） | 公式あり | あり | MUST | COMPLEX / Sol |
| シアターH | 品川区・勝島 | 747 | active（2024-06開業） | 公式あり | あり | MUST | STANDARD / Luna |
| 東京建物 ぴあ シアター | 中央区・八重洲 | 806 | active（2026年プレオープン） | 公式案内あり | あり | MUST | STANDARD / Luna |
| 武蔵野の森総合スポーツプラザ メインアリーナ | 調布市・西町 | 約10,000 | active | 一部公式 | あり | MUST | DENSE / Terra |
| 大手町三井ホール | 千代田区・大手町 | 560 | active | 公式あり | event-dependent | SHOULD | COMPLEX / Sol |
| MoN Takanawa: BOX 1000 | 港区・高輪 | 固定席最大1,200 | active | 一部公式 | event-dependent | SHOULD | COMPLEX / Sol |

特に有明は、東京ガーデンシアター・有明アリーナ・有明四季劇場に加えて、2026年開業のSGC HALL ARIAKEとEX THEATER ARIAKEが加わる。既存inventoryだけではこのclusterを表現できず、最大のcoverage gapの一つ。

## 必須確認候補の分類

| 会場 | inventory状態 | tier | 判断 |
|---|---|---|---|
| 品川プリンスホテル ステラボール | HOLD（既存 `tokyo-official-0121`） | MUST | 876席の公式座席案内あり。1Fは固定椅子でなく用途別配置のため、座席抽選の代表patternをschema上確定する必要がある。既存HOLDは再調査queueへ戻さない。 |
| Kanadevia Hall | 未調査・現行inventory未登録 | MUST | 公式は固定バルコニーと可変アリーナ、着席2,471を提示。最優先の新規候補。 |
| SGC HALL ARIAKE | 未調査・現行inventory未登録 | MUST | 公式は着席最大3,767、1〜4階の内訳、座席表を提示。新会場として最優先。 |

## LUNA-STD-1 結果

| 会場 | currentness / representative pattern | 第1パス | 独立第2パス | 結果 |
|---|---|---|---|---|
| シアターH | 2024年開業・現役。1階581席＋車椅子6席または補助席、2階158席。公式座席図に番号席と車椅子アイコンあり。 | 運営者の施設概要・座席図・FAQで現役性、容量、番号図、車椅子6席を確認。 | 座席図を再読し、車椅子／補助席の置換番号が公式に定義されていないことを確認。 | SOURCE/POLICY HOLD。expected/calculatedとも未確定。 |
| 東京建物 ぴあ シアター | 2026年5月プレオープン・現役。1階593席＋2階213席＝806席、段床式固定席。 | 所有者・運営者公式ページで容量、固定席、演劇・ミュージカル・ライブ用途を確認。 | 公式主催者向けページ・公式イベントページを再確認。公開資料は詳細図面が問い合わせ対象で、全列・全番号は未公開。 | SOURCE/SCHEMA HOLD。expected/calculatedとも未確定。 |
| 天王洲 銀河劇場 | 現役746席。公式座席ページ/PDFは1階516・2階101・3階129の番号図を掲載。 | 公式座席ページとPDFで通常三層番号図・階別定員を確認。 | 現行利用案内で車椅子対応時は座席を外す運用を確認したが、撤去番号・公演別差分は未定義。 | POLICY/SCHEMA HOLD。expected/calculatedとも未確定。 |

このmacroの3件は、座席図を根拠に未確定番号を補完していない。正式HOLDは新しいissuer-owned evidenceが見つかった場合のみ再queueする。

## 重要なcoverage gap

- 大規模ライブ: 東京ドーム、国立代々木競技場第一/第二、有明アリーナ、東京体育館、武蔵野の森、東京ガーデンシアター。
- 有明の新設cluster: SGC HALL ARIAKE、EX THEATER ARIAKEが未登録。
- 商業舞台/ミュージカル: 東京宝塚劇場、四季劇場［春］［秋］、電通四季劇場［海］、有明四季劇場、日本青年館、天王洲 銀河劇場、シアターH、東京建物 ぴあ シアター。
- 都心の可変型中規模会場: Kanadevia Hall、日本橋三井ホール、EX THEATER ROPPONGI、Zepp群、豊洲PIT、ヒューリックホール東京、大手町三井ホール、MoN Takanawa: BOX 1000。
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

## 未調査候補の queue

未調査34件のうち、record-only/currentness holdは4件（閉館は国立劇場大劇場/小劇場、帝国劇場の3件。味の素スタジアムはactiveだがOPTIONAL扱い）。実装queueはactiveな30件だけを対象とし、既存HOLD/CONTRADICTIONは含めない。

### 1. Luna STANDARD（残り3件）

`theater-g-rosso`, `imm-theater`, `nissho-hall`

### 2. Terra DENSE（12件）

`yoyogi-1`, `yoyogi-2`, `ariake-arena`, `tokyo-gymnasium`, `musashino-forest-sport-plaza`, `tokyo-garden-theater`, `tokyo-takarazuka`, `shiki-haru`, `shiki-aki`, `shiki-umi`, `ariake-shiki`, `nihon-seinenkan`

### 3. Sol COMPLEX（12 active件）

`kanadevia-hall`, `sgc-hall-ariake`, `ex-theater-ariake`, `ex-theater-roppongi`, `zepp-haneda`, `zepp-shinjuku`, `toyosu-pit`, `hulic-hall-tokyo`, `otemachi-mitsui-hall`, `forum-b7`, `mon-takanawa-box1000`, `tokyo-dome`

Record-only/currentness hold: `ajinomoto-stadium`, `national-theatre-large`, `national-theatre-small`, `teikoku-theatre`。閉館/用途依存のためactive queueへ入れず、公式再開・公演利用の新証拠が出た時に再分類する。

## bounded macro案

`LUNA-STD-1`（`theater-h` / `pia-theater-yaesu` / `galaxy-theatre`）は完了。production増加は0、正式HOLDは3件。

次に実行すべきbounded macroは `LUNA-STD-2`（Gロッソ/IMM/ニッショー）。

次のbounded順序は、`LUNA-STD-2`（Gロッソ/IMM/ニッショー）、`TERRA-DENSE-1`（東京宝塚/四季［春］/四季［秋］）、`TERRA-DENSE-2`（四季［海］/有明四季/日本青年館）、`TERRA-DENSE-3`（代々木第一/第二/東京体育館）、`TERRA-DENSE-4`（有明アリーナ/武蔵野の森/東京ガーデンシアター）、その後に `SOL-CPLX-1`（Kanadevia/SGC/EX THEATER ARIAKE）とする。Solの東京ドームは単独macro、可変ライブハウス群は別macroに分離する。

## source discipline

公式施設ページ・公式座席図・運営者/所有者の公式資料のみを座席構造・席数・currentnessの根拠として採用した。一般の会場一覧やチケットサイトは候補発見の補助にとどめ、座席rangeの根拠にはしていない。座席mapが公演依存・可変・車椅子/ピット変換を含む場合は、番号を推測せず `COMPLEX`/`Sol` またはHOLDへ送る。
