# Current handoff

Updated: 2026-08-09 (Asia/Tokyo)

## Current state

- Base HEAD before handoff setup: `681c98849adb6329aa30154c6c7111000aa0e167`; branch `main`; working tree was clean except the handoff files being established.
- Production: **52 venues / 68,652 seats**. Generated sources, catalog, runtime details, and production fingerprints are synchronized at 52 each.
- Coverage: Tokyo **48**, Kanagawa **1**, Chiba **0**, Saitama **0**, Ibaraki **0**, Tochigi **1**, Gunma **0**; Osaka **2**. Kanto total: **50**.
- Tokyo production count is taken from `data/venue-sources/` and generated production artifacts, not from the old README summary.

## Release goal

Release `release-seed-v1` with the production gate intact, prioritizing Kanto P0/P1 coverage and keeping only major national-city venues in scope. Release ready is currently **no**.

## Kanto macro classification

- **PRODUCTION**: `yokohama-minatomirai-hall-main-release-seed`, `utsunomiya-city-culture-hall-release-seed`.
- **LUNA**: `sagamihara-green-hall-main-release-seed` (official numbered map and exact 1,790-seat count are identified; range entry and two-pass review remain).
- **TERRA**: `muza-kawasaki-symphony-hall-release-seed`, `tokorozawa-muse-ark-release-seed`.
- **SOL**: `kanagawa-kenmin-hall-main-release-seed`, `yokosuka-arts-theatre-release-seed`, `culttz-kawasaki-hall-release-seed`, `ichikawa-culture-hall-main-release-seed`, `mori-no-hall21-main-release-seed`, `saitama-arts-theatre-main-release-seed`, `saitama-kaikan-main-release-seed`, `omiya-sonic-city-large-release-seed`, `westa-kawagoe-large-release-seed`, `takasaki-city-theatre-main-release-seed`.
- **HOLD**: `narashino-culture-hall-release-seed`, `funabashi-civic-culture-hall-release-seed`, `chiba-city-culture-center-hall-release-seed`, `urayasu-culture-hall-release-seed`, `kawaguchi-lilia-main-release-seed`, `mito-arts-tower-concert-release-seed`, `ibaraki-kenritsu-bunka-center-large-release-seed`, `tochigi-ken-sogo-bunka-center-main-release-seed`, `gunma-music-center-release-seed`.

## Tokyo top-up

16 candidates remain: 8 STANDARD candidates for Luna review, 5 COMPLEX candidates for later judgment, and 3 POLICY/SOURCE HOLD candidates. Do not re-investigate the already classified difficult cases as Luna work.

## Model queues

- **LUNA NEXT**: complete Sagamihara's first pass → independent second pass → comparison → production decision. Then process any newly verified ordinary Tokyo STANDARD candidate in a separate batch.
- **TERRA NEXT**: `muza-kawasaki-symphony-hall-release-seed`, `tokorozawa-muse-ark-release-seed`, plus dense non-Kanto handoffs in the existing closure report; group 5–8 venues per macro.
- **SOL NEXT**: Kanto's 10 advanced-decision venues above; group 4–6 venues per macro.

## Holds

Existing closure holds include source-incomplete Chiba/Ibaraki/Tochigi/Gunma candidates, Sendai Sunplaza policy ambiguity, Sapporo hitaru policy ambiguity, Misonoza policy ambiguity, Umeda date hold, Hakataza source hold, and the ACROS official 1,871 vs 1,885 contradiction. Do not promote any hold by arithmetic or inference.

## Deployment verification

The repository identifies the official URL as `https://seat-lottery-simulator.studiotomo.workers.dev/`; prior reachability was verified, but the public UI does not expose a commit SHA. Current exact-HEAD deployment verification is **pending**.

## Exact next action

Run the two-pass official range transcription for `sagamihara-green-hall-main-release-seed`, reconcile its 1,790-seat official count, promote only if all production gates pass, then regenerate and run the venue checks before the Kanto checkpoint commit.
