# Current save state

Updated: 2026-08-24 (Asia/Tokyo)

## Current state

The Opus hard-case phase is closed with TOKYO-WAVE-23. Do not open TOKYO-WAVE-24.

| Item | Value |
| --- | --- |
| Wave23 data commit (deployed & verified) | `6414ebc` |
| Final HEAD / `origin/main` | this docs-only closure commit on top of `6414ebc`; `main == origin/main`, tree clean |
| Production venues | **115** |
| Selectable configurations | **117** |
| Configuration-seat records | **174,459** |
| Tokyo coverage | **47/76 (61.8%)** |
| MUST | **29/44 (65.9%)** |
| SHOULD | **18/28 (64.3%)** |
| RELEASE READY | **yes** |

### Hard cases resolved by the Opus phase (Waves 20-23)

Fourteen holds were converted to production across four waves. Nine of them were not resolved by new issuer material but by disproving or re-reading the recorded blocker.

- **Wave20** (3): 東京芸術劇場 コンサートホール 1,999/1,999/0 · 府中の森芸術劇場 どりーむホール 2,017/2,017/0 · タワーホール船堀 大ホール 757/750/+7.
- **Wave21** (3): 歌舞伎座 1,808/1,808/0 · 新橋演舞場 1,424/1,424/0 · 文京シビックホール 大ホール 1,802/1,802/0. Introduced the display-area policy now in `docs/VENUE_DATA_GUIDE.md`.
- **Wave22** (5): 西新井文化ホール 902/902/0 · セシオン杉並 497/503/-6 · 瑞穂ビューパーク・スカイホール 大ホール 1,000/1,008/-8 · 人見記念講堂 2,070/2,070/0 · 東京オペラシティ コンサートホール 1,622/1,632/-10.
- **Wave23** (2): 国立音楽大学 講堂大ホール **1,290/1,290/rangeDiff 0** · 武蔵野市民文化会館 大ホール **1,252/1,256/rangeDiff -4** (1階912 + 2階340 = the chart's own footnote).

The Wave23 discriminator is worth reusing: **check whether the issuer prints a row label beside each block before attempting any rake reconstruction.** Where it does, block ownership is issuer-defined and no geometric inference is needed; that alone resolved both Wave23 promotions. Where it does not, the hold stands.

### Hard-case inventory after Wave23

Mechanically recounted over all 1,266 inventory items; buckets are mutually exclusive and the definitions live in `data/venue-reports/tokyo-wave-22-2026-08-24.json`.

| Bucket | Count |
| --- | --- |
| **hard case** (evidence-grade hold on an identified current official source) | **39** (Tokyo **18**) |
| type-only DEFERRED | 130 |
| missing-numbered-map | 58 |
| closed / renovation | 15 |
| other-blocked (no recorded reason or unclassified) | 22 |
| blocked total | 264 |
| REJECT | 4 |
| independent-review-mismatch | 2 |
| not-started | 780 |
| source-located | 80 |
| draft-created | 21 |
| production | 115 |

The 39 hard cases split as count-contradiction 7, ownership 4, evidence-hold-other 28. The hard-case count fell 41 → 39 across Wave23; the two Wave23 promotions were both drawn from the ownership bucket, and 小金井宮地楽器ホール and 足立区役所 remain in it untouched.

### Wave23 dispositions

- `tokyo-official-1019` 国立音楽大学〔講堂大ホール〕 — **PRODUCTION**. The chart prints a kana row label on the inner edge of every block (four label columns), so the Wave13 ownership hold does not apply; the transcription totals exactly the published 1,290.
- `tokyo-musashino-civic-main` 武蔵野市民文化会館〔大ホール〕 — **PRODUCTION**. Every block carries a printed row label and the transcription reproduces the chart's footnote 1階912席 / 2階340席 exactly; the -4 against the published 1,256 is the four unnumbered 車椅子席.
- `tokyo-theatre-1010` シアター1010〔劇場〕 — **HOLD**, re-confirmed on evidence. Row labels are printed in one column only, left of the centre block; the right-hand blocks carry none, and because the numbering axis continues across the centre into them the display-area policy cannot represent them either.
- `tokyo-koganei-miyaji-main` 小金井宮地楽器ホール〔大ホール〕 — **NOT ATTEMPTED / NEED EVIDENCE**. Both the registered seat PDF and the facility page returned HTTP 403 to this environment, with and without a browser user agent.
- `tokyo-official-0942` 足立区役所〔庁舎ホール〕 — **NOT ATTEMPTED**. Priority C, reached after the wave's context stop rule; its registered source set still contains no official numbered seat map despite a blocking reason that refers to one.

### Wave history (unchanged records)


- TOKYO-WAVE-22 re-evaluates five residual hard cases against the current production contract instead of their historical holds, and promotes all five. Scope was bounded to these IDs; no new candidate discovery was done. The Wave21 display-area policy was available but none of the five needed it.
  - 西新井文化ホール (`tokyo-wave3-0937/current-official-printed-seat-map`) is **902 mapped / 902 official / rangeDiff 0 / representative**. The Wave17 hold rested on a false premise: it assumed the printed 902 had to be cut to 896 because the chart also names six wheelchair spaces. The chart's own heading table reads 1階客席数480席 (固定席436 + 移動可能席44) and 2階客席数422席, summing to exactly 902, with 車椅子スペース6席 as a separate line outside that arithmetic. The transcription splits 480/422 across the chart's two printed area names, so nothing had to be deleted.
  - セシオン杉並〔ホール〕 (`tokyo-wave3-0804/current-official-printed-seat-map`) is **497 mapped / 503 official / rangeDiff -6 / representative**. The Wave17 hold cited only the six-seat difference against the published room capacity, which is confidence metadata under the current guide. The 497 printed set is complete: rows 1-19 plus the printed 親子席 row 20 seats 1-6. The gap is plausibly the two unnumbered wheelchair marks beside rows 6-7, but the issuer states no count, so it stays unresolved metadata and no number was added.
  - 瑞穂ビューパーク・スカイホール〔大ホール〕 (`tokyo-wave3-1205/current-official-printed-seat-map`) is **1,000 mapped / 1,008 official / rangeDiff -8 / representative**. The source is a monochrome scan with no text layer, so the count was redone twice independently: magnified block-by-block transcription gives 1,000, and connected-component cell detection on a 500 dpi render gives 997-999 with every missed cell individually attributable to a dimension line or dashed border. **The recorded 1,006 does not reproduce.** `expectedSeatCount` is the published 座席数1,008席, matching the convention already used for tokyo-wave3-1188 and tokyo-wave3-0991; 固定席1,002 and 車いす席6 are held separately, so the explained 6 and the unexplained 2 stay distinguishable.
  - 昭和女子大学 人見記念講堂 (`hitomi-memorial-hall-standard/current-official-printed-seat-map`) is **2,070 mapped / 2,070 official / rangeDiff 0 / representative**. The Wave13 ownership hold is answered by the drawing itself: each block is a set of straight row lines whose counts match the issuer's printed row labels one-to-one (1F left/right 34 lines against rows 2-35, 1F outermost 26 lines, 2F all blocks 12 lines against rows A-L), and the issuer's own note 「8列8,9,10,45,46,47は車椅子兼用席」 anchors the first outermost line to row 8 on both sides. Reconstructed with the rake offsets, the blocks total exactly 1階1,538席 and 2階532席 — the issuer's own client-count table.
  - 東京オペラシティ コンサートホール (`tokyo-wave3-0241/current-official-printed-seat-map`, MUST tier) is **1,622 mapped / 1,632 official / rangeDiff -10 / representative**. **The 1-LB/1-RB 58-seat blocker does not exist on the current chart dated 2026.8**: the first floor is rows 1-31 with left 1-10, centre 11-22 and right 23-32 only. Every floor reconciles — 1F 964 printed + 8 wheelchair = 972, 2F 356 printed + 2 wheelchair = 358, 3F 302 printed = 302, total 1,622 printed + 10 wheelchair = 1,632.
- Production data is **113 venues / 115 selectable configurations / 171,917 configuration-seat records**. `venues:release:coverage` remains **RELEASE READY: yes**; Tokyo coverage is **46/76 (60.5%)**, MUST **29/44 (65.9%)**, SHOULD **17/28 (60.7%)**. Only 東京オペラシティ of the five is inside the 76-venue Tokyo coverage universe, which is why Tokyo and MUST each move by one.
- The hard-case inventory was recounted mechanically over all 1,266 inventory items; the buckets, their definitions and the 41-item hard-case indicator are recorded in `data/venue-reports/tokyo-wave-22-2026-08-24.json`. The previously reported "本当に難案件: 86件" is not reproducible and is superseded.
- TOKYO-WAVE-21 promotes the three venues the hard-case resolution audit had classified as USER DECISION REQUIRED, under the user-approved display-area policy now recorded in `docs/VENUE_DATA_GUIDE.md`:
  - 歌舞伎座 (`kabukiza-standard/current-official-printed-seat-map`) is **1,808 mapped / 1,808 official / rangeDiff 0 / representative**. The current chart's vector text layer holds exactly 1,808 printed numbers and reconciles with every issuer floor subtotal (1F 897 / 2F 441 / 3F 470). The floor ownership of the unlabelled sajiki and side-box columns is fixed by the issuer's own arithmetic, not by drawing position: 2F main 393 + side boxes 48 = 441, and 3F main 440 + side strips 30 = 470. Independent extraction from the 松竹 primary PDF and the KABUKI WEB English PDF produced an identical range set. 4階一幕見席96席 is officially outside the 1,808 and is excluded.
  - 新橋演舞場 (`shinbashi-enbujo-standard/current-official-printed-seat-map`) is **1,424 mapped / 1,424 official / rangeDiff 0 / representative**. The 1F/2F/3F side number strips are their own display areas and claim no adjacent main row. The official class-breakdown table (1,064 + 136 + 96 + 88 + 40 = 1,424) matches the transcription, and its 88 and 40 line items match the 2F side strips (44+44) and 1F side strips (20+20) exactly. The recorded 1,424 / 1,426 / 1,428 spread stays metadata.
  - 文京シビックホール 大ホール (`bunkyo-civic-main-standard/current-official-printed-seat-map`) is **1,802 mapped / 1,802 official / rangeDiff 0 / representative**. Seat cells extracted from the PDF's own vector drawing give exactly 1,242 first-floor cells across 32 rows and 560 second-floor cells across 21 rows, matching the figures printed on the drawing. **The recorded 1,258-versus-1,242 side-cell contradiction does not reproduce**; it came from ignoring the row rake when connecting the side cells.
- **One deliberate deviation to review**: for 文京シビックホール the instruction was to model the first-floor side block as an independent display area. It is instead kept inside its row, because the issuer numbers each row continuously 1-44 across all blocks and that connection is now verifiable against the issuer's own 1,242. Splitting it would have required inventing an area name for seats the issuer numbers as one row. This is reversible without new evidence if the user prefers the split model.
- The display-area policy is recorded in `docs/VENUE_DATA_GUIDE.md` next to the representative-configuration paragraph: seat IDs, numbers and block membership are never invented, but where the issuer prints no row/area name for an independent side/box/segmented block whose boundary the drawing makes explicit, a repository-defined display name may be used for result presentation only. It must not claim an adjacent main row, must not complete seats from geometry, must be disclosed in `scopeDisclosure` and limitation metadata as presentation-only, and keeps `confidence` at `representative`.
- TOKYO-WAVE-20 promoted three venues reopened by the same audit: 東京芸術劇場 コンサートホール (**1,999 / 1,999 / rangeDiff 0 / verified**), 府中の森芸術劇場 どりーむホール (**2,017 / 2,017 / rangeDiff 0 / representative**), and タワーホール船堀 大ホール (**757 mapped / 750 official / rangeDiff +7 / representative**). Two prior holds were disproved rather than merely reopened: the 東京芸術劇場 "Q〜T printed 92 versus subtotal 82" contradiction does not exist (the rear band has three side wings per side, giving Q 7-30, R 7-30, S 8-29, T 13-24 = 82), and the 府中 one-seat first-floor difference was a transcription artefact. For タワーホール船堀 two independent pixel measurements both give 757 printed cells while the drawing's own title says 753 and the facility page says 750; no seat was deleted to reach either figure.
- Production data is **108 venues / 110 selectable configurations / 165,826 configuration-seat records**. `venues:release:coverage` remains **RELEASE READY: yes**; Tokyo coverage is **45/76 (59.2%)**, MUST **28/44 (63.6%)**, SHOULD **17/28 (60.7%)**.
- The audit's cross-cutting finding is recorded in `data/venue-reports/tokyo-wave-20-2026-08-23.json`: `docs/VENUE_DATA_GUIDE.md` treats exact agreement with a published total and `rangeDiff: 0` as confidence signals rather than production gates, and production already carries unexplained differences (curian-main +10, nhk-hall +8, sumida-triphony-main -6, galaxy-theatre +4, tokyo-geigeki-playhouse +16). Holds that cited only a printed-versus-published difference are therefore reopenable without new issuer evidence.
- Representative-layout policy is explicit in `docs/VENUE_DATA_GUIDE.md`: fixed seating and venue type alone do not determine eligibility. An issuer-grounded standard/default/recommended or otherwise rationally representative numbered configuration can be production, including arena/event/movable venues; unsupported representative choice, invented ownership/IDs, and capacity fitting remain HOLD/reject blockers. Earlier type-only structural prefilters are **DEFERRED**, not permanent REJECTs, until representative-layout preflight.
- TOKYO-WAVE-17 completed its explicitly bounded four-venue scope in commit `84c7114`, pushed to `main` and verified through the managed Workers public runtime. Exactly one venue is promoted: プリモホールゆとろぎ〔大ホール〕 (`tokyo-wave3-1188/standard`) is **850 mapped / 854 official / rangeDiff -4 / representative**. The difference is the current official map's four unnumbered 車1〜車4 spaces; numbered parent seats and pit用可動79席 remain in the standard set, with no inferred operating exclusions.
- TOKYO-WAVE-18 is formally closed as **NO SAFE CANDIDATE**: six records are synchronized as **5 ownership-stage rejects / 1 count-reconciliation reject / 0 adopted / 0 production promotions / 0 Sol handoffs**. `tokyo-wave3-0032` and `tokyo-wave3-0052` are SOURCE HOLD; `olympic-center-small-hall-standard` and `kunitachi-arts-small-hall-standard` are REJECT. `sunpearl-arakawa-main-standard` and `setagaya-eagle-hall-standard` remain **carry-over reject / unchanged**: they were already rejected before Wave18 and Wave18 adds no new evidence or disposition.
- The other three Wave17 targets are HOLD, not production: セシオン杉並〔ホール〕 has **497 printed / 503 official** with no issuer-defined six-seat explanation; 西新井文化ホール has **902 printed cells** that conflict with its own floor-total and unnumbered-wheelchair breakdown; 瑞穂ビューパーク・スカイホール〔大ホール〕 has **1,006 printed cells** that conflict with its own 1,002-fixed-seat statement. No capacity fitting, invented IDs, duplicate suppression, geometric ownership, or configuration mixing was used.
- tokyo-wave3-0041/standard is production with **501 mapped / 501 official / rangeDiff 0 / representative**. It preserves the complete normal one-floor printed set; the maximum-eight-wheelchair conversion is separate metadata because individual removed IDs are not published.
- tokyo-wave3-0991/standard is production with **496 mapped / 500 official / rangeDiff -4 / representative**. The four-seat difference is the official, unnumbered wheelchair-space metadata. Printed dotted removable-seat IDs remain in the normal configuration.
- nissay-theatre-standard/current-official-block-numbered-seat-map is corrected atomically to the current official PDF printed set: **1,335 mapped / 1,334 official / rangeDiff +1 / representative**. No capacity fitting was used.
- tokyo-geigeki-playhouse-standard/current-official-printed-seat-map is production: **845 mapped / 829 official / rangeDiff +16 / representative**. It preserves the official PDF's 1F A-E **132 printed versus 116 table** difference, the pit-removal, wheelchair-conversion, and performance-difference disclosures; no capacity fitting was used.
- TOKYO-WAVE-13 is closed as **4/4 SOURCE HOLD** with no production promotion: hitomi-memorial-hall-standard (2,070; row-8 wheelchair-compatible IDs 8, 9, 10, 45, 46, 47), tokyo-wave3-1019 (current-linked 1,290-seat PDF; pit variant separate), koganei-miyaji-main-standard (normal 569; 578-seat and front-row-removal operations separate), and theatre-1010-standard (701; independent read-only confirmation). Each has a current/current-linked official numbered map, but segmented or side-number groups lack issuer-defined row/area ownership; no geometric transcription, capacity fitting, or repository-defined ownership was made.

## Unresolved items

- `tokyo-theatre-1010` remains a genuine ownership hold: its chart labels only one column of rows. Recorded, not scheduled.
- `tokyo-koganei-miyaji-main` is blocked on source retrieval, not on evidence quality — the site 403s this environment. Its recorded ownership blocker is untested.
- `tokyo-official-0942` 足立区役所〔庁舎ホール〕 has a blocking reason that cites a current-linked official numbered PDF, but no such source is registered in `data/venue-sources/tokyo-wave3-0942.json`. Register one before testing the blocker.
- The Tokyo metropolitan list records 国立音楽大学 in 武蔵村山市 while the issuer's access page states 東京都立川市柏町5-5-1. The production source uses 立川市; the inventory row is left as the discovery-list record.
- **Wave18 SOURCE HOLDs are reclassified, not re-researched.** `tokyo-wave3-0032` and `tokyo-wave3-0052` stay non-production, but their recorded requirement for *new* issuer material is stale: both are re-openable by re-reading existing official material under the current guide. Their evidence has not been revisited.
- Of the four Wave13 source holds, `hitomi-memorial-hall-standard` (Wave22) and `tokyo-wave3-1019` (Wave23) are now production; `koganei-miyaji-main-standard` and `theatre-1010-standard` remain non-production.
- `data/venue-readiness/tokyo-wave-1.json` is an explicit frozen 2026-07-27 baseline and still records source-hold text for venues that are now production. It is deliberately not rewritten; the same applies to the per-wave readiness and report files, which are historical records.

## Exact next action

### NEXT TERRA ACTION

Run a bounded preflight over the **unprocessed priority A/B Tokyo inventory** and pick the highest production-probability candidates for an ordinary venue-addition wave.

Concretely: from `data/venue-inventory/tokyo.json`, take rows with `researchStatus` of `not-started`, `source-located` or `draft-created` and `priority` A or B; **exclude** every id already carrying a disposition — the 115 production ids, the 39 hard cases, the 130 type-only DEFERRED rows, the 15 closed/renovation rows, the 4 REJECTs and the 2 independent-review-mismatch rows. For each shortlisted candidate check only two things before committing to transcription:

1. does the issuer publish a current numbered seat map, and
2. **does that map print a row label beside every block** (the Wave23 discriminator)?

Take forward only candidates that pass both, apply the representative-layout policy in `docs/VENUE_DATA_GUIDE.md`, and keep the batch bounded. This is ordinary `STANDARD`/`DENSE` lane work and does not need Opus.

### Future Opus candidates (record only — do not start)

Kept for a future authorized Opus phase. **Do not begin research or implementation on any of these.**

1. `tokyo-theatre-1010` シアター1010〔劇場〕 (701, B) — test whether the published 1階553席 / 2階148席 subtotals admit exactly one assignment of the unlabelled right-hand block lines to rows.
2. `tokyo-koganei-miyaji-main` 小金井宮地楽器ホール〔大ホール〕 (569 normal / 578, B) — first retrieve the official PDF from an environment the site does not 403, then apply the Wave23 row-label test.
3. `tokyo-coverage-ex-theater-ariake` EX THEATER ARIAKE (1,546, A) — a count-contradiction hold over the fixed/movable/wheelchair breakdown of the 1,546 maximum.
4. `aichi-arts-center-main` 愛知県芸術劇場 大ホール (2,480, A) — the official map labels pit rows 1-5 as 176 seats while the printed IDs total 177; a one-seat contradiction of the kind Wave22 twice disproved.
5. `takasaki-city-theatre-main` 高崎芸術劇場 大劇場 (A) — two independent passes read 480 printed 2F seats against an official 2F subtotal of 448.

## Recent completed work

- 2026-08-24: TOKYO-WAVE-23 commit `6414ebc` is pushed to `main` and live through the managed Workers Builds integration (`Workers Builds: seat-lottery-simulator` completed success). Public runtime detail endpoints return 1,290 and 1,252. Production UI search returned 国立音楽大学〔講堂大ホール〕東京都 立川市 1,290席 as the single match and 武蔵野市民文化会館 大ホール 1,252席 alongside the pre-existing 小ホール; live draws succeeded (国立音楽大学 け列42番, 武蔵野 2階席 42列38番) and a clean browser tab produced zero console output.
- 2026-08-24: TOKYO-WAVE-23 closed the Opus hard-case phase. Two promotions (国立音楽大学 講堂大ホール 1,290/1,290/0, 武蔵野市民文化会館 大ホール 1,252/1,256/-4), one evidence-confirmed HOLD (シアター1010), two NOT ATTEMPTED (小金井 — source 403; 足立区役所 — priority C under the context stop rule). Targeted reviews, the Wave23 batch report, inventory/readiness/release coverage, generated catalog/runtime synchronization, two fingerprint additions and canonical `verify:venues` all passed: lint, typecheck, **212 unit tests**, production build, docs/harness, and **16 Playwright E2E tests**.

- 2026-08-24: TOKYO-WAVE-22 commit `a450c13` is pushed to `main` and live through the managed Workers Builds integration (`Workers Builds: seat-lottery-simulator` completed success). Public runtime detail endpoints return 902 / 497 / 1,000 / 2,070 / 1,622. Production UI search returned exactly one result per venue with the matching seat count (西新井文化ホール 902席, セシオン杉並 497席, 瑞穂ビューパーク・スカイホール 1,000席, 人見記念講堂 2,070席, 東京オペラシティ 1,622席), live draws succeeded (人見記念講堂 2階ホール K列41番, 東京オペラシティ 1階席 17列12番, 西新井文化ホール 1階席 け列20番), and the browser console produced no output at all.
- 2026-08-24: TOKYO-WAVE-22 promoted all five re-evaluated hard cases — 西新井文化ホール (902/902/0), セシオン杉並 (497/503/-6), 瑞穂ビューパーク・スカイホール 大ホール (1,000/1,008/-8), 人見記念講堂 (2,070/2,070/0) and 東京オペラシティ コンサートホール (1,622/1,632/-10). Three prior blockers were disproved rather than merely reopened: the 西新井 902-versus-896 contradiction, the 瑞穂 1,006 printed count, and the オペラシティ 1-LB/1-RB 58-seat inclusion question. Targeted reviews, the Wave22 batch report, inventory/readiness/release coverage, generated catalog/runtime synchronization, five production fingerprint additions and canonical `verify:venues` all ran. The stale iino-hall follow-up and the stale Wave17/Wave18 "new issuer material required" guidance were cleared, and the hard-case aggregate was recounted mechanically.

- 2026-08-23: TOKYO-WAVE-20 (`c1766d2`) and TOKYO-WAVE-21 (`348f4f4`) are both pushed to `main` and live through the managed Workers Builds integration. Public runtime detail endpoints return 1,999 / 2,017 / 757 and 1,808 / 1,424 / 1,802. Production UI search returned exactly one result per venue with the matching seat count, live draws succeeded (東京芸術劇場 2階席F列14番, 歌舞伎座 1階西桟敷10列1番 and 1階席5列12番, 新橋演舞場 2階席4列22番, 文京シビックホール 1階席28列15番), and the browser console showed no application errors.

- 2026-08-23: TOKYO-WAVE-21 promoted 歌舞伎座 (1,808/1,808/rangeDiff 0), 新橋演舞場 (1,424/1,424/rangeDiff 0), and 文京シビックホール 大ホール (1,802/1,802/rangeDiff 0) under the approved display-area policy. All three reconcile exactly with issuer-published subtotals. The 文京シビック first-floor side-cell contradiction was disproved rather than worked around. `docs/VENUE_DATA_GUIDE.md` gained the minimal display-area paragraph; no schema or workflow change was needed.

- 2026-08-23: TOKYO-WAVE-20 promoted 東京芸術劇場 コンサートホール (1,999/1,999/rangeDiff 0), 府中の森芸術劇場 どりーむホール (2,017/2,017/rangeDiff 0), and タワーホール船堀 大ホール (757/750/rangeDiff +7). Scope came from the hard-case resolution audit, not from new discovery. Targeted reviews, the Wave20 batch/readiness/coverage reports, generated catalog/runtime synchronization, fingerprint update, and canonical `verify:venues` all passed in this environment: lint, typecheck, **212 unit tests**, production build, docs/harness checks, and **16 Playwright E2E tests**. Two prior holds were disproved rather than merely reopened — the 東京芸術劇場 Q〜T 10-seat contradiction and the 府中 one-seat first-floor difference were both transcription artefacts.

- 2026-08-22: Integrated the two adopted TOKYO-WAVE-12 Sol audit conclusions only; source, inventory, Wave 1/Wave 12 readiness, Wave 12 result report, production fingerprint, catalog, and runtime artifacts are synchronized. Targeted review passed: Nissay 1,335 and Playhouse 845. Canonical venue validation is recorded in the active task before commit/push.
- 2026-08-22: Closed the explicitly bounded TOKYO-WAVE-13 scope as four source holds. Source, Tokyo inventory, carry-over batch, Wave 1/Wave 13 readiness, and Wave13 result report record the same evidence-based ownership blocker; production source data, generated catalog/runtime artifacts, and fingerprints remain unchanged. Targeted batch review/report and canonical `verify:venues` passed in the approved environment (including inventory/readiness/release coverage, build/check/validate/report, lint, typecheck, 212 unit tests, production build, 16 Playwright E2E tests, docs, and diff check).
- 2026-08-22: TOKYO-WAVE-14 directly transcribed the adopted current official printed sets only: 星陵会館〔ホール〕 normal400 and 府中の森芸術劇場〔ふるさとホール〕 numbered-general518. The latter preserves the official six unnumbered wheelchair spaces and separate 64-seat hanamichi operation as metadata; no capacity fitting or inferred IDs were used.
- 2026-08-22: Canonical `verify:venues` passed in the approved environment: targeted review, inventory/readiness/release coverage, build/check/validate/report, lint, typecheck, 212 unit tests, production build, 16 Playwright E2E tests, docs, and diff check. The restricted sandbox hit a Vite child-process `spawn EPERM` before unit tests; its approved-environment rerun passed. The in-app browser exposed no actionable deployed-app tab, so search/draw/console remain unconfirmed; public runtime JSON and managed deployment status are confirmed.
- 2026-08-22: TOKYO-WAVE-15 directly transcribed the adopted official printed sets only: よみうり大手町ホール normal501 and 八王子市南大沢文化会館〔主ホール〕 fixed printed496. The latter preserves four unnumbered wheelchair spaces and all printed dotted removable-seat IDs; no capacity fitting, inferred IDs, or configuration mixing was used. Target reviews, batch report, and canonical `verify:venues` passed in the approved environment; the restricted sandbox's incomplete Vite child process was stopped before the approved rerun.
- 2026-08-22: Wave15 commit `8f0c2db` is deployed through the managed Workers Builds integration. Public runtime detail endpoints confirmed tokyo-wave3-0041/standard=501 and tokyo-wave3-0991/standard=496. Production browser search/draw/console were not separately exercised because no actionable in-app browser tab was available; canonical E2E passed.
- 2026-08-23: TOKYO-WAVE-16 bounded promotion adds only 台東区立旧東京音楽学校奏楽堂〔音楽ホール〕. Targeted review, Wave16 batch/readiness reports, inventory/release coverage, build/check/validate/report, lint, typecheck, 212 unit tests, production build, 16 Playwright E2E tests, docs, and diff check passed in the approved environment. Public runtime returned `tokyo-wave3-0339/standard`=310; production UI search returned one 310-seat result, a draw succeeded, and browser console errors were zero. The restricted Harness remains unable to execute its Git child process (`EPERM`); direct Git baseline checks are authoritative and no repository configuration was changed.
- 2026-08-23: TOKYO-WAVE-17 direct official-map transcription and bounded independent conflict checks completed. Targeted batch review, Wave17 batch/readiness reports, inventory/release coverage, generated catalog/runtime synchronization, fingerprint review, and canonical `verify:venues` passed. The restricted Harness hit Vite/Vitest `spawn EPERM`; the approved-environment rerun passed lint, typecheck, **212 unit tests**, production build, docs, and **16 Playwright E2E tests**. After `84c7114` reached `main`, the managed Workers public runtime showed 101 venues; searching `プリモホールゆとろぎ` returned exactly one 850-seat result, one live draw returned 2階席 2G列6番, and the browser console had zero errors.
- 2026-08-23: TOKYO-WAVE-18 closure records only the prior bounded preflight findings: **NO SAFE CANDIDATE**, six checked, five ownership-stage rejects, one count-reconciliation reject, zero adopted and zero production promotions. Production source data, generated catalog/runtime artifacts, fingerprint, and seat records are intentionally unchanged. Next-wave discovery must construct and subtract the full already-investigated exclusion set before A/B ranking.
- 2026-08-23: TOKYO-WAVE-19 promoted only 飛行船シアター in commit `e15df1d`, pushed to `main` and confirmed through the managed Workers public runtime. Targeted venue review, Wave19 batch/readiness reports, inventory/release coverage, generated catalog/runtime synchronization, fingerprint review, and canonical `verify:venues` passed in the approved environment: lint, typecheck, **212 unit tests**, production build, docs, and **16 Playwright E2E tests**. Public UI search returned exactly one 飛行船シアター result with 506 seats; a live draw returned 1階席 B列4番 and browser console errors were zero. The restricted Harness had the known Vite/Vitest `spawn EPERM`; no Harness, repository, or global configuration was changed. Wave20 research has not started.
- 2026-08-23: TOKYO-WAVE-19 follow-up changes only the app display/search presentation to 飛行船シアター（スタァライト劇場）, with both the current and planned names retained as aliases. Seat ranges, counts, accessibility metadata, confidence, and Wave19 disposition are unchanged; Wave20 research has not started.
