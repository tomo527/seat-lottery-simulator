# Current save state

Updated: 2026-08-25 (Asia/Tokyo)

## Current state

TOKYO-WAVE-24 ordinary bounded integration is released. Its data commit `9d2a66cd2bdfc3738bd3e0513288d1d52da6fe68` is pushed in main history. The authorized baseline for the current bounded hard-case audit was clean `main` / `origin/main` `4cfc6004f83c897ee3ccdcf551dd29031373d27f`; no reset or revert was performed.

TOKYO-WAVE-25 preflight is formally closed with **0 ADOPT / 6 DEFERRED**. [`data/venue-reports/tokyo-wave-25-2026-08-24.json`](../data/venue-reports/tokyo-wave-25-2026-08-24.json) preserves the completed current first-party evidence for `0726`, `0993`, `0989`, `0561`, `0426`, and `0708`; their inventory records are `blocked` so they cannot re-enter ordinary candidate discovery. No venue source, range, catalog, runtime artifact, fingerprint, or production total changed.

The authorized `NEXT TERRA PREFLIGHT` is now formally closed with **0 ADOPT / 4 DEFERRED / 2 HARD-CASE DEFER**. [`data/venue-reports/tokyo-next-terra-preflight-2026-08-24.json`](../data/venue-reports/tokyo-next-terra-preflight-2026-08-24.json) preserves the completed first-party evidence for `0373`, `0425`, `0709`, `0611`, `1017`, and `1058`; their inventory records are `blocked` so they cannot re-enter ordinary discovery. None is permanently rejected.

The bounded `JUDGMENT` hard-case audit of `0611` and `1017` is complete and both are **NEED EVIDENCE**. For 駒沢体育館, the issuer map labels the row in each visible block (A-K), but prints no individual seat numbers; its 2,354-seat map also does not reconcile to the current guide's fixed 2,238 + wheelchair 24 + amenity 12 + temporary maximum 1,152 scope without choosing an unsupported generation/scope. For アリーナ立川立飛, the current-linked official layout defines 1F/2F and movable/court-side/wheelchair/media/camera subtotals, but prints no seat IDs or row labels; its movable-bank arithmetic is 108 x 2 + 155 x 2 = 526 against the printed 528 movable subtotal. Geometry or capacity fitting cannot resolve either venue. No source JSON or implementation was created.

The authorized legacy `TYPE-ONLY REPRESENTATIVE PREFLIGHT` is formally closed with **1 ADOPT / 5 DEFER / 0 HARD-CASE DEFER**. [`data/venue-reports/tokyo-type-only-representative-preflight-2026-08-25.json`](../data/venue-reports/tokyo-type-only-representative-preflight-2026-08-25.json) records the A/B legacy pool (9 eligible, 8 metadata-ranked, 6 current-first-party checks) and updates every checked inventory record so it cannot re-enter ordinary discovery. Only `tokyo-official-0121` (品川プリンスホテル ステラボール) is a preflight ADOPT: the current issuer page links its numbered 1F 750 + 2F 126 seat chart and reports the same 876-seat configuration. This is not production data; no source, range, catalog, runtime artifact, fingerprint, or production total changed. `0106`, `0160`, and `0435` lack a current issuer-numbered set; `0372` and `0072` are current closure/renovation holds.

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

- `tokyo-official-0048` 国立劇場 大劇場 and `tokyo-official-0049` 小劇場 are **CLOSED / CURRENTNESS HOLD** from the coverage universe: both have been closed since 2023 and await replacement-facility material.
- `tokyo-official-1060` FOSTERホール is **RENOVATION HOLD** through 2026-12-01.
- `tokyo-official-1020` 国立音楽大学 講堂小ホール is **SOURCE HOLD** because no current complete numbered map is registered.
- `tokyo-official-1071` 京王アリーナTOKYO メインアリーナ is the same facility-space as canonical `musashino-forest-sport-plaza-standard`; retain its **SOURCE/POLICY/SCHEMA HOLD**, rather than rediscovering it under the official-list ID.
- `tokyo-official-1090` remains without a formal disposition in repository evidence. It is outside the current scope; do not infer or research a disposition from this handoff.
- `tokyo-official-0373`, `tokyo-official-0425`, `tokyo-official-0709`, and `tokyo-official-1058` are formally deferred, while `tokyo-official-0611` and `tokyo-official-1017` are hard-case deferred with the current audit result **NEED EVIDENCE**. Reopen only under the evidence conditions in the formal report and inventory blockers.
- Future hard-case candidates (`tokyo-theatre-1010`, `tokyo-koganei-miyaji-main`, `tokyo-coverage-ex-theater-ariake`, `aichi-arts-center-main`, `takasaki-city-theatre-main`) are outside this ordinary wave.

## Release verification

- Canonical `npm run verify:venues` passed: venue/inventory/release coverage, generated-artifact sync, fingerprints, lint, typecheck, 212 unit tests, production build, 17 E2E tests, docs verification, and diff check.
- The GitHub check run **Workers Builds: seat-lottery-simulator** for `9d2a66c` completed successfully.
- At `https://seat-lottery-simulator.studiotomo.workers.dev/`, the venue selector found the three promoted venues with 1,027 / 729 / 1,102 displayed seats. One draw was started for each; no console errors were observed.

## Exact next action

Do not implement, deploy, or start candidate research without separate authorization. If authorized, create only the non-production `stellar-ball-standard` draft, independently extract the current official 1F/2F numbered seat chart twice, and verify the issuer 750 + 126 = 876 arithmetic before any production decision.
