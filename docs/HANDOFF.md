# Current handoff

Updated: 2026-08-09 (Asia/Tokyo)

## Current state

- Current HEAD is the commit containing this handoff; resolve the exact SHA with `git rev-parse HEAD`. Branch `main` is pushed to `origin/main`, local HEAD equals `origin/main`, and the working tree is clean at handoff completion.
- Production: **55 venues / 74,183 seats**. Generated sources, catalog, runtime details, and production fingerprints are synchronized at 55 each.
- Coverage: Tokyo **48**, Kanagawa **3**, Chiba **1**, Saitama **0**, Ibaraki **0**, Tochigi **1**, Gunma **0**; Osaka **2**. Kanto total: **53**.
- The 2026-08-09 Kanto Terra review made no production promotions and preserved all 55 production fingerprints.

## Release goal

Release `release-seed-v1` with the production gate intact, prioritizing remaining Kanto P0, then Kanto P1, Tokyo top-up, and only then the scoped major national cities. Release ready is **no**.

## Kanto macro classification

- **PRODUCTION**: `yokohama-minatomirai-hall-main-release-seed`, `sagamihara-green-hall-main-release-seed`, `culttz-kawasaki-hall-release-seed`, `ichikawa-culture-hall-main-release-seed`, `utsunomiya-city-culture-hall-release-seed`.
- **LUNA**: none remaining in Kanto.
- **TERRA**: none remaining in Kanto.
- **SOL**: `yokosuka-arts-theatre-release-seed` (localized independent-review mismatch), `mori-no-hall21-main-release-seed`, `saitama-arts-theatre-main-release-seed`, `saitama-kaikan-main-release-seed`, `omiya-sonic-city-large-release-seed`, `westa-kawagoe-large-release-seed`, `takasaki-city-theatre-main-release-seed`.
- **HOLD**: `kanagawa-kenmin-hall-main-release-seed` (SOURCE HOLD), `muza-kawasaki-symphony-hall-release-seed` (SOURCE HOLD), `tokorozawa-muse-ark-release-seed` (POLICY HOLD), `narashino-culture-hall-release-seed`, `funabashi-civic-culture-hall-release-seed`, `chiba-city-culture-center-hall-release-seed`, `urayasu-culture-hall-release-seed`, `kawaguchi-lilia-main-release-seed`, `mito-arts-tower-concert-release-seed`, `ibaraki-kenritsu-bunka-center-large-release-seed`, `tochigi-ken-sogo-bunka-center-main-release-seed`, `gunma-music-center-release-seed`.

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

16 candidates remain: 7 STANDARD candidates ready for a future Luna source pass, 4 COMPLEX candidates for later judgment, and 5 HOLD candidates. Do not start Tokyo top-up until remaining Kanto P0 and P1 queues have been processed.

## Model queues

- **LUNA NEXT**: none in Kanto; defer the Tokyo STANDARD source pass.
- **TERRA NEXT**: none in Kanto.
- **SOL NEXT**: resolve only the four-seat M-N localized mismatch for `yokosuka-arts-theatre-release-seed`; then `mori-no-hall21-main-release-seed`, `saitama-arts-theatre-main-release-seed`, `saitama-kaikan-main-release-seed`, `omiya-sonic-city-large-release-seed`, and `westa-kawagoe-large-release-seed`; after P0, `takasaki-city-theatre-main-release-seed`.
- **HOLD**: keep `kanagawa-kenmin-hall-main-release-seed` and `muza-kawasaki-symphony-hall-release-seed` blocked until an independently readable issuer-owned row/number source is available; keep `tokorozawa-muse-ark-release-seed` blocked until the issuer defines one fixed normal versus wheelchair-converted representative pattern; retain the other existing Kanto source/policy holds.

## Holds

Existing closure holds also include Sendai Sunplaza policy ambiguity, Sapporo hitaru policy ambiguity, Misonoza policy ambiguity, Umeda date hold, Hakataza source hold, and the ACROS official 1,871 vs 1,885 contradiction. Do not promote any hold by arithmetic or inference.

## Deployment verification

The official URL is `https://seat-lottery-simulator.studiotomo.workers.dev/`. The repository uses the established GitHub-to-Cloudflare Workers Builds flow; exact-HEAD public deployment verification remains pending after push.

## Validation status

- 2026-08-09: `venues:inventory:report`, `venues:release:coverage`, `venues:build`, `venues:check`, `venues:validate`, `venues:report`, `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check` passed after the Terra macro.
- Validation result: 55 production venues / 74,183 seats. Existing warnings remain limited to Kyocera Dome row fragmentation and 300/500-venue size projections; no validation errors.
- E2E required the approved elevated run because Miniflare writes the user Wrangler registry outside the workspace; the sandbox-only attempt failed with `EPERM` and was not a repository failure.

## Exact next action

Run a **new Sol high Kanto P0 macro**: resolve only the four-seat M-N wheelchair-adjacent diff in `yokosuka-arts-theatre-release-seed`, then process `mori-no-hall21-main-release-seed`, `saitama-arts-theatre-main-release-seed`, `saitama-kaikan-main-release-seed`, `omiya-sonic-city-large-release-seed`, and `westa-kawagoe-large-release-seed`. Keep `takasaki-city-theatre-main-release-seed` as P1 after P0. Preserve all SOURCE/POLICY HOLDs; do not begin Tokyo top-up or national-city research.
