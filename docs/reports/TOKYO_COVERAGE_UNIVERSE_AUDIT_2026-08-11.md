# Tokyo coverage universe audit

初回確認日: 2026-08-11（Asia/Tokyo）
current snapshot更新: 2026-08-12（TOKYO-CONFIG-PILOT-1完了後）
canonical inventory: [data/venue-coverage/tokyo-coverage-universe-2026-08-11.json](../../data/venue-coverage/tokyo-coverage-universe-2026-08-11.json)

この文書は2026-08-11のuniverse監査結果を起点とする。過去macroの結果はhistorical recordとして保持するが、件数・active queue・Exact next actionは上記canonical inventoryの現在値を用いる。

## 監査結果

東京の主要な座席指定型エンターテインメント会場を、既存inventoryのcurated target数から切り離して、公式施設ページ・公式座席ページ・東京都の施設リストを突合する候補universeとして再構築した。

| 指標 | 件数 |
|---|---:|
| Tokyo候補総数 | 76 |
| PRODUCTION | 9 |
| HOLD | 53 |
| CONTRADICTION | 2 |
| 未調査 | 12 |
| MUST | 44 |
| SHOULD | 28 |
| OPTIONAL | 4 |

現在のMUST内訳は PRODUCTION 5、HOLD 37、CONTRADICTION 2、未調査 0。MUST 44件はすべてformal disposition済みだが、ユーザーが抽選できるMUSTは5件だけである。SHOULD内訳は PRODUCTION 4、HOLD 16、未調査 8。OPTIONAL未調査は4でnon-blocking。formal dispositionは調査工程の完了であり、user-visible coverageの完了ではない。release readinessはNOのまま。

## coverage指標の分離

| 指標 | Tokyo universe | MUST | SHOULD | OPTIONAL |
|---|---:|---:|---:|---:|
| Research completeness | 64/76 = **84.2%** | 44/44 = **100.0%** | 20/28 = **71.4%** | 0/4 = **0.0%** |
| User-visible production coverage | 9/76 = **11.8%** | 5/44 = **11.4%** | 4/28 = **14.3%** | 0/4 = **0.0%** |
| Confirmed schema-addressable coverage | 24/76 = **31.6%** | 16/44 = **36.4%** | 8/28 = **28.6%** | 0/4 = **0.0%** |

- `Research completeness` は `PRODUCTION / HOLD / CONTRADICTION` のformal disposition率であり、抽選可能率ではない。
- `User-visible production coverage` はproduction catalogへ入って実際に抽選できる候補だけを数える。アプリ全体の61会場中、Tokyo coverage universeに該当する主要会場は9件である。
- `Schema-addressable coverage` は既存PRODUCTION 9件、現行schemaで処理可能と確認できる非production 5件、合理的なmulti-configuration / fixed-only拡張で処理可能性が高い非production 10件の計24件。未調査12件と、追加issuer evidenceが必要な候補は安全側で分子に含めない。
- schema-addressableはproduction確約ではない。各configurationに完全なissuer-owned番号図・厳密総数・条件・wheelchair semanticsが揃い、従来どおり二つの独立公式source passと`expectedSeatCount == calculatedSeatCount`を通る必要がある。

### 件数のhistorical snapshot

| 時点 | PRODUCTION | HOLD | CONTRADICTION | 未調査 | MUST未調査 | SHOULD未調査 |
|---|---:|---:|---:|---:|---:|---:|
| LUNA-STD-2完了時 | 8 | 38 | 2 | 28 | 16 | 8 |
| TERRA-DENSE-1〜4完了時 | 8 | 50 | 2 | 16 | 4 | 8 |
| SOL-CPLX-1完了後 | 8 | 53 | 2 | 13 | 1 | 8 |
| TOKYO-DOME COMPLEX完了後 | 8 | 54 | 2 | 12 | 0 | 8 |
| **TOKYO-CONFIG-PILOT-1完了後（current）** | **9** | **53** | **2** | **12** | **0** | **8** |

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
| 東京ドーム | HOLD（`tokyo-official-0319`） | MUST | 公開stand番号図は野球開催時用。concert arenaは催事別・非掲載で、stage別stand閉鎖、floor仮設番号、車いす／同伴、suite／premium／special areaを含むstandard concert setがない。 |

## TOKYO-DOME COMPLEX 結果

- **SOURCE/POLICY/SCHEMA HOLD**。現行施設概要は多目的施設として一般収容55,000人と野球時約43,500人を分けて示す。公開座席案内と公式FAQは、番号付きstand図を野球開催時用とし、コンサート／イベントのarena席は催事ごとに異なるため非掲載と明記する。
- 第1パスは現行施設概要、座席案内、野球ダイヤモンドを前提とする2023改定座席表、2026年巨人戦座席図、FAQを確認し、代表pattern gateで停止した。野球用stand seat IDをconcertへ転用せず、fixed standsだけを独自代表化しなかった。
- 独立第2パスは主催者案内、巨人公式戦専用の車いす30席・付添2名運用、現行concert scheduleからリンクされた2026年公演issuer資料を確認した。現行公演でも照明機材配置確定後の機材席開放、注釈付指定席、stage-side席が公演単位で販売され、全公演共通の番号setを示さない。
- issuer-owned standard/normal concert configuration、arena/floor恒久番号、stage別固定stand不使用番号、movable/temporary/supplementary席、concert時の車いす／同伴、THE SUITE TOKYO・premium/special areaの包含・番号対応は未公表。expected/calculatedは`null`/`null`、ranges 0、range diff `null`、production増加0。

## MUST phase close

- **Historical pre-Meijiza snapshot:** MUST 44件の最終dispositionは **PRODUCTION 4 / HOLD 38 / CONTRADICTION 2 / 未調査 0**。
- This historical snapshot predates `TOKYO-CONFIG-PILOT-1`. Current MUST disposition is **PRODUCTION 5 / HOLD 37 / CONTRADICTION 2 / 未調査 0**; the five production venues include `meijiza` in addition to `line-cube-shibuya`、`suntory-hall-main`、`theater-milano-za`、`sunshine-theatre`。
- 初回universe監査と後続macroでライブ／コンサート、arena/dome、商業舞台、ミュージカル、2.5次元・声優系、地域clusterを照合し、現時点で明らかなMUST級会場漏れは確認されない。既存MUST HOLDは再調査していない。

## MUST非production 40件のblocker再分類

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

限定的に可とする。対象は、固定席subsetがissuer evidence上で独立したseat setとして成立し、全番号・厳密総数・除外範囲・wheelchair semanticsを完全に確認できる場合だけである。候補例は代々木第一／第二の固定席、東京体育館の固定席、Kanadevia Hallの固定バルコニー、SGC HALL ARIAKEの固定上層席である。

UIは「固定スタンド席configurationのみ」「アリーナ／floor席を含まない」「最大収容配置ではない」を会場選択時と抽選結果に明示する。単に図から固定席が読める、固定席数だけが公表される、またはevent floorを除けば合計が合う、という理由だけでは採用しない。東京ドームはconcert用途の固定stand subsetのexact count・stage別使用範囲がissuerにより独立定義されていないため、この救済対象にしない。

## Option Bとmigration方針

**Option Bを推奨する。** 既存evidenceだけでMUST 10件、SHOULD 1件、計11件にschema拡張によるproduction化可能性がある。schema migrationだけでTokyo production候補は8件から最大19件へ増え得る。その後、現行schemaでaddressableな5件を完了すれば確認済みaddressable cohortは24件になる。

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

Rollout順序は、schema v2 validationとv1 adapter → build/runtime互換 → UI configuration selector/disclosure → fixture/negative tests → 既存60 baseline regression → A群から1会場pilot → bounded batchで残りA群 → その後にSHOULD 8件の順とする。

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

- 大規模ライブ: 東京ドームを含むMUST大規模会場はすべてformal disposition済みだが、current MUST user-visible production coverageは5/44 = **11.4%**に留まる。MUST active research queueが0でもcoverage完了ではない。
- 有明の新設cluster: SGC HALL ARIAKE、EX THEATER ARIAKEは正式inventory/sourceへ登録し、SOL-CPLX-1で公式blocker付きHOLD。未登録gapは解消済み。
- 商業舞台/ミュージカル: 東京宝塚劇場、四季劇場［春］［秋］、電通四季劇場［海］、有明四季劇場、日本青年館、天王洲 銀河劇場、シアターH、東京建物 ぴあ シアター。
- 都心の可変型中規模会場: Kanadevia Hallは正式HOLD。SHOULD未調査はEX THEATER ROPPONGI、Zepp Haneda/Shinjuku、豊洲PIT、ヒューリックホール東京、大手町三井ホール、東京国際フォーラムB7、MoN Takanawa: BOX 1000の8件。
- 既存major HOLD/CONTRADICTION: 東京芸術劇場コンサートホール、東京オペラシティ、日生劇場、明治座、歌舞伎座、東京文化会館、Bunkamura、国立代々木等。これらは「未調査」ではないが、公式blockerを解消しない限りcoverage完了とは扱わない。

## 新しい release-seed-v1 gate

`data/venue-release-targets/release-seed-v1.json` に、旧48 targetをlegacy referenceへ降格し、Tokyo coverage universeを新しい分母とする契約を記録した。

- Research completeness: MUST **100%**、SHOULD **100%**。
- Schema-addressable production conversion: MUST **100%**、SHOULD **100%**。AをHOLDのままrelease免責にしない。
- 現時点のrepo evidenceに基づくraw production floor: MUST **16/44 = 36.4%**、SHOULD **8/28 = 28.6%**、MUST+SHOULD **24/72 = 33.3%**、Tokyo universe **24/76 = 31.6%**。
- 上記floorは任意の目標率ではなく、「既存production + 現行schema addressable + 承認済みschema extension addressable」を全件production化した必要数である。
- SHOULD未調査8件から新たなschema-addressable候補が判明するたび、required numeratorを1件増やす。既存required venueとの置換は認めない。
- OPTIONALはrelease blockerにしない。
- raw denominatorからHOLD/CONTRADICTIONを削除しない。非production免責はB SOURCE-LIMITED、C CONTRADICTION、D CURRENTNESS/CLOSEDのissuer-owned blockerがある場合だけとする。
- multi-configuration / fixed-only supportとuser-facing scope disclosureをrelease必須にする。
- 閉館・長期休館はcurrent active universeから除外するが、再開監視のrecord-only候補として削除しない。
- 明らかな主要会場の候補漏れがないことを、会場数ではなく用途・規模・地域cluster・currentnessで確認する。
- 既存productionの品質gate、二つの公式source pass、`expectedSeatCount == calculatedSeatCount`、生成物/fingerprint整合性は変更しない。
- この監査ではrelease readinessをYESへ変更しない。

## current 未調査queue

未調査12件のうちOPTIONAL record-only/non-blockingは4件（国立劇場大劇場/小劇場、帝国劇場、味の素スタジアム）。MUST未調査は0。SHOULD 8件はresearch queueとして残るが、schema migration完了まで開始しない。

### 1. Luna STANDARD（残り0件）

LUNA-STD-2で `theater-g-rosso` はPRODUCTION、`imm-theater` と `nissho-hall` は正式HOLD。残りのLuna STANDARD queueはない。

### 2. Terra DENSE（残り0件）

`TERRA-DENSE-1`〜`TERRA-DENSE-4`で12件すべて正式disposition済み。active Terra queueは0件であり、完了済みmacroを再度activeとして扱わない。

### 3. Sol COMPLEX（8 deferred件）

MUST: 0件。`tokyo-dome` はTOKYO-DOME COMPLEXで正式HOLD。
SHOULD: `ex-theater-roppongi`, `zepp-haneda`, `zepp-shinjuku`, `toyosu-pit`, `hulic-hall-tokyo`, `otemachi-mitsui-hall`, `forum-b7`, `mon-takanawa-box1000` の8件。可変floor、standing、固定上層席、複数公式layoutを単一representativeへ押し込む再作業を避けるため、全件multi-configuration schema導入後に処理する。

Record-only/currentness hold: `ajinomoto-stadium`, `national-theatre-large`, `national-theatre-small`, `teikoku-theatre`。閉館/用途依存のためactive queueへ入れず、公式再開・公演利用の新証拠が出た時に再分類する。

## bounded macro案

`LUNA-STD-1`、`LUNA-STD-2`、`TERRA-DENSE-1`〜`TERRA-DENSE-4`、`SOL-CPLX-1`、`TOKYO-DOME COMPLEX`は完了済み。historical resultは保持するがactive macroではない。TOKYO-DOME COMPLEXは正式HOLD、production増加0、MUST phaseを閉じた。

Terra active queueは0件。MUST active research queueも0件。SHOULD 8件の実調査は開始せず、historicalな分割案をmigration後のqueueとして保持する。

1. `SOL-SHOULD-1`: `ex-theater-roppongi`, `zepp-haneda`, `zepp-shinjuku`。ライブハウス型のseated/standing、floor可変、上階固定席、車いす、公演別番号を共通gateで確認。
2. `SOL-SHOULD-2`: `toyosu-pit`, `otemachi-mitsui-hall`, `mon-takanawa-box1000`。平土間・大規模event-space型の仮設席、standing、stage、issuer-defined seated layoutを確認。
3. `SOL-SHOULD-3`: `hulic-hall-tokyo`, `forum-b7`。多目的event hall型の公式番号図／着席layoutと可変stage・販売variantを確認。

### 2026-08-12 `TOKYO-CONFIG-PILOT-1` / 明治座 result

schema v2 real-venue pilotは成功した。現行公式資料を再確認し、`meijiza-standard`を一会場・二configurationへ移行した。`花道あり`は1F 834 + 2F 390 + 3F 144 = 1,368席、`花道なし`は1F 914 + 2F 390 + 3F 144 = 1,448席。両方とも公式PDFからの第1パスと、現行公式floor imageからの独立第2パスが完全一致し、configurationごとの`rangeDiff = 0`、`expected == calculated`、`verified`、未解決issue 0でproduction/selectableになった。80席差は公式図上の`1階1～20列7～10番`だけであり、repository側の差分創作はない。

2階左右コーナーの車いすスペースは、現行公式seat pageが2階390番号席を全て表示した上で番号席block外へ別の無番号アイコンとして表示し、barrier-free guideも同じ左右コーナーを恒久spaceとして案内する。番号席撤去・置換は公式資料に定義されないため、変換configurationを創作せず、二つの固定番号configurationに共通する`officialNonSelectableScope`として記録した。これにより固定番号集合の完全性は損なわれない。

会場単位では明治座を1件だけ加算し、Tokyo user-visible productionは9/76、MUSTは5/44。schema-addressableはmeijizaが非production Aからproductionへ移っただけなので24/76のまま。historical blocker audit A12/B21/C4/D3は保持し、current MUST nonproductionは39件、A11/B21/C4/D3となる。明治座の2configurationは会場を二重計上しない。

残るAは11件。bounded rolloutは `(1) TOKYO-CONFIG-A-CURRENT-1: tokyo-international-forum-a + nntt-opera / Terra high`、`(2) TOKYO-CONFIG-A-ARENA-1: yoyogi-1 + yoyogi-2 + tokyo-gymnasium / Sol high`、`(3) TOKYO-CONFIG-A-ARENA-2: ariake-arena + kanadevia-hall + sgc-hall-ariake / Sol high`、`(4) TOKYO-CONFIG-A-THEATRE-1: ex-theater-ariake + nntt-playhouse + galaxy-theatre / Sol high`とする。SHOULD 8件はA cohort後まで開始しない。

### 2026-08-12 `TOKYO-CONFIG-SCHEMA-1` implementation result

schema v2、schema v1 single-configuration adapter、configuration-level production validation、`(venueId, configurationId)` runtime key、`venueGroupId` grouping、複数configuration選択UI、fixed-only disclosure、決定論的Tokyo release gateを実装した。既存60 production source、catalog、runtime detail、fingerprintは変更していない。legacy regional shortfallはinformational metricとして保持するが、最終`RELEASE READY`をblockしない。coverage JSONの手動`releaseReady` flagもauthorityから除外し、reporterがrepo stateから各gateをderiveする。

rolloutは次の順に固定する。

1. `TOKYO-CONFIG-SCHEMA-1`（完了）
2. `TOKYO-CONFIG-PILOT-1` — A SCHEMA-UNLOCKABLE 1会場
3. pilot成功後、A cohortをbounded batchesでconversion
4. その後SHOULD 8件research
5. addressable candidatesをすべてproduction gateへ
6. `TOKYO RELEASE COVERAGE ADEQUACY REVIEW`
7. release decision

pilotは`meijiza`を推奨する。既存issuer evidenceが花道あり1,368席／花道なし1,448席の二つの完全な固定番号configurationと各公式PDF・実運用例を明示しており、単一representative制約を直接検証できるためである。pilotでは既存のwheelchair semanticsをconfiguration単位で再確認し、未解決なら該当configurationをnon-selectableに保ち、gateを緩和しない。

上記はschema macro完了時のhistorical next actionであり、`TOKYO-CONFIG-PILOT-1`は完了済み。

**Historical next action (completed):** `TOKYO-CONFIG-A-CURRENT-1` processed only `tokyo-international-forum-a` and `nntt-opera` with Terra high. It closed Forum A as POLICY HOLD and NNTT Opera Palace as SOURCE HOLD before range entry; see `data/venue-reports/tokyo-config-a-current-1-2026-08-12.json`.

**Exact next action:** `TOKYO-CONFIG-A-ARENA-1`を`yoyogi-1`、`yoyogi-2`、`tokyo-gymnasium`の3会場だけ、**Sol high**で実行する。今回の2件はproduction conversionにならず、A/addressability denominatorを変更する新しいissuer evidenceも生じなかったため、bounded arena macroをそのまま次にする。

## source discipline

公式施設ページ・公式座席図・運営者/所有者・現行公演issuerの公式資料のみを座席構造・席数・currentnessの根拠として採用した。Tokyo Dome macroでは一般サイト、過去公演非公式map、capacity fittingを一切使用していない。座席mapが公演依存・可変・車椅子/ピット変換を含む場合は、番号を推測せず `COMPLEX`/`Sol` またはHOLDへ送る。
