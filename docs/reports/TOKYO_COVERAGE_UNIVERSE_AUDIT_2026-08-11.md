# Tokyo coverage universe audit

初回確認日: 2026-08-11（Asia/Tokyo）
current snapshot更新: 2026-08-13（SOL-SHOULD-3完了後）
canonical inventory: [data/venue-coverage/tokyo-coverage-universe-2026-08-11.json](../../data/venue-coverage/tokyo-coverage-universe-2026-08-11.json)

この文書は2026-08-11のuniverse監査結果を起点とする。過去macroの結果はhistorical recordとして保持するが、件数・active queue・Exact next actionは上記canonical inventoryの現在値を用いる。

## 監査結果

東京の主要な座席指定型エンターテインメント会場を、既存inventoryのcurated target数から切り離して、公式施設ページ・公式座席ページ・東京都の施設リストを突合する候補universeとして再構築した。

| 指標 | 件数 |
|---|---:|
| Tokyo候補総数 | 76 |
| PRODUCTION | 10 |
| HOLD | 60 |
| CONTRADICTION | 2 |
| 未調査 | 4 |
| MUST | 44 |
| SHOULD | 28 |
| OPTIONAL | 4 |

現在のMUST内訳は PRODUCTION 6、HOLD 36、CONTRADICTION 2、未調査 0。MUST 44件はすべてformal disposition済みだが、ユーザーが抽選できるMUSTは6件だけである。SHOULD内訳は PRODUCTION 4、HOLD 24、未調査 0。OPTIONAL未調査は4でnon-blocking。formal dispositionは調査工程の完了であり、user-visible coverageの完了ではない。release readinessはNOのまま。

## coverage指標の分離

| 指標 | Tokyo universe | MUST | SHOULD | OPTIONAL |
|---|---:|---:|---:|---:|
| Research completeness | 72/76 = **94.7%** | 44/44 = **100.0%** | 28/28 = **100.0%** | 0/4 = **0.0%** |
| User-visible production coverage | 10/76 = **13.2%** | 6/44 = **13.6%** | 4/28 = **14.3%** | 0/4 = **0.0%** |
| Confirmed schema-addressable coverage | 10/76 = **13.2%** | 6/44 = **13.6%** | 4/28 = **14.3%** | 0/4 = **0.0%** |

- `Research completeness` は `PRODUCTION / HOLD / CONTRADICTION` のformal disposition率であり、抽選可能率ではない。
- `User-visible production coverage` はproduction catalogへ入って実際に抽選できる候補だけを数える。アプリ全体の62会場中、Tokyo coverage universeに該当する主要会場は10件である。
- `Schema-addressable coverage` は既存PRODUCTION 10件、現行schemaで処理可能な非production 3件、schema-extension nonproduction 1件の計14件。ARENA-2の3件とEX THEATER ARIAKEはfresh issuer evidenceによりB、銀河劇場はCへ移し、安全側で分子から除外した。
- schema-addressableはproduction確約ではない。各configurationに完全なissuer-owned番号図・厳密総数・条件・wheelchair semanticsが揃い、従来どおり二つの独立公式source passと`expectedSeatCount == calculatedSeatCount`を通る必要がある。

### 件数のhistorical snapshot

| 時点 | PRODUCTION | HOLD | CONTRADICTION | 未調査 | MUST未調査 | SHOULD未調査 |
|---|---:|---:|---:|---:|---:|---:|
| LUNA-STD-2完了時 | 8 | 38 | 2 | 28 | 16 | 8 |
| TERRA-DENSE-1〜4完了時 | 8 | 50 | 2 | 16 | 4 | 8 |
| SOL-CPLX-1完了後 | 8 | 53 | 2 | 13 | 1 | 8 |
| TOKYO-DOME COMPLEX完了後 | 8 | 54 | 2 | 12 | 0 | 8 |
| SOL-SHOULD-1完了後 | 10 | 55 | 2 | 9 | 0 | 5 |
| SOL-SHOULD-2完了後 | 10 | 58 | 2 | 6 | 0 | 2 |
| SOL-SHOULD-3完了後（current） | 10 | 60 | 2 | 4 | 0 | 0 |
| **TOKYO-CONFIG-PILOT-1完了時（historical snapshot）** | **9** | **53** | **2** | **12** | **0** | **8** |

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
| 大手町三井ホール | 千代田区・大手町 | 560 / flat 572 | active | 現行公式全番号図あり | SHOULD | COMPLEX / Sol | B_SOURCE_LIMITED / HOLD |
| MoN Takanawa: BOX 1000 | 港区・高輪 | 公式着席例1,048 | active | 現行公式全番号図あり | SHOULD | COMPLEX / Sol | B_SOURCE_LIMITED / HOLD |

有明clusterの新規3会場は後続macroで正式inventory recordへ同期済み。SGC HALL ARIAKEとEX THEATER ARIAKEはSOL-CPLX-1で公式blocker付きHOLDとなり、未登録gapではない。

## 必須確認候補の分類

| 会場 | inventory状態 | tier | 判断 |
|---|---|---|---|
| 品川プリンスホテル ステラボール | HOLD（既存 `tokyo-official-0121`） | MUST | 876席の公式座席案内あり。1Fは固定椅子でなく用途別配置のため、座席抽選の代表patternをschema上確定する必要がある。既存HOLDは再調査queueへ戻さない。 |
| Kanadevia Hall | HOLD（`tokyo-coverage-kanadevia-hall`） | MUST | 固定バルコニー1,365席は確認済み。アリーナ990席の恒久番号、車いす/同伴、standard configurationが未定義。 |
| SGC HALL ARIAKE | HOLD（`tokyo-coverage-sgc-hall-ariake`） | MUST | 基本図と最大3,767は確認済み。1F dynamic floorと車いすlayoutが公演依存で恒久全館番号setがない。 |
| EX THEATER ARIAKE | HOLD（`tokyo-coverage-ex-theater-ariake`） | MUST | 最大1,546番号図は確認済み。前方撤去、pit/張出し/花道、車いすspace、standard configurationが公演依存。 |
| 東京ドーム | HOLD（`tokyo-official-0319`） | MUST | 公開stand番号図は野球開催時用。concert arenaは催事別・非掲載で、stage別stand閉鎖、floor仮設番号、車いす／同伴、suite／premium／special areaを含むstandard concert setがない。 |

## TOKYO-DOME COMPLEX 結果

- **SOURCE/POLICY/SCHEMA HOLD**。現行施設概要は多目的施設として一般収容55,000人と野球時約43,500人を分けて示す。公開座席案内と公式FAQは、番号付きstand図を野球開催時用とし、コンサート／イベントのarena席は催事ごとに異なるため非掲載と明記する。
- 第1パスは現行施設概要、座席案内、野球ダイヤモンドを前提とする2023改定座席表、2026年巨人戦座席図、FAQを確認し、代表pattern gateで停止した。野球用stand seat IDをconcertへ転用せず、fixed standsだけを独自代表化しなかった。
- 独立第2パスは主催者案内、巨人公式戦専用の車いす30席・付添2名運用、現行concert scheduleからリンクされた2026年公演issuer資料を確認した。現行公演でも照明機材配置確定後の機材席開放、注釈付指定席、stage-side席が公演単位で販売され、全公演共通の番号setを示さない。
- issuer-owned standard/normal concert configuration、arena/floor恒久番号、stage別固定stand不使用番号、movable/temporary/supplementary席、concert時の車いす／同伴、THE SUITE TOKYO・premium/special areaの包含・番号対応は未公表。expected/calculatedは`null`/`null`、ranges 0、range diff `null`、production増加0。

## MUST phase close

- **Historical pre-Meijiza snapshot:** MUST 44件の最終dispositionは **PRODUCTION 4 / HOLD 38 / CONTRADICTION 2 / 未調査 0**。
- This historical snapshot predates `TOKYO-CONFIG-PILOT-1`. Current MUST disposition is **PRODUCTION 6 / HOLD 36 / CONTRADICTION 2 / 未調査 0**; the six production venues include `meijiza` and `nntt-playhouse` in addition to `line-cube-shibuya`、`suntory-hall-main`、`theater-milano-za`、`sunshine-theatre`。
- 初回universe監査と後続macroでライブ／コンサート、arena/dome、商業舞台、ミュージカル、2.5次元・声優系、地域clusterを照合し、現時点で明らかなMUST級会場漏れは確認されない。既存MUST HOLDは再調査していない。

## Historical: MUST非production 40件の初回blocker再分類

この再分類は既存repo evidenceだけを使用し、新しい会場調査を行っていない。Aは「即production」ではなく、現行schemaまたは厳格なschema拡張で安全に処理できる可能性が高いという分類である。

| class | 件数 | 代表会場 | release上の意味 |
|---|---:|---|---|
| A. SCHEMA-UNLOCKABLE | **12** | 明治座、新国立劇場 中劇場、Kanadevia Hall、代々木第一体育館 | 現行schema 2件、schema拡張依存10件。Aのまま非productionをrelease免責にしない。 |
| B. SOURCE-LIMITED | **21** | 東京ドーム、東京建物 ぴあ シアター、東京宝塚劇場、日本青年館 | 完全番号、厳密総数、canonical identity、車いす置換番号等がissuer資料にない。schemaだけでは救えない。 |
| C. CONTRADICTION | **4** | 東京芸術劇場コンサートホール、東京オペラシティ コンサートホール | 公式資料内の席数・番号包含が矛盾。formal CONTRADICTION 2件に、HOLD正規化されていた2件をtaxonomy上追加。 |
| D. CURRENTNESS / CLOSED | **3** | 東京文化会館 大ホール、Bunkamura オーチャードホール | 休館・改修・営業期限。再開後または新source generation待ち。 |

### A. SCHEMA-UNLOCKABLE 12件

現行schemaでaddressableな2件:

- `tokyo-international-forum-a`
- `nntt-opera`

multi-configuration / fixed-only schema拡張でaddressableな10件:

- `yoyogi-1`
- `yoyogi-2`
- `ariake-arena`
- `tokyo-gymnasium`
- `kanadevia-hall`
- `sgc-hall-ariake`
- `ex-theater-ariake`
- `nntt-playhouse`
- `meijiza`
- `galaxy-theatre`

### B. SOURCE-LIMITED 21件

`tokyo-dome`、`nippon-budokan`、`musashino-forest-sport-plaza`、`tokyo-garden-theater`、`tokyo-international-forum-c`、`nhk-hall`、`tokyu-theatre-orb`、`tbs-akasaka-act`、`nissay-theatre`、`tokyo-takarazuka`、`kabukiza`、`shiki-haru`、`shiki-aki`、`shiki-umi`、`ariake-shiki`、`brillia-hall`、`theater-h`、`pia-theater-yaesu`、`yurakucho-yomiuri`、`nihombashi-mitsui`、`nihon-seinenkan`。

ここには、schemaを増やしても番号情報そのものがない会場、公式area/row keyがなくseat identityを創作しないとrange化できない会場、車いす置換番号・厳密総数・恒久configuration条件が未公開の会場を含む。

### C. CONTRADICTION 4件

`tokyo-geigeki-concert`、`tokyo-operacity-concert`、`sumida-triphony-main`、`shinbashi-enbujo`。後者2件はcanonical inventoryのhistorical dispositionをHOLDのまま保持するが、release blocker taxonomyでは公式数値差分のためCとする。

### D. CURRENTNESS / CLOSED 3件

`tokyo-geigeki-playhouse`、`tokyo-bunka-main`、`bunkamura-orchard`。旧図や改修前図をcurrent productionへ流用しない。

### Current taxonomy after configuration reviews

明治座とNNTT中劇場はAからproductionへ移行済み。fresh issuer reviewでForum A / NNTT Opera、ARENA-2の3件、EX THEATER ARIAKEをA→B、代々木第一 / 第二 / 東京体育館、銀河劇場をA→Cへ移したため、current nonproduction 38件は **A0 / B27 / C8 / D3**。current A cohortは0件で閉じた。

## multi-configuration schemaの実現性

結論は実現可能で、現行の単一`representativePattern`を直ちに削除せず、schema v2を追加して段階移行する。

```text
venue
└─ configurations[]
   ├─ id / canonicalName
   ├─ issuerDefinedCondition
   ├─ numberedSeatRanges / expectedSeatCount
   ├─ sourceGeneration
   ├─ wheelchairSemantics
   ├─ selectable / status
   └─ verification / source references
```

収録条件:

- 通常配置、花道あり／なし、pitあり／なし、固定席配置等をissuer自身が別configurationとして完全に定義している。
- configurationごとに完全な番号range、厳密な`expectedSeatCount`、source generation、適用条件、wheelchair semanticsを持つ。
- configurationごとに独立第2パス差分ゼロ、`verification.status: verified`、`unresolvedIssues: []`を要求する。
- 1つでも不完全なvariantがあっても、完全な別configurationの収録を妨げない。ただし不完全variantは非selectable HOLDとして残し、存在を隠さない。
- repository側でconfiguration名・条件・番号差分を創作せず、event-dependent floor番号を恒久seat ID化しない。

## 「固定番号席のみ」configuration

限定的に可とする。対象は、固定席subsetがissuer evidence上で独立したseat setとして成立し、全番号・厳密総数・除外範囲・wheelchair semanticsを完全に確認できる場合だけである。ARENA-1の3件は公式count／番号集合矛盾、ARENA-2の3件は全番号・独立configuration・wheelchair semantics等のsource不足により不成立となった。

UIは「固定スタンド席configurationのみ」「アリーナ／floor席を含まない」「最大収容配置ではない」を会場選択時と抽選結果に明示する。単に図から固定席が読める、固定席数だけが公表される、またはevent floorを除けば合計が合う、という理由だけでは採用しない。東京ドームはconcert用途の固定stand subsetのexact count・stage別使用範囲がissuerにより独立定義されていないため、この救済対象にしない。

## Historical: Option Bとmigration方針

**初回監査時点ではOption Bを推奨した。** 当時はMUST 10件、SHOULD 1件、計11件をschema拡張候補と見積もった。後続のARENA-2時点のA3 / addressable 16もhistorical snapshotであり、current値はTHEATRE-1完了後のA0 / addressable 14を優先する。

Affected files / modules:

- source/build validation: `scripts/venues/validation.mjs`、`lib.mjs`、`atomic-build.mjs`、`inventory.mjs`、`review-venue.mjs`、`readiness-report.mjs`と対応test。
- runtime types/loading: `src/types/venue.ts`、`src/data/venue-db/loadVenue.ts`、`venueDatabase.test.ts`。
- UI: venue/configuration選択を扱う`src/components/venue/`とapp state。既存の単一configuration UXは維持する。
- governance/data: `docs/VENUE_DATA_GUIDE.md`、`docs/prompts/`、source schema v2 fixtures、production fingerprint validation。

Migration strategy / backward compatibility:

1. schema v1の単一`representativePattern`を引き続き受理し、内部で1 configurationとして正規化する。
2. schema v2の`venue.configurations[]`を追加する。catalogはselectable configuration単位でentryを生成し、同一会場を`venueGroupId`でgroup化する。
3. v1の既存60 production sourceは移行macroで書き換えない。v1 build outputをbyte-for-byte維持し、optional v2 fieldsも既存entryへ出力しない。
4. v2 configurationは`(venueId, configurationId)`を一意keyとし、fingerprintもconfiguration単位で追加する。既存60 fingerprintは変更しない。
5. UIはconfigurationが1件なら従来どおり直接抽選し、複数またはfixed-onlyならissuer-defined conditionと限定範囲を選択前に表示する。

Validation追加:

- configuration ID/name/condition/source generationの必須性と重複禁止。
- selectable production configurationごとの完全range、expected/calculated一致、独立第2パス、verified、unresolved zero。
- 同じphysical seat setの重複、configuration間の無根拠差分、event floor恒久ID、capacity fittingを拒否するfixture。
- fixed-onlyは`scopeDisclosure`、excluded dynamic areas、wheelchair semantics、issuer-owned independent-set evidenceを必須化。
- v1の60 production catalog/runtime/fingerprintがbyte-for-byte不変であるbaseline regression。

当時のrollout順序は、schema v2 validationとv1 adapter → build/runtime互換 → UI configuration selector/disclosure → fixture/negative tests → 既存60 baseline regression → A群から1会場pilot → bounded batchで残りA群 → その後にSHOULD 8件としていた。schema migrationとA群処理は完了し、SOL-SHOULD-1も完了済みである。

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

- 大規模ライブ: 東京ドームを含むMUST大規模会場はすべてformal disposition済みだが、current MUST user-visible production coverageは6/44 = **13.6%**に留まる。MUST active research queueが0でもcoverage完了ではない。
- 有明の新設cluster: SGC HALL ARIAKE、EX THEATER ARIAKEは正式inventory/sourceへ登録し、SOL-CPLX-1で公式blocker付きHOLD。未登録gapは解消済み。
- 商業舞台/ミュージカル: 東京宝塚劇場、四季劇場［春］［秋］、電通四季劇場［海］、有明四季劇場、日本青年館、天王洲 銀河劇場、シアターH、東京建物 ぴあ シアター。
- 都心の可変型中規模会場: Kanadevia Hall、EX THEATER ROPPONGI、Zepp Haneda/Shinjuku、豊洲PIT、ヒューリックホール東京、大手町三井ホール、東京国際フォーラムB7、MoN Takanawa: BOX 1000は全て公式blocker付きHOLD。SHOULD未調査は0。
- 既存major HOLD/CONTRADICTION: 東京芸術劇場コンサートホール、東京オペラシティ、日生劇場、歌舞伎座、東京文化会館、Bunkamura、国立代々木等。明治座はhistorical HOLDをschema-v2 pilotで解消済みのproductionであり、このcurrent列挙には含めない。

## 新しい release-seed-v1 gate

`data/venue-release-targets/release-seed-v1.json` に、旧48 targetをlegacy referenceへ降格し、Tokyo coverage universeを新しい分母とする契約を記録した。

- Research completeness: MUST **100%**、SHOULD **100%**。
- Schema-addressable production conversion: MUST **100%**、SHOULD **100%**。AをHOLDのままrelease免責にしない。
- 現時点のrepo evidenceに基づくraw production floor（current confirmed addressableを全件production化した必要数）: MUST **6/44 = 13.6%**、SHOULD **6/28 = 21.4%**、MUST+SHOULD **12/72 = 16.7%**、Tokyo universe **12/76 = 15.8%**。addressable conversion progressはMUST **6/6**、SHOULD **4/6**、全体 **10/12**。
- 上記floorは任意の目標率ではなく、「既存production + 現行schema addressable + 承認済みschema extension addressable」を全件production化した必要数である。
- SHOULD 28/28のformal dispositionは完了。今後fresh issuer evidenceで新たなschema-addressable候補が判明するたび、required numeratorとconversion denominatorを1件増やす。既存required venueとの置換は認めない。
- OPTIONALはrelease blockerにしない。
- raw denominatorからHOLD/CONTRADICTIONを削除しない。非production免責はB SOURCE-LIMITED、C CONTRADICTION、D CURRENTNESS/CLOSEDのissuer-owned blockerがある場合だけとする。
- multi-configuration / fixed-only supportとuser-facing scope disclosureをrelease必須にする。
- 閉館・長期休館はcurrent active universeから除外するが、再開監視のrecord-only候補として削除しない。
- 明らかな主要会場の候補漏れがないことを、会場数ではなく用途・規模・地域cluster・currentnessで確認する。
- 既存productionの品質gate、二つの公式source pass、`expectedSeatCount == calculatedSeatCount`、生成物/fingerprint整合性は変更しない。
- この監査ではrelease readinessをYESへ変更しない。

## current 未調査queue

未調査4件はすべてOPTIONAL record-only/non-blocking（国立劇場大劇場/小劇場、帝国劇場、味の素スタジアム）。MUST未調査0、SHOULD未調査0で、active research queueはない。

### 1. Luna STANDARD（残り0件）

LUNA-STD-2で `theater-g-rosso` はPRODUCTION、`imm-theater` と `nissho-hall` は正式HOLD。残りのLuna STANDARD queueはない。

### 2. Terra DENSE（残り0件）

`TERRA-DENSE-1`〜`TERRA-DENSE-4`で12件すべて正式disposition済み。active Terra queueは0件であり、完了済みmacroを再度activeとして扱わない。

### 3. Sol COMPLEX（残り0件）

MUST: 0件。`tokyo-dome` はTOKYO-DOME COMPLEXで正式HOLD。
SHOULD: `ex-theater-roppongi`, `zepp-haneda`, `zepp-shinjuku` はSOL-SHOULD-1、`toyosu-pit`, `otemachi-mitsui-hall`, `mon-takanawa-box1000` はSOL-SHOULD-2、`hulic-hall-tokyo`, `forum-b7` はSOL-SHOULD-3で正式HOLD。active queueは0件。

Record-only/currentness hold: `ajinomoto-stadium`, `national-theatre-large`, `national-theatre-small`, `teikoku-theatre`。閉館/用途依存のためactive queueへ入れず、公式再開・公演利用の新証拠が出た時に再分類する。

## bounded macro案

`LUNA-STD-1`、`LUNA-STD-2`、`TERRA-DENSE-1`〜`TERRA-DENSE-4`、`SOL-CPLX-1`、`TOKYO-DOME COMPLEX`は完了済み。historical resultは保持するがactive macroではない。TOKYO-DOME COMPLEXは正式HOLD、production増加0、MUST phaseを閉じた。

Terra active queueは0件。MUST/SHOULD active research queueも0件。SOL-SHOULD-1/2/3は完了し、SHOULD researchは28/28。次はrepo-derived nonproduction addressable 4件のconversionを一つのbounded macroで閉じる。

1. `SOL-SHOULD-1`（完了）: `ex-theater-roppongi`, `zepp-haneda`, `zepp-shinjuku`。3件ともB_SOURCE_LIMITEDで正式HOLD。
2. `SOL-SHOULD-2`（完了）: `toyosu-pit`, `otemachi-mitsui-hall`, `mon-takanawa-box1000`。3件ともB_SOURCE_LIMITEDで正式HOLD。
3. `SOL-SHOULD-3`（完了）: `hulic-hall-tokyo`, `forum-b7`。2件ともB_SOURCE_LIMITEDで正式HOLD。
4. `TOKYO-ADDRESSABLE-CONVERSION-1`: `jcom-hall-hachioji`, `musashino-civic-main`, `national-noh-theatre`, `nissho-hall`のみ。これがcurrent repo stateの未production addressable全件。

### 2026-08-12 `TOKYO-CONFIG-PILOT-1` / 明治座 result

schema v2 real-venue pilotは成功した。現行公式資料を再確認し、`meijiza-standard`を一会場・二configurationへ移行した。`花道あり`は1F 834 + 2F 390 + 3F 144 = 1,368席、`花道なし`は1F 914 + 2F 390 + 3F 144 = 1,448席。両方とも公式PDFからの第1パスと、現行公式floor imageからの独立第2パスが完全一致し、configurationごとの`rangeDiff = 0`、`expected == calculated`、`verified`、未解決issue 0でproduction/selectableになった。80席差は公式図上の`1階1～20列7～10番`だけであり、repository側の差分創作はない。

2階左右コーナーの車いすスペースは、現行公式seat pageが2階390番号席を全て表示した上で番号席block外へ別の無番号アイコンとして表示し、barrier-free guideも同じ左右コーナーを恒久spaceとして案内する。番号席撤去・置換は公式資料に定義されないため、変換configurationを創作せず、二つの固定番号configurationに共通する`officialNonSelectableScope`として記録した。これにより固定番号集合の完全性は損なわれない。

会場単位では明治座を1件だけ加算し、Tokyo user-visible productionは9/76、MUSTは5/44。以下はpilot完了時のhistorical snapshotであり、後続fresh reviewsによりcurrent schema-addressable/taxonomyは更新済み。明治座の2configurationは会場を二重計上しない。

pilot時点では残るAを11件として上記4 macroへ分割した。このrolloutは全て完了し、current A cohortは0件。後続のSHOULD 8件research phaseもSOL-SHOULD-3まで完了し、SHOULDは28/28 formal disposition済み。

### 2026-08-12 `TOKYO-CONFIG-SCHEMA-1` implementation result

schema v2、schema v1 single-configuration adapter、configuration-level production validation、`(venueId, configurationId)` runtime key、`venueGroupId` grouping、複数configuration選択UI、fixed-only disclosure、決定論的Tokyo release gateを実装した。既存60 production source、catalog、runtime detail、fingerprintは変更していない。legacy regional shortfallはinformational metricとして保持するが、最終`RELEASE READY`をblockしない。coverage JSONの手動`releaseReady` flagもauthorityから除外し、reporterがrepo stateから各gateをderiveする。

rolloutは次の順に固定する。

1. `TOKYO-CONFIG-SCHEMA-1`（完了）
2. `TOKYO-CONFIG-PILOT-1` — A SCHEMA-UNLOCKABLE 1会場
3. pilot成功後、A cohortをbounded batchesでconversion
4. その後SHOULD 8件research（SOL-SHOULD-1/2完了、残り2件）
5. addressable candidatesをすべてproduction gateへ
6. `TOKYO RELEASE COVERAGE ADEQUACY REVIEW`
7. release decision

pilotは`meijiza`を推奨する。既存issuer evidenceが花道あり1,368席／花道なし1,448席の二つの完全な固定番号configurationと各公式PDF・実運用例を明示しており、単一representative制約を直接検証できるためである。pilotでは既存のwheelchair semanticsをconfiguration単位で再確認し、未解決なら該当configurationをnon-selectableに保ち、gateを緩和しない。

上記はschema macro完了時のhistorical next actionであり、`TOKYO-CONFIG-PILOT-1`は完了済み。

### 2026-08-12 `TOKYO-CONFIG-A-CURRENT-1` taxonomy correction / `TOKYO-CONFIG-A-ARENA-1` result

Forum Aはnormal configurationとpit/thrust/wheelchairの番号対応がissuer evidenceにないため、NNTT Operaは1,806番号席をlosslessなarea/rowへ結ぶissuer-owned keyがないため、いずれもschemaだけでは解決できない。`A_SCHEMA_UNLOCKABLE`から`B_SOURCE_LIMITED`へ移した。gateを下げるための除外ではない。

arena 3件は固定席scopeそのものをissuer-definedとして確認したが、全件で現行公式のexact subtotalと現行番号集合が矛盾した。代々木第一は8,636対8,655（+19）、代々木第二は2,803対2,818（+15）で、第1/独立第2パスのrangeDiffは0。東京体育館は固定5,178・車いす/floor分離・source generationを解決した一方、2F北Cブロックが印字316対番号集合317（+1）で、現行北側PDFと現行公式バリアフリー詳細図の独立2パスが同じ矛盾を再現した。capacity fittingせず3件を`C_CONTRADICTION`へ再分類し、production増加は0。

ARENA-2完了時のsnapshotは **A3 / B26 / C7 / D3**、schema-addressable Tokyo **16/76**、MUST **8/44**、SHOULD **8/28**。これは後続THEATRE-1以前のhistorical stateである。

### 2026-08-12 `TOKYO-CONFIG-A-ARENA-2` result

3件ともfresh issuer-owned fixed-only reviewで **B_SOURCE_LIMITED**。有明アリーナは固定席2F 2,734＋3F 4,408＋4F 4,090＝11,232と動的除外scopeを公式確認したが、全固定番号と車いす／随行者／付加アメニティー番号対応が未公開。Kanadevia Hallは3固定バルコニー447＋478＋440＝1,365の公式番号図があるが、issuerはバルコニーのみを独立利用configurationとして定義せず、車いす・同伴と認証後Seat Plan generationも未公開。SGC HALL ARIAKEは1F 1,720＋上層固定scope 2,047＝3,767を公式確認したが、上層各rowの全番号、固定番号席だけのissuer condition、車いす4＋同伴4の恒久番号対応がない。

いずれもproduction gate前に停止し、ranges 0。expected/calculated/rangeDiffは、有明11,232/null/null、Kanadevia 1,365/null/null、SGC null/null/null。production増加0で61 venues / 62 selectable configurations / 84,331 records、Tokyo 9/76、MUST 5/44を維持する。詳細は `data/venue-reports/tokyo-config-a-arena-2-2026-08-12.json`。

上記はARENA-2完了時のhistorical next actionであり、`TOKYO-CONFIG-A-THEATRE-1`は完了済み。

### 2026-08-12 `TOKYO-CONFIG-A-THEATRE-1` result

`ex-theater-ariake`は **B_SOURCE_LIMITED**。最大1,546席図を最大着席configuration候補として評価し、normal/defaultでないことはreject理由にしなかったが、車いすspaceの包含・置換番号、可動前方席の全装着条件、pit／張出し／花道との差分番号をissuer資料からlosslessに確定できない。

`nntt-playhouse`は **schema v2 PRODUCTION**。issuer-definedプロセニアム形式③ A・B号迫り使用は公式expected 906に対し、全番号2パスも1F 719 + 2F 187 = 906、rangeDiff 0。最大8席の車椅子spaceは「上記のほか」の無番号scopeとして分離した。A・B・C号迫り使用の788/791/0 contradictionは非selectableに残し、完全なAB configurationを巻き添えにしなかった。`galaxy-theatre`は **C_CONTRADICTION**。通常図はexpected 746に対し、現行HTML画像と公式PDFの独立2パスが750で一致（rangeDiff 0、+4；1F 516、2F 113対公式101、3F 121対公式129）。

production増加は1 venue / 1 selectable configuration / 906 records。current taxonomyは **A0 / B27 / C8 / D3**。raw production floorはMUST **6/44**、SHOULD **8/28**、Tokyo **14/76**。addressable conversion progressはMUST **6/6**、SHOULD **4/8**、全体 **10/14**。

### 2026-08-13 `SOL-SHOULD-1` result

`ex-theater-roppongi`、`zepp-haneda`、`zepp-shinjuku` は、current issuer/operator-owned evidenceを会場ごとに独立確認し、すべて **B_SOURCE_LIMITED** で正式HOLDとした。EX THEATER ROPPONGIは公式着席920を確認したが、undated座席図のsource generationと無番号車いすspaceの包含・置換番号・同伴mappingが未解決。Zepp Hanedaは基本着席configurationを **1,207/1,207/rangeDiff 0**、Zepp Shinjukuは公式椅子使用時のB4F番号席subsetを **530/530/0** まで第1パス／独立第2パスで一致させたが、両館ともbarrier-free配置・車いす／同伴の恒久置換番号が催事依存で非公開である。repository独自configuration、capacity fitting、geometry inferenceは行っていない。

production増加は0 venue / 0 selectable configuration / 0 records。productionは **62 venues / 63 selectable configurations / 85,237 records** のまま。research completenessはTokyo **67/76 = 88.2%**、SHOULD **23/28 = 82.1%**。raw production floorはMUST **6/44**、SHOULD **8/28**、Tokyo **14/76**、addressable conversion progressはMUST **6/6**、SHOULD **4/8**、全体 **10/14** で不変。詳細は `data/venue-reports/tokyo-sol-should-1-2026-08-13.json`。

### 2026-08-13 `SOL-SHOULD-2` result

`toyosu-pit`、`otemachi-mitsui-hall`、`mon-takanawa-box1000` は、current issuer/operator-owned evidenceを会場ごとに独立確認し、すべて **B_SOURCE_LIMITED** で正式HOLDとした。

- 豊洲PITは公式着席1,328（椅子1,325＋車いす3）とstanding 3,103を確認したが、1F floorはstanding／seated／mixedの催事別仮設配置で、全番号図はなく車いす対応も主催者確認。expected/calculated/rangeDiffは **1,328/null/null**。
- 大手町三井ホールはcurrent download pageの2026-05-29 generationから、560席配置を **560/560/0**、フラット572席配置を **572/572/0** で全番号2パス一致した。issuer-defined complete configurationであることは満たすが、車いす位置・番号席の包含／置換・同伴席が非公開。
- MoN Takanawa BOX1000はcurrent公式着席例をA 182＋B 402＋C 216＋E 248＝1,048として **1,048/1,048/0** で全番号2パス一致した。公演別変更可能という注記だけではrejectしなかったが、車いす位置・1,048への包含・置換番号・同伴席が非公開。旧候補値1,200は現行公式最大着席数ではないため1,048へ訂正した。

production増加は0 venue / 0 selectable configuration / 0 records。productionは **62 venues / 63 selectable configurations / 85,237 records** のまま。research completenessはTokyo **70/76 = 92.1%**、SHOULD **26/28 = 92.9%**。新たなschema-addressable判定はないため、raw production floorはMUST **6/44**、SHOULD **8/28**、Tokyo **14/76**、addressable conversion progressはMUST **6/6**、SHOULD **4/8**、全体 **10/14** で不変。詳細は `data/venue-reports/tokyo-sol-should-2-2026-08-13.json`。

### 2026-08-13 `SOL-SHOULD-3` result

`hulic-hall-tokyo`、`forum-b7` は、current issuer/operator-owned evidenceを会場ごとに独立確認し、ともに **B_SOURCE_LIMITED** で正式HOLDとした。

- ヒューリックホール東京はcurrent-linked公式固定席図からB 16、C 30、D〜BB 800、CC 20、DD 20の計886を **886/886/rangeDiff 0** で全番号2パス一致。車いす転換はJ列2・3・32・33番撤去、最大2台まで公式確認したが、companion配置が非公開。舞台による876/856席は見切れ例であり、未定義variantを恒久configuration化していない。
- 東京国際フォーラムB7は1,400㎡の可変平土間とシアター1,200人例を公式確認。公式自身が人数を目安とし、PDFの仮設椅子には列／席番号がない。厳密expected、complete numbered-seat set、wheelchair／companion転換がないため **null/null/null**。

production増加は0 venue / 0 selectable configuration / 0 records。productionは **62 venues / 63 selectable configurations / 85,237 records** のまま。research completenessはTokyo **72/76 = 94.7%**、SHOULD **28/28 = 100.0%**。新たなschema-addressable判定はなく、raw production floorはMUST **6/44**、SHOULD **8/28**、Tokyo **14/76**、addressable conversion progressはMUST **6/6**、SHOULD **4/8**、全体 **10/14** で不変。未production addressable全IDは `jcom-hall-hachioji`、`musashino-civic-main`、`national-noh-theatre`、`nissho-hall`。詳細は `data/venue-reports/tokyo-sol-should-3-2026-08-13.json`。

**Exact next action:** `TOKYO-ADDRESSABLE-CONVERSION-1` を `jcom-hall-hachioji`、`musashino-civic-main`、`national-noh-theatre`、`nissho-hall` のみで実行する。前2件は **Terra high**、後2件は **Sol high**。adequacy review自体にはまだ着手しない。

### 2026-08-13 `TOKYO-ADDRESSABLE-CONVERSION-1A` result

`jcom-hall-hachioji` と `musashino-civic-main` を、既存の addressable 判定に依存せず current issuer/operator-owned evidence から再審査した。両方とも **B_SOURCE_LIMITED**。production / selectable の増加は **0 venue / 0 configuration / 0 records** で、production は **62 venues / 63 selectable configurations / 85,237 records** のまま。

- J:COMホール八王子は現行の施設・座席案内と2枚の公式座席図で固定席 **1,869**、最大 **2,021** を確認した。しかし車椅子有無で階別総数が変化し、ピット時の使用不可席と可倒席も併記する一方、車椅子／同伴・可倒席の完全な番号対応がない。よって unique selectable configuration、独立 range pass、`expected == calculated`、`rangeDiff 0` を作らない。
- 武蔵野市民文化会館 大ホールは現行ページ・番号座席図で固定席 **1,252**（1F 912 + 2F 340）、車椅子 **4** を確認した。だが別現行の技術客席図は車椅子・着脱・背もたれ記号に番号対応を示さず、barrier-free pageも4席だけを確認する。独立第2パスの全ID／車椅子意味／`rangeDiff` は確定できないため、番号を補完しない。

この fresh evidence により canonical addressable cohort とrepo-derived raw production floorは MUST **6/44**、SHOULD **6/28**、Tokyo **12/76** に再計算された。これはcurrent confirmed addressableを全件production化する既存定義に従ったもので、issuer-owned evidenceなしにgateを下げてはいない。addressable conversion progress は MUST **6/6**、SHOULD **4/6**、total **10/12**。remaining nonproduction addressable IDs は `national-noh-theatre` と `nissho-hall` のみ。詳細は `data/venue-reports/tokyo-addressable-conversion-1a-2026-08-13.json`。

**Exact next action:** `TOKYO-ADDRESSABLE-CONVERSION-1B` を `national-noh-theatre`、`nissho-hall` のみで **Sol high** として実行する。adequacy reviewには着手しない。

### 2026-08-13 `TOKYO-ADDRESSABLE-CONVERSION-1B` result

`national-noh-theatre` と `nissho-hall` を既存addressable判定から独立してfresh current issuer/operator-owned evidenceで再審査し、両方を **B_SOURCE_LIMITED** とした。production/selectable増加は **0 venue / 0 configuration / 0 records**、productionは **62 venues / 63 selectable configurations / 85,237 records** のまま。

- 国立能楽堂は現行公式座席図と施設案内で正面245・脇正面190・中正面156・GB36＝**627**、中正面可動6席、2026公演での車椅子スペース利用を確認した。しかし車椅子スペースの627席への包含・置換番号・同伴席・中正面可動6席との関係が未公表で、完全なconfigurationと独立source generationを確定できない。production値は **627/null/null**。
- ニッショーホールは現行公式客席図と独立の公式音響客席回路図から、full図の一般番号席 **999/999/rangeDiff 0**（1F一般671＋車椅子1、2F一般328、合計1,000）を全番号一致した。1F8列2番は車椅子スペースとして常時外される。一方、3-4番／5-6番を2席ずつ外すvariantについてissuer-defined condition・用途・厳密expectedがなく、車椅子同伴席も未公表。full図や997/995席variantをrepository側で標準configurationとして創作しない。

fresh evidence後のschema-addressableとrepo-derived raw production floorはMUST **6/44**、SHOULD **4/28**、Tokyo **10/76**。addressable conversionはMUST **6/6**、SHOULD **4/4**、total **10/10 = 100%**。全nonproduction addressableは **0件**。`RELEASE READY: NO`はadequacy review未完了により維持する。詳細は `data/venue-reports/tokyo-addressable-conversion-1b-2026-08-13.json`。

**Exact next action:** `TOKYO RELEASE COVERAGE ADEQUACY REVIEW`。本macroではreview自体に着手していない。

## source discipline

公式施設ページ・公式座席図・運営者/所有者・現行公演issuerの公式資料のみを座席構造・席数・currentnessの根拠として採用した。Tokyo Dome macroでは一般サイト、過去公演非公式map、capacity fittingを一切使用していない。座席mapが公演依存・可変・車椅子/ピット変換を含む場合は、番号を推測せず `COMPLEX`/`Sol` またはHOLDへ送る。
