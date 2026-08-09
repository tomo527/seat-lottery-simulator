# Current handoff

Updated: 2026-08-09 (Asia/Tokyo)

## Current state

- Current HEAD is the commit containing this handoff; resolve the exact SHA with `git rev-parse HEAD`. Branch `main` is pushed to `origin/main`, local HEAD equals `origin/main`, and the working tree is clean at handoff completion.
- Production: **56 venues / 74,959 seats**. Generated sources, catalog, runtime details, and production fingerprints are synchronized at 56 each.
- Coverage: Tokyo **48**, Kanagawa **3**, Chiba **1**, Saitama **1**, Ibaraki **0**, Tochigi **1**, Gunma **0**; Osaka **2**. Kanto total: **54**.
- The 2026-08-09 Kanto P1 Sol macro closed `takasaki-city-theatre-main-release-seed` as **CONTRADICTION** and preserved all 56 baseline production fingerprints and catalog entries unchanged.

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

The 2026-08-09 Luna high STANDARD macro 1 closed exactly three targets with no production promotion:

- `tokyo-bunka-hall-main`: **HOLD**. Official current material shows the large hall is closed during renovation; the pre-renovation map must not be promoted as current.
- `tokyo-geigeki-concert`: **CONTRADICTION/MISMATCH**. Two official-PDF passes read Q-T as 92 printed seats while the same official table states 82; the unexplained difference is 10 seats.
- `tokyo-opera-city-concert`: **CONTRADICTION/MISMATCH**. Two official-PDF passes read 58 numbered seats in 1-LB/1-RB beyond the published 1F/2F/3F subtotal structure; excluding them only to fit 1,632 is prohibited.

No range was corrected to a published total, and no generated catalog/runtime/fingerprint changed. The remaining Tokyo top-up queue is 13 candidates: 4 STANDARD candidates ready for Luna source passes, 4 COMPLEX candidates for later judgment, and 5 HOLD candidates.

## Model queues

- **LUNA NEXT**: Tokyo top-up STANDARD macro 2: `nissay-theatre`, `line-cube-shibuya`, and `kioi-hall`; keep `kameari-lirio-hall` for the following STANDARD macro.
- **TERRA NEXT**: none in Kanto.
- **SOL ESCALATION**: `tokyo-geigeki-concert` and `tokyo-opera-city-concert` only if new issuer-owned material is obtained that explicitly resolves the recorded contradictions; do not reopen them in macro 2.
- **HOLD**: preserve all recorded Kanto P0/P1 holds and the three macro-1 Tokyo closures. Reopen only when issuer-owned material explicitly resolves the recorded blocker; do not fit ranges to totals.

## Holds

Existing closure holds also include Sendai Sunplaza policy ambiguity, Sapporo hitaru policy ambiguity, Misonoza policy ambiguity, Umeda date hold, Hakataza source hold, and the ACROS official 1,871 vs 1,885 contradiction. Do not promote any hold by arithmetic or inference.

## Deployment verification

The official URL is `https://seat-lottery-simulator.studiotomo.workers.dev/`. The repository uses the established GitHub-to-Cloudflare Workers Builds flow. Before closing a macro, verify that the final pushed HEAD has a successful `Workers Builds: seat-lottery-simulator` check and that the public URL returns HTTP 200.

## Validation status

- 2026-08-09 Tokyo macro 1 data checks: `venues:build`, `venues:check`, `venues:validate`, `venues:inventory:report`, `venues:readiness:report`, `venues:batch:report`, `venues:release:coverage`, and `venues:report` passed; production remains 56 venues / 74,959 seats.
- Full application validation passed: `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check`.
- The final pushed `main` state is on `origin/main`; the latest verified `Workers Builds: seat-lottery-simulator` succeeded, and the public URL returned HTTP 200.
- Existing warnings remain limited to Kyocera Dome row fragmentation, inventory duplicate-candidate reporting, and 300/500-venue size projections; no database validation errors.
- E2E required the approved elevated run because Miniflare writes the user Wrangler registry outside the workspace; the sandbox-only attempt failed with `EPERM` and was not a repository failure.

## Exact next action

Run a **new Luna high Tokyo top-up STANDARD macro 2** for `nissay-theatre`, `line-cube-shibuya`, and `kioi-hall`, starting from `data/venue-release-targets/tokyo-top-up-v1.json` and existing inventory/source state. Complete each venue through official primary-source confirmation, first pass, independent second pass, and production or a concrete HOLD/MISMATCH. Preserve the three macro-1 Tokyo closures and every Kanto hold; do not start `kameari-lirio-hall`, remaining Tokyo candidates, or P2 national-city work in that macro.
