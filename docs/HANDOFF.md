# Current handoff

Updated: 2026-08-09 (Asia/Tokyo)

## Current state

- Current HEAD at the final validation checkpoint: `d0deb31` (`feat(venues): expand Kanto release coverage`); branch `main`; checkpoint is pushed to `origin/main` and the working tree is clean.
- Production: **52 venues / 68,652 seats**. Generated sources, catalog, runtime details, and production fingerprints are synchronized at 52 each.
- Coverage: Tokyo **48**, Kanagawa **1**, Chiba **0**, Saitama **0**, Ibaraki **0**, Tochigi **1**, Gunma **0**; Osaka **2**. Kanto total: **50**.
- Tokyo production count is taken from `data/venue-sources/` and generated production artifacts, not from the old README summary.

## Release goal

Release `release-seed-v1` with the production gate intact, prioritizing Kanto P0/P1 coverage and keeping only major national-city venues in scope. Release ready is currently **no**.

## Kanto macro classification

- **PRODUCTION**: `yokohama-minatomirai-hall-main-release-seed`, `utsunomiya-city-culture-hall-release-seed`.
- **LUNA**: none remaining after the current pass. The only prior Kanto Luna candidate, `sagamihara-green-hall-main-release-seed`, reached two independent visual readings but exposed an unresolved 20-seat official-map versus official-count mismatch and is now **SOL**.
- **TERRA**: `muza-kawasaki-symphony-hall-release-seed`, `tokorozawa-muse-ark-release-seed`.
- **SOL**: `sagamihara-green-hall-main-release-seed`, `kanagawa-kenmin-hall-main-release-seed`, `yokosuka-arts-theatre-release-seed`, `culttz-kawasaki-hall-release-seed`, `ichikawa-culture-hall-main-release-seed`, `mori-no-hall21-main-release-seed`, `saitama-arts-theatre-main-release-seed`, `saitama-kaikan-main-release-seed`, `omiya-sonic-city-large-release-seed`, `westa-kawagoe-large-release-seed`, `takasaki-city-theatre-main-release-seed`.
- **HOLD**: `narashino-culture-hall-release-seed`, `funabashi-civic-culture-hall-release-seed`, `chiba-city-culture-center-hall-release-seed`, `urayasu-culture-hall-release-seed`, `kawaguchi-lilia-main-release-seed`, `mito-arts-tower-concert-release-seed`, `ibaraki-kenritsu-bunka-center-large-release-seed`, `tochigi-ken-sogo-bunka-center-main-release-seed`, `gunma-music-center-release-seed`.

## Tokyo top-up

16 candidates remain: 7 STANDARD candidates ready for a future Luna source pass, 4 COMPLEX candidates for later judgment, and 5 HOLD candidates (NHK, three policy holds, and Bunkamura source hold). Do not re-investigate already classified difficult cases as Luna work.

## Model queues

- **LUNA NEXT**: start a separate Tokyo STANDARD source pass only after an official map/count pair is ready; no current Kanto Luna venue passed the gate.
- **TERRA NEXT**: `muza-kawasaki-symphony-hall-release-seed`, `tokorozawa-muse-ark-release-seed`, `sapporo-kitara-main-release-seed`, `sendai-sunplaza-hall-release-seed`, `kyoto-concert-hall-main-release-seed`.
- **SOL NEXT**: `sagamihara-green-hall-main-release-seed`, `kanagawa-kenmin-hall-main-release-seed`, `yokosuka-arts-theatre-release-seed`, `culttz-kawasaki-hall-release-seed`, `ichikawa-culture-hall-main-release-seed`.

## Holds

Existing closure holds include source-incomplete Chiba/Ibaraki/Tochigi/Gunma candidates, Sendai Sunplaza policy ambiguity, Sapporo hitaru policy ambiguity, Misonoza policy ambiguity, Umeda date hold, Hakataza source hold, and the ACROS official 1,871 vs 1,885 contradiction. Do not promote any hold by arithmetic or inference.

## Deployment verification

The repository identifies the official URL as `https://seat-lottery-simulator.studiotomo.workers.dev/`; prior reachability was verified, but the public UI does not expose a commit SHA. Current exact-HEAD deployment verification is **pending**.

## Validation status

- 2026-08-09: `venues:inventory:report`, `venues:release:coverage`, `venues:build`, `venues:check`, `venues:validate`, `venues:report`, `lint`, `typecheck`, `test` (16 files / 116 tests), `build`, `test:e2e` (11 tests), and `git diff --check` passed.
- Existing validation warnings remain: Kyocera Dome row fragmentation and 300/500-venue size projections. No validation errors.
- E2E required the approved elevated run because Miniflare must write the user Wrangler registry outside the workspace; the sandbox-only attempt failed with `EPERM` and was not a repository failure.

## Exact next action

Resolve the official 20-seat 1F mismatch for `sagamihara-green-hall-main-release-seed` in Sol using issuer-owned material; do not enter ranges until the exclusion/layout explanation is explicit. Then process the next Terra/Sol macro and start Tokyo only with a complete official map/count pair.
