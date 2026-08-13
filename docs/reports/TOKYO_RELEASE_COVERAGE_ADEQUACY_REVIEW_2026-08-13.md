# TOKYO RELEASE COVERAGE ADEQUACY REVIEW

Reviewed: 2026-08-13 (Asia/Tokyo)

Model: Sol high

Canonical universe: `data/venue-coverage/tokyo-coverage-universe-2026-08-11.json`

## Decision

**`ADEQUACY FAIL`**

Addressable conversionは **10/10 = 100%** だが、これは「現在losslessにproduction化できる候補を全件変換した」ことだけを示す。主要東京会場のuser-visible utilityを十分にしたことは示さない。

## Current coverage

| Metric | Current |
|---|---:|
| Tokyo user-visible production | 10/76 = **13.2%** |
| MUST production | 6/44 = **13.6%** |
| SHOULD production | 4/28 = **14.3%** |
| MUST/SHOULD research | 44/44、28/28 = **100%** |
| Schema-addressable | production 10、nonproduction 0 |
| Raw floor | MUST 6/44、SHOULD 4/28、MUST+SHOULD 10/72、Tokyo 10/76 |
| Addressable conversion | 10/10 = **100%** |

Review用の規模帯をlarge 3,000席以上、medium 1,000〜2,999席、small 1,000席未満としてutilityを比較した。これは新しいproduction gateではない。

| Population | Large | Medium | Small |
|---|---:|---:|---:|
| Canonical production 10 | 0 | 5 | 5 |
| Tokyo production全53 | 0 | 12 | 41 |

## Product-utility findings

- 大規模ライブ / arena / dome: **不足**。canonical productionはdome 0、arena 0、3,000席以上0。東京ドーム、日本武道館、有明アリーナ、代々木、東京ガーデンシアター等がすべてnonproductionで、代替できるuser-visible optionがない。
- コンサートホール: **部分的に実用的**。サントリーホール、LINE CUBE SHIBUYA、浜離宮朝日ホール、有楽町朝日ホール、RISURUがある。東京芸術劇場、オペラシティ、NHKホール、東京文化会館等の欠落は大きいが、用途自体は空ではない。
- 商業演劇 / musical / 2.5次元: **部分的に実用的**。明治座、NNTT中劇場、THEATER MILANO-Za、サンシャイン劇場、Gロッソがある。一方、東京宝塚、四季4館、シアターオーブ、ACT、歌舞伎座、日生、Brillia等の高需要MUSTが欠落する。
- 中規模ライブハウス: **不足**。Zepp、EX THEATER、豊洲PITは全件nonproductionで、このuse caseにproduction選択肢がない。
- その他主要座席指定イベント: **実用性あり**。全Tokyo production 53件には多数の市民ホール、小劇場、classical/lecture venueがあり、small/mediumの一般利用は広い。
- 地域cluster: 都心主要エリアと多摩はproduction選択肢がある。主要湾岸Ariake/Odaiba/Toyosuはcanonical production 0で明白な空白。羽田もZeppがHOLDで、south-bay live utilityがない。

38件のMUST nonproductionは単なるlong tailではない。東京ドーム、日本武道館、有明アリーナ、国際フォーラムA、NHKホール、宝塚、四季等が含まれ、一般ユーザーの検索期待への影響が大きい。したがって13.6%という率とは独立に、欠落の構成がrelease adequacyを阻害する。

## HOLD taxonomy quality

Current MUST nonproductionは **38 = A0 / B27 / C8 / D3**。

- FreshなA→B/C再分類は、完全番号、厳密expected、wheelchair/companion、configuration条件のissuer-owned不足、または再現可能なexact contradictionに結び付いている。1A/1Bを含め、release都合で一括してBへ広げた証拠はない。
- Cの主要新規3 arenaは+19 / +15 / +1、銀河劇場は+4の具体的矛盾を独立passで再現しており、capacity fittingを避けた判断は妥当。
- Dは休館・改修・営業期限を理由とし、current production evidenceとして使わない判断は妥当。
- ただしsafe HOLDとしての妥当性と、positive coverage claimを支えるaudit packagingは別である。`nippon-budokan`、`nihombashi-mitsui`、`shinbashi-enbujo`、`bunkamura-orchard`はlocal source JSONがなく、さらに8 draft sourceで`verification.checkedAt`が未設定。これらはproduction化を許す理由にはならないが、bounded remediationで優先度に応じて正規化すべきである。

## Critical coverage gaps

| Priority | Venue ID | Tier / use case | Current blocker | Why critical | Current evidence | New official material potential |
|---:|---|---|---|---|---|---|
| 1 | `tokyo-dome` | MUST / dome・largest live | Baseball-only stand map。concert floor、stage閉鎖、wheelchair、special areaがevent-dependent | 最頻度級の検索対象で、dome/arena 0を象徴 | 解決不能 | Low。issuer-defined concert configurationが必要 |
| 2 | `nippon-budokan` | MUST / iconic large arena | 固定stand全番号とexact fixed totalの完全照合なし。local source artifactも未整備 | 主要東京live claimで極めて目立つ欠落 | 解決不能 | Moderate。現行technical/accessibility資料に改善余地 |
| 3 | `ariake-arena` | MUST / large arena・湾岸 | fixed 11,232 subtotalはあるが全row/番号とaccessibility mappingなし | largeと主要湾岸の2 gapを同時に埋め得る | 解決不能 | Low–moderate。新しい詳細issuer資料が必要 |
| 4 | `zepp-haneda` | SHOULD / medium live-house・羽田 | 1,207/1,207/0は一致、wheelchair/companion置換がevent-dependent | medium live-house 0とsouth-bay gapを代表 | 解決不能 | Moderate。残blockerが比較的狭い |
| 5 | `tokyo-takarazuka` | MUST / flagship commercial musical | 2,079席図はあるがwheelchair包含・置換番号なし | categoryは部分coverage済みだがflagship omissionが大きい | 解決不能 | Moderate。accessibility/technical planに改善余地 |

## Product claim and release gate

現状を「公式資料で検証できた厳選会場を収録」と明示することは正確だが、「主要な東京会場をかなり網羅した座席抽選サイト」とするのは不整合。large selectionが0の不足はscope disclosureだけでは許容できない。

`venues:release:coverage`の再計算結果は **Coverage gate FAIL / RELEASE READY NO**。production data、catalog、runtime、fingerprintsは変更しておらず、releaseもdeployも実行していない。次は`RELEASE-SEED-V1 FINAL RELEASE AUDIT`ではない。

## Validation

JSON parsing、`venues:inventory:report`、`venues:readiness:report`、`venues:release:coverage`、`venues:build`、`venues:check`、`venues:validate`、`venues:report`、lint、typecheck、unit tests（**17 files / 140 tests**）、production build、E2E（**13/13**、sandbox registry EPERM後のapproved elevated Miniflare run）、`git diff --check`がPASS。1B commit `7f533819ae5745ae826cba660c9cd6912f80a815`からproduction sources、generated catalog/runtime、fingerprintsに差分はない。

## Exact next action

**`TOKYO-ADEQUACY-CRITICAL-GAPS-1`** を `nippon-budokan`、`nhk-hall`、`zepp-haneda` の3件だけで実行する。

範囲はofficial-source discoveryとevidence normalizationのみ。issuer-defined complete configuration、wheelchair/companion semantics、exact count、独立current source generationが揃うまでseat range transcriptionを始めない。新資料がなければHOLDを維持し、広いresearch waveへ拡大しない。macro後にadequacy reviewを再実施し、releaseはまだ行わない。
