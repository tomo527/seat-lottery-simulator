# Current handoff

Updated: 2026-08-10 (Asia/Tokyo)

## Current state

- Current HEAD is the commit containing this handoff; resolve the exact SHA with `git rev-parse HEAD`. Branch `main` is pushed to `origin/main`, local HEAD equals `origin/main`, and the working tree is clean at handoff completion.
- Production: **58 venues / 78,917 seats**. Generated sources, catalog, runtime details, and production fingerprints are synchronized at 58 each.
- Coverage: Tokyo **50**, Kanagawa **3**, Chiba **1**, Saitama **1**, Ibaraki **0**, Tochigi **1**, Gunma **0**; Osaka **2**. Kanto total: **56**.
- The 2026-08-09 Kanto P1 Sol macro closed `takasaki-city-theatre-main-release-seed` as **CONTRADICTION** and preserved all 56 baseline production fingerprints and catalog entries unchanged.
- The 2026-08-10 bounded Terra escalation left `nissay-theatre` on **SOURCE/SCHEMA HOLD** and handed `line-cube-shibuya` to Sol. The bounded Sol escalation then found current issuer-owned operational evidence identifying all 26 wheelchair-conversion seats and promoted `line-cube-shibuya-standard` as **PRODUCTION**, 1,952 numbered seats. Production is now **57 venues / 76,911 seats**.
- The 2026-08-10 Sol Tokyo COMPLEX macro 1 promoted `tokyo-wave3-0130` (`suntory-hall-main`) as **PRODUCTION**, 2,006 numbered seats. The prior 57 production fingerprints and catalog entries are unchanged; production is now **58 venues / 78,917 seats**.
- The 2026-08-10 Sol Tokyo COMPLEX macro 2 closed `meijiza` as **POLICY/SCHEMA HOLD** before range transcription. Production remains **58 venues / 78,917 seats**, and all baseline production fingerprints and catalog entries are unchanged.
- The 2026-08-10 Sol Tokyo COMPLEX macro 3 closed `kabukiza` as **SCHEMA HOLD** before range transcription. Production remains **58 venues / 78,917 seats**, and all baseline production fingerprints, catalog entries, and runtime details are unchanged.

## Release goal

Release `release-seed-v1` with the production gate intact, prioritizing remaining Kanto P0, then Kanto P1, Tokyo top-up, and only then the scoped major national cities. Release ready is **no**.

## Kanto macro classification

- **PRODUCTION**: `yokohama-minatomirai-hall-main-release-seed`, `sagamihara-green-hall-main-release-seed`, `culttz-kawasaki-hall-release-seed`, `ichikawa-culture-hall-main-release-seed`, `saitama-arts-theatre-main-release-seed`, `utsunomiya-city-culture-hall-release-seed`.
- **LUNA**: none remaining in Kanto.
- **TERRA**: none remaining in Kanto.
- **SOL**: none remaining in Kanto.
- **HOLD/MISMATCH**: `kanagawa-kenmin-hall-main-release-seed` (SOURCE HOLD), `muza-kawasaki-symphony-hall-release-seed` (SOURCE HOLD), `yokosuka-arts-theatre-release-seed` (POLICY HOLD), `mori-no-hall21-main-release-seed` (SOURCE HOLD), `narashino-culture-hall-release-seed`, `funabashi-civic-culture-hall-release-seed`, `chiba-city-culture-center-hall-release-seed`, `urayasu-culture-hall-release-seed`, `saitama-kaikan-main-release-seed` (CONTRADICTION), `omiya-sonic-city-large-release-seed` (INDEPENDENT REVIEW MISMATCH), `kawaguchi-lilia-main-release-seed`, `tokorozawa-muse-ark-release-seed` (POLICY HOLD), `westa-kawagoe-large-release-seed` (CONTRADICTION), `mito-arts-tower-concert-release-seed`, `ibaraki-kenritsu-bunka-center-large-release-seed`, `tochigi-ken-sogo-bunka-center-main-release-seed`, `gunma-music-center-release-seed`, `takasaki-city-theatre-main-release-seed` (CONTRADICTION).

## 2026-08-09 Kanto P1 Sol macro outcome

- `takasaki-city-theatre-main-release-seed`: **CONTRADICTION**. Expected numbered seats are 2,022 (official 2,027 positions less five nonnumbered wheelchair positions); two complete independent passes both read 2,054 printed numbered seats, with 1F 1,468, 2F 480, and side areas 106. `rangeDiff: 0`, but the same official map states 2F 448, leaving an unexplained 32-seat difference. No ranges, generated detail, catalog entry, or fingerprint were created.
- Production promotions: **0**; production remains **56 venues / 74,959 seats**.

## 2026-08-09 Kanto P0 Sol macro outcomes

- `yokosuka-arts-theatre-release-seed`: **POLICY HOLD**. The M/N local diff is resolved as M 2-31 and N 2-37, but the fixed-seat subtotal and four separately drawn wheelchair positions do not define one numbered selectable pattern.
- `mori-no-hall21-main-release-seed`: **SOURCE HOLD**. The registered official PDF is a third-floor restricted-view photo guide, not a complete numbered-seat map.
- `saitama-arts-theatre-main-release-seed`: **PRODUCTION**, 776 numbered seats; two independent official-PDF passes, zero range diff.
- `saitama-kaikan-main-release-seed`: **CONTRADICTION**. Two passes read 1F 1,071 printed numbers versus the official 1F 1,049 count; the 22-seat difference is undefined.
- `omiya-sonic-city-large-release-seed`: **INDEPENDENT REVIEW MISMATCH**. Two passes read 1,681 printed numbers versus an official count implying 1,677 numbered seats; the four-seat difference is undefined.
- `westa-kawagoe-large-release-seed`: **CONTRADICTION**. Two passes read 3F 594 printed numbers versus the official 3F 576 count; the 18-seat difference is undefined.

## 2026-08-09 Sol macro outcomes

- `sagamihara-green-hall-main-release-seed`: **PRODUCTION**, 1,778 numbered seats; two independent passes, zero range diff.
- `kanagawa-kenmin-hall-main-release-seed`: **SOURCE HOLD**; official capacity/conversion evidence is explicit, but the only public numbered diagram is a low-resolution viewpoint GIF with markers obscuring numbers.
- `yokosuka-arts-theatre-release-seed`: **INDEPENDENT REVIEW MISMATCH**; representative fixed layout is clear, but the independent flat-floor readings differ by four seats around rows M-N beside wheelchair spaces. No guessed ranges were saved.
- `culttz-kawasaki-hall-release-seed`: **PRODUCTION**, 1,995 numbered seats; two independent passes, zero range diff.
- `ichikawa-culture-hall-main-release-seed`: **PRODUCTION**, 1,758 numbered seats; two independent passes, zero range diff.

## 2026-08-09 Terra macro outcomes

- `muza-kawasaki-symphony-hall-release-seed`: **SOURCE HOLD**. The official 2023 map establishes 1,987 numbered general seats plus 10 separately identified wheelchair positions (1,997 total), but neither the map nor the current official seat page publishes a lossless row/number inventory. Do not synthesize row ranges from block totals or invent wheelchair seat numbers.
- `tokorozawa-muse-ark-release-seed`: **POLICY HOLD**. The official map/page agree on maximum 2,002 seats (1F 1,106; 2F 560; 3F 336); the official page also says 13 movable 1F seats can convert to six wheelchair positions. It does not define one fixed representative selectable configuration.

## Tokyo top-up

### 2026-08-10 Sol Tokyo COMPLEX macro 3

- `kabukiza`: **SCHEMA HOLD**. Current issuer-owned sources publish one physical layout with 1F 897 + 2F 441 + 3F 470 = 1,808 seats. The hanamichi is a permanent facility element, and the current map includes individually numbered first-floor sajiki seats. The 96 fourth-floor one-act viewing seats use separate access/sales and are explicitly excluded from the 1,808 total.
- Wheelchair/sales resolution: the current official map draws two unnumbered first-floor wheelchair positions, and Shochiku's current wheelchair guide confirms a dedicated space for at most two seats. Neither source says whether those positions are included in the 1,808 total or identifies numbered seats removed/reinstated for their use. The July 2025 change is a sales-grade change, while selectable/unavailable status varies by reservation stage; neither defines a different normal physical numbered set.
- The physical-layout variants are therefore resolved, but the selectable numbered-seat set is not uniquely defined. Expected/calculated counts remain `null`/`null`, ranges remain empty, and the first pass, independent second pass, and production gate were not started. Do not subtract two from 1,808, infer replacement numbers from the diagram, or create a repository inclusion policy. Reopen only if the issuer publishes the inclusion rule or replacement seat numbers.
- Production promotions: **0**. All 58 baseline production fingerprints, catalog entries, and runtime details are unchanged; production remains **58 venues / 78,917 seats**.

### 2026-08-10 Sol Tokyo COMPLEX macro 2

- `meijiza`: **POLICY/SCHEMA HOLD**. The current official seat page and separate official PDFs publish two complete fixed-number configurations: with hanamichi 1F 834 + 2F 390 + 3F 144 = 1,368, and without hanamichi 1F 914 + 2F 390 + 3F 144 = 1,448. The page says hanamichi use varies by performance, and official event pages demonstrate both variants in actual use; no issuer source designates a normal, standard, or default one.
- Variant/sales resolution: the maps directly show the with-hanamichi first floor omits seats 7-10 in rows 1-20, matching the official 80-seat floor-count difference, but this does not authorize choosing the 1,448-seat variant as representative. Wheelchair spaces are at the two second-floor corners and reserved per performance, while no official individual numbers or removal/replace mapping to the 390 numbered second-floor seats is published. Seat-selection availability, annotation seats, auxiliary seats, and standing sales also vary by event or sale stage and do not designate a normal fixed-seat set.
- Representative-pattern gate failed, so expected/calculated counts remain `null`/`null`, ranges remain empty, and the first pass, independent second pass, and production gate were not started. Do not select 1,368 or 1,448 by policy, subtract or fit seats, or invent wheelchair identifiers. Reopen only if the issuer publishes a normal representative configuration and its wheelchair seat-number relationship.
- Production promotions: **0**. All 58 baseline production fingerprints, catalog entries, and runtime details are unchanged; production remains **58 venues / 78,917 seats**.

### 2026-08-10 Sol Tokyo COMPLEX macro 1

- `suntory-hall-main`: **PRODUCTION**, 2,006 numbered seats. The official seat map first pass and a fresh independent pass from the current official rental guide's separately published map both reproduced 1F 858 (rows 1-14 510; rows 15-23 348) and 2F 1,148 across LA 110, LB 74, LC 52, LD 66, C 354, RA 110, RB 74, RC 52, RD 66, and P 190. `rangeDiff: 0`, expected 2,006, calculated 2,006.
- Variant resolution: the official map draws six dedicated wheelchair spaces without individual numbers; current official material separately states up to 14 universal-design compatible seats. The 39-part lift is stage equipment, not an audience-seat numbering alternative. The current rental guide requires the Main Hall to be all-reserved and directs ticket issuance from the 2,006-seat map. This uniquely defines the standard printed numbered-seat set without subtraction, range fitting, or invented policy.
- Production promotion: **1**. All 57 baseline production fingerprints and catalog entries are unchanged; one reviewed source, catalog entry, runtime detail, and fingerprint were added. Production is **58 venues / 78,917 seats**.

### 2026-08-10 Sol LINE CUBE SHIBUYA bounded escalation

- `line-cube-shibuya`: **PRODUCTION**, 1,952 numbered seats. The official capacity remains 1,956 (1F 1,180 including four unnumbered multipurpose-viewing-room seats; 2F 424; 3F 352). A complete official-map first pass and independent second pass both counted 1F 1,176 numbered seats, 2F 424, and 3F 352 with `rangeDiff: 0`.
- New issuer-owned evidence: the current official `LINE CUBE SHIBUYA 利用のご案内` explicitly identifies the wheelchair-conversion targets as 1F row 16 seats 1-13 and 32-44, exactly 26 numbered seats. The official map draws the four multipurpose-room seats separately without individual numbers. This uniquely defines the normal selectable numbered-seat set without subtracting from 1,956 or guessing ranges.
- Production promotion: **1**. All 56 baseline production fingerprints and catalog entries are unchanged; one reviewed source, catalog entry, runtime detail, and fingerprint were added. Production is **57 venues / 76,911 seats**.

### 2026-08-10 Terra bounded escalation

- `nissay-theatre`: **SOURCE/SCHEMA HOLD**. Official PDF and theatre overview confirm 1,334 seats. Terra first pass and an independent second pass both read the labelled 1F central runs, G.C., 2F, and curves; however `1扉` through `16扉` are door labels, and the curved positions repeat printed numbers without an issuer-owned row/area key. No range, expected count, generated detail, catalog entry, or fingerprint was created. Do not invent areas from geometry or fit to 1,334. Reopen only with an issuer-owned seat-number key, ticketing seat specification, or equivalent coordinate-to-row/area mapping.
- `line-cube-shibuya`: **SOL HANDOFF at Terra close**. Both official-source passes confirmed 1,956 total (1F 1,180 including the four-seat multipurpose viewing room; 2F 424; 3F 352), but Terra had not yet located the current user-guide clause identifying the 26 conversion target numbers. This historical blocker was resolved by the later Sol escalation above.
- Production promotions: **0**. All 56 baseline catalog entries and fingerprints remain unchanged.

The 2026-08-09 Luna high STANDARD macro 1 closed exactly three targets with no production promotion:

- `tokyo-bunka-hall-main`: **HOLD**. Official current material shows the large hall is closed during renovation; the pre-renovation map must not be promoted as current.
- `tokyo-geigeki-concert`: **CONTRADICTION/MISMATCH**. Two official-PDF passes read Q-T as 92 printed seats while the same official table states 82; the unexplained difference is 10 seats.
- `tokyo-opera-city-concert`: **CONTRADICTION/MISMATCH**. Two official-PDF passes read 58 numbered seats in 1-LB/1-RB beyond the published 1F/2F/3F subtotal structure; excluding them only to fit 1,632 is prohibited.

No range was corrected to a published total, and no generated catalog/runtime/fingerprint changed. The remaining Tokyo top-up queue is 13 candidates: 4 STANDARD candidates ready for Luna source passes, 4 COMPLEX candidates for later judgment, and 5 HOLD candidates.

The 2026-08-09 Luna high STANDARD macro 2 closed exactly three targets with no production promotion:

- `nissay-theatre`: **TERRA HANDOFF**. Official current sources establish 1,334 seats, but the high-density 1F/G.C./2F and curved-box map needs lossless Terra range transcription.
- `line-cube-shibuya`: **POLICY HOLD / SOL HANDOFF**. Official sources establish 1,956 seats (1F 1,180; 2F 424; 3F 352), but the 4 multipurpose seats and 26-seat wheelchair conversion relationship does not define one fixed selectable set.
- `kioi-hall`: **POLICY HOLD**. Official sources establish 800 seats (1F 522; 2F 278), but the hall is closed through the end of 2026 and the 2025-10 map is not post-renovation current evidence.

No range was corrected to a published total, and no generated catalog/runtime/fingerprint changed. The remaining Tokyo top-up queue is 10 candidates: `kameari-lirio-hall` is the only remaining STANDARD candidate, with 4 COMPLEX candidates and 5 HOLD candidates.

The 2026-08-09 Luna high STANDARD macro 3 closed the final STANDARD candidate:

- `kameari-lirio-hall`: **HOLD / SOURCE HOLD**. Official material states 610 seats including two wheelchair positions, but the official current status is renovation closure through 2026-08-31 with a scheduled 2026-09-01 reopening. The post-renovation current seat map and numbered-seat set are not confirmed, so no pre-renovation range was promoted.

No range was fitted to 610, and no generated catalog/runtime/fingerprint changed. No Tokyo STANDARD candidate remains. The unresolved Tokyo top-up queue remains 10 candidates: 4 COMPLEX and 6 HOLD, including `kameari-lirio-hall`.

## Model queues

- **TERRA**: no queued target. Keep `nissay-theatre` on SOURCE/SCHEMA HOLD unless the issuer publishes a curve seat-number key; do not repeat diagram-only transcription.
- **SOL**: `line-cube-shibuya` and `suntory-hall-main` are closed as production; `meijiza` is closed on POLICY/SCHEMA HOLD; and `kabukiza` is closed on SCHEMA HOLD. Do not escalate them again. The next bounded Tokyo target is `setagaya-public-theatre` in COMPLEX macro 4. Preserve macro-1 `tokyo-geigeki-concert` and `tokyo-opera-city-concert` closures.
- **LUNA CLOSED**: no Tokyo STANDARD candidate remains. Keep `kameari-lirio-hall` on source hold until post-renovation official material is published after the scheduled 2026-09-01 reopening.
- **HOLD**: preserve `kioi-hall`, all recorded Kanto P0/P1 holds, and all macro-1 Tokyo closures. Reopen only when issuer-owned material explicitly resolves the recorded blocker; do not fit ranges to totals.

## Holds

Existing closure holds also include `meijiza` policy/schema ambiguity, `kabukiza` wheelchair inclusion schema ambiguity, Sendai Sunplaza policy ambiguity, Sapporo hitaru policy ambiguity, Misonoza policy ambiguity, Umeda date hold, Hakataza source hold, and the ACROS official 1,871 vs 1,885 contradiction. Do not promote any hold by arithmetic or inference.

## Deployment verification

The official URL is `https://seat-lottery-simulator.studiotomo.workers.dev/`. The repository uses the established GitHub-to-Cloudflare Workers Builds flow. Before closing a macro, verify that the final pushed HEAD has a successful `Workers Builds: seat-lottery-simulator` check and that the public URL returns HTTP 200.

## Validation status

- 2026-08-10 Sol Tokyo COMPLEX macro 3 passed: `venues:build`, `venues:check`, `venues:validate`, `venues:inventory:report`, `venues:readiness:report`, `venues:batch:report -- --batch tokyo-wave-1`, `venues:release:coverage`, `venues:report`, `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check`. `kabukiza-standard` remains draft with no ranges after the selectable-numbered-set schema gate failed; all 58 production catalog entries, runtime details, and fingerprints are unchanged at 78,917 seats.
- 2026-08-10 Sol Tokyo COMPLEX macro 2 passed: `venues:build`, `venues:check`, `venues:validate`, `venues:inventory:report`, `venues:readiness:report`, `venues:batch:report -- --batch tokyo-wave-1`, `venues:release:coverage`, `venues:report`, `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check`. `meijiza-standard` remains draft with no ranges after the representative-pattern gate failed; all 58 production catalog entries, runtime details, and fingerprints are unchanged at 78,917 seats.
- 2026-08-10 Sol Tokyo COMPLEX macro 1 passed: `venues:review -- --id tokyo-wave3-0130`, `venues:build`, `venues:check`, `venues:validate`, `venues:inventory:report`, `venues:readiness:report`, `venues:batch:report -- --batch tokyo-wave-3`, `venues:release:coverage`, `venues:report`, `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check`. Existing 57 fingerprints are unchanged; production is 58 venues / 78,917 seats.
- 2026-08-10 bounded Sol LINE CUBE escalation passed: `venues:review -- --id line-cube-shibuya-standard`, `venues:build`, `venues:check`, `venues:validate`, `venues:inventory:report`, `venues:readiness:report`, `venues:batch:report -- --batch tokyo-wave-1`, `venues:release:coverage`, `venues:report`, `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check`. Existing 56 fingerprints are unchanged; production is 57 venues / 76,911 seats.
- 2026-08-10 bounded Terra escalation passed: `venues:build`, `venues:check`, `venues:validate`, `venues:inventory:report`, `venues:readiness:report`, `venues:batch:report -- --batch tokyo-wave-1`, `venues:release:coverage`, `venues:report`, `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check`. The 56-production catalog, runtime details, and fingerprints remain unchanged.
- 2026-08-09 Tokyo macro 3 data checks passed: `venues:build`, `venues:check`, `venues:validate`, `venues:inventory:report`, `venues:readiness:report`, `venues:batch:report`, `venues:release:coverage`, and `venues:report`; source hold recorded without changing production data. Production remains 56 venues / 74,959 seats.
- Full application validation passed: `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check`.
- Macro 3 deployment verification passed: `Workers Builds: seat-lottery-simulator` runs `https://github.com/tomo527/seat-lottery-simulator/runs/93256523368` and `https://github.com/tomo527/seat-lottery-simulator/runs/93256713037` succeeded; the public URL returned HTTP 200. The final HANDOFF-only follow-up must preserve this deployment state.
- Sol Tokyo COMPLEX macro 1 deployment verification passed: data commit `f2d3741` completed `Workers Builds: seat-lottery-simulator` check `https://github.com/tomo527/seat-lottery-simulator/runs/93349026437`; the public URL loaded successfully and exposed `サントリーホール〔大ホール〕` with `抽選対象 2,006席`, including successful lazy-loaded selection. The final HANDOFF-only follow-up must preserve this deployment state.
- Sol Tokyo COMPLEX macro 2 deployment verification passed: data commit `e7d6f1a` completed `Workers Builds: seat-lottery-simulator` check `https://github.com/tomo527/seat-lottery-simulator/runs/93359706935`; the public URL loaded successfully with `絞り込み結果 58件`, and searching `明治座` returned 0 results as required by the HOLD. The final HANDOFF-only follow-up must preserve this deployment state.
- Sol Tokyo COMPLEX macro 3 deployment verification passed: data commit `7223f4a` completed `Workers Builds: seat-lottery-simulator` check `https://github.com/tomo527/seat-lottery-simulator/runs/93364063363`; the public URL loaded successfully with `絞り込み結果 58件`, and searching `歌舞伎座` returned 0 results as required by the HOLD. The final HANDOFF-only follow-up must preserve this deployment state.
- Existing warnings remain limited to Kyocera Dome row fragmentation, inventory duplicate-candidate reporting, and 300/500-venue size projections; no database validation errors.
- E2E required the approved elevated run because Miniflare writes the user Wrangler registry outside the workspace; the sandbox-only attempt failed with `EPERM` and was not a repository failure.

## Exact next action

Run **Sol high Tokyo COMPLEX macro 4 for `setagaya-public-theatre` only**: use issuer-owned material to determine whether one normal selectable numbered-seat set is uniquely defined across stage/seat variants, wheelchair use, removable seats, and sales-pattern differences; complete the first pass, independent second pass, and production gate only if that set is unique, and otherwise close it with a concrete POLICY/SCHEMA/SOURCE HOLD. Keep `kabukiza`, `meijiza`, `suntory-hall-main`, `line-cube-shibuya-standard`, `nissay-theatre`, `kameari-lirio-hall`, `kioi-hall`, and every recorded Kanto/Tokyo closure unchanged; do not start P2 in the same macro.
