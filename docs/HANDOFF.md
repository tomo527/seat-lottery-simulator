# Current save state

Updated: 2026-08-22 (Asia/Tokyo)

## Current state

- TOKYO-WAVE-15 promoted exactly よみうり大手町ホール and 八王子市南大沢文化会館〔主ホール〕 in commit `8f0c2db`, pushed to `main`. The managed Workers Builds check succeeded (build `f3c9254f-7390-4912-a4ff-7dcd21309f5a`), and both public runtime detail endpoints returned HTTP 200 with their expected mapped-seat totals.
- Production data is **99 venues / 101 selectable configurations / 154,353 configuration-seat records**. `venues:release:coverage` remains **RELEASE READY: yes**; the fixed Tokyo coverage universe is **40/76 (52.6%)**, MUST **25/44 (56.8%)**, SHOULD **15/28 (53.6%)**. よみうり大手町ホール is the sole Wave15 addressable cohort addition; 南大沢主ホール is outside that fixed universe.
- tokyo-wave3-0041/standard is production with **501 mapped / 501 official / rangeDiff 0 / representative**. It preserves the complete normal one-floor printed set; the maximum-eight-wheelchair conversion is separate metadata because individual removed IDs are not published.
- tokyo-wave3-0991/standard is production with **496 mapped / 500 official / rangeDiff -4 / representative**. The four-seat difference is the official, unnumbered wheelchair-space metadata. Printed dotted removable-seat IDs remain in the normal configuration.
- nissay-theatre-standard/current-official-block-numbered-seat-map is corrected atomically to the current official PDF printed set: **1,335 mapped / 1,334 official / rangeDiff +1 / representative**. No capacity fitting was used.
- tokyo-geigeki-playhouse-standard/current-official-printed-seat-map is production: **845 mapped / 829 official / rangeDiff +16 / representative**. It preserves the official PDF's 1F A-E **132 printed versus 116 table** difference, the pit-removal, wheelchair-conversion, and performance-difference disclosures; no capacity fitting was used.
- TOKYO-WAVE-13 is closed as **4/4 SOURCE HOLD** with no production promotion: hitomi-memorial-hall-standard (2,070; row-8 wheelchair-compatible IDs 8, 9, 10, 45, 46, 47), tokyo-wave3-1019 (current-linked 1,290-seat PDF; pit variant separate), koganei-miyaji-main-standard (normal 569; 578-seat and front-row-removal operations separate), and theatre-1010-standard (701; independent read-only confirmation). Each has a current/current-linked official numbered map, but segmented or side-number groups lack issuer-defined row/area ownership; no geometric transcription, capacity fitting, or repository-defined ownership was made.

## Unresolved items

- shinbashi-enbujo-standard remains **USER REVIEW HOLD**: current official 2F/3F side number groups have no issuer-defined row/area ownership.
- bunkyo-civic-main-standard remains **USER REVIEW HOLD**: current official 1F side cells have no unique issuer-defined row ownership; visual occurrence is 1,258 versus the published 1,242 on 1F.
- iino-hall-standard is a separate follow-up. Do not reopen it in this closure.
- The four Wave13 source holds are not USER REVIEW HOLD and do not block a separately authorized future wave.

## Exact next action

Do not research or implement Wave16 without separate authorization. Reopen an individual Wave13 source only if an issuer-defined row/area key or an equivalently explicit current official numbered-group label becomes available; do not infer it from diagram geometry.

## Recent completed work

- 2026-08-22: Integrated the two adopted TOKYO-WAVE-12 Sol audit conclusions only; source, inventory, Wave 1/Wave 12 readiness, Wave 12 result report, production fingerprint, catalog, and runtime artifacts are synchronized. Targeted review passed: Nissay 1,335 and Playhouse 845. Canonical venue validation is recorded in the active task before commit/push.
- 2026-08-22: Closed the explicitly bounded TOKYO-WAVE-13 scope as four source holds. Source, Tokyo inventory, carry-over batch, Wave 1/Wave 13 readiness, and Wave13 result report record the same evidence-based ownership blocker; production source data, generated catalog/runtime artifacts, and fingerprints remain unchanged. Targeted batch review/report and canonical `verify:venues` passed in the approved environment (including inventory/readiness/release coverage, build/check/validate/report, lint, typecheck, 212 unit tests, production build, 16 Playwright E2E tests, docs, and diff check).
- 2026-08-22: TOKYO-WAVE-14 directly transcribed the adopted current official printed sets only: 星陵会館〔ホール〕 normal400 and 府中の森芸術劇場〔ふるさとホール〕 numbered-general518. The latter preserves the official six unnumbered wheelchair spaces and separate 64-seat hanamichi operation as metadata; no capacity fitting or inferred IDs were used.
- 2026-08-22: Canonical `verify:venues` passed in the approved environment: targeted review, inventory/readiness/release coverage, build/check/validate/report, lint, typecheck, 212 unit tests, production build, 16 Playwright E2E tests, docs, and diff check. The restricted sandbox hit a Vite child-process `spawn EPERM` before unit tests; its approved-environment rerun passed. The in-app browser exposed no actionable deployed-app tab, so search/draw/console remain unconfirmed; public runtime JSON and managed deployment status are confirmed.
- 2026-08-22: TOKYO-WAVE-15 directly transcribed the adopted official printed sets only: よみうり大手町ホール normal501 and 八王子市南大沢文化会館〔主ホール〕 fixed printed496. The latter preserves four unnumbered wheelchair spaces and all printed dotted removable-seat IDs; no capacity fitting, inferred IDs, or configuration mixing was used. Target reviews, batch report, and canonical `verify:venues` passed in the approved environment; the restricted sandbox's incomplete Vite child process was stopped before the approved rerun.
- 2026-08-22: Wave15 commit `8f0c2db` is deployed through the managed Workers Builds integration. Public runtime detail endpoints confirmed tokyo-wave3-0041/standard=501 and tokyo-wave3-0991/standard=496. Production browser search/draw/console were not separately exercised because no actionable in-app browser tab was available; canonical E2E passed.
