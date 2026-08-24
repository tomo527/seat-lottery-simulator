# Current save state

Updated: 2026-08-24 (Asia/Tokyo)

## Current state

TOKYO-WAVE-24 ordinary bounded integration is released. The authorized baseline was `main` / `a6f13c7b5489ceed08a088d12bd87542c2213e6f`; no reset or revert was performed. Data commit `9d2a66cd2bdfc3738bd3e0513288d1d52da6fe68` is pushed to `main` and `origin/main`.

| Item | State |
| --- | --- |
| Wave24 promotions | 3 (`tokyo-wave3-1170`, `tokyo-wave3-0645`, `tokyo-wave3-0330`) |
| Wave24 HOLD | 1 (`tokyo-wave3-1114`) |
| Authoring production target | 118 venues / 120 selectable configurations / 177,317 configuration-seat records |
| Expected release coverage | Tokyo 48/76 · MUST 29/44 · SHOULD 19/28 · RELEASE READY yes |
| Validation / generated artifacts | `npm run verify:venues` passed; catalog/runtime/fingerprint synchronized |
| Commit / push / Workers / public UI | pushed `9d2a66c`; Workers Builds check `completed / success`; public smoke test passed |

## TOKYO-WAVE-24 decisions

- **武蔵村山市民会館 さくらホール〔大ホール〕** (`tokyo-official-1170` → existing canonical `tokyo-wave3-1170`) — **PRODUCTION**: 1,027 printed / 1,032 published / rangeDiff -5 / representative. Fixed 909, movable 123 and five unnumbered wheelchair spaces are source metadata; all printed movable numbers remain in scope.
- **渋谷区文化総合センター大和田〔さくらホール〕** (`tokyo-official-0645` → existing canonical `tokyo-wave3-0645`) — **PRODUCTION**: 1F 535 + 2F 172 + balcony 22 = 729 printed / 735 published / rangeDiff -6 / representative. Fixed 407 (including 20 back-reclining seats) and movable 128 remain in scope; parent seats 4 and wheelchair seats 2 are unnumbered metadata.
- **東京藝術大学奏楽堂** (`tokyo-official-0330` → `tokyo-wave3-0330`) — **PRODUCTION**: front 958 + BL/BR 144 = 1,102 printed / 1,100 published / rangeDiff +2 / representative. The eight wheelchair-compatible printed seats stay in the normal set.
- **ルネこだいら 大ホール** (`tokyo-official-1114` → `tokyo-wave3-1114`) — **SOURCE HOLD**: the current map's 2F set independently totals 466, but its visible 1F numbered positions cannot be reduced to issuer subtotal 754 without deciding the relation of wheelchair-labelled positions. No ID was invented or deleted. Next evidence: issuer-defined 1F seat list or arithmetic that resolves the 754-seat total.

### Historical ID reconciliation

`tokyo-official-1170`/`tokyo-wave3-1170` and `tokyo-official-0645`/`tokyo-wave3-0645` are each the same venue. Both prior Wave3 records were incomplete drafts, not REJECT/HOLD dispositions; each was **reopened under current policy/evidence** and updated in place. Future candidate exclusion must match by canonical `venueSourceId` and facility-space identity, not only by inventory-ID prefix, so a previously investigated venue cannot re-enter through an `official-*` versus `wave3-*` ID difference.

## Unchanged deferrals

- `tokyo-official-1060` FOSTERホール remains DEFERRED for renovation closure through 2026-12-01.
- `tokyo-official-1020` 国立音楽大学 講堂小ホール remains DEFERRED because no current numbered map is registered.
- Future hard-case candidates (`tokyo-theatre-1010`, `tokyo-koganei-miyaji-main`, `tokyo-coverage-ex-theater-ariake`, `aichi-arts-center-main`, `takasaki-city-theatre-main`) are outside this ordinary wave.

## Release verification

- Canonical `npm run verify:venues` passed: venue/inventory/release coverage, generated-artifact sync, fingerprints, lint, typecheck, 212 unit tests, production build, 17 E2E tests, docs verification, and diff check.
- The GitHub check run **Workers Builds: seat-lottery-simulator** for `9d2a66c` completed successfully.
- At `https://seat-lottery-simulator.studiotomo.workers.dev/`, the venue selector found the three promoted venues with 1,027 / 729 / 1,102 displayed seats. One draw was started for each; no console errors were observed.

## Exact next action

Run `NEXT TERRA PREFLIGHT` only: use inventory metadata to construct an exclusion-aware bounded shortlist from unprocessed Tokyo A/B records. Do not begin web research until that preflight is explicitly started.
