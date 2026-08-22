# Current save state

Updated: 2026-08-22 (Asia/Tokyo)

## Current state

- The adopted TOKYO-WAVE-12 integration was committed and pushed to main as 5b62098. Public static runtime endpoints serve both new venue artifacts. The in-app browser connector remains unavailable in this environment because of the documented Windows sandbox EPERM; canonical local E2E passed.
- Production data is **95 venues / 97 selectable configurations / 152,438 configuration-seat records**. Tokyo user-visible production coverage is **39/76 (51.3%)**, MUST **25/44 (56.8%)**, SHOULD **14/28 (50.0%)**; venues:release:coverage reports **RELEASE READY: yes**.
- nissay-theatre-standard/current-official-block-numbered-seat-map is corrected atomically to the current official PDF printed set: **1,335 mapped / 1,334 official / rangeDiff +1 / representative**. No capacity fitting was used.
- tokyo-geigeki-playhouse-standard/current-official-printed-seat-map is production: **845 mapped / 829 official / rangeDiff +16 / representative**. It preserves the official PDF's 1F A-E **132 printed versus 116 table** difference, the pit-removal, wheelchair-conversion, and performance-difference disclosures; no capacity fitting was used.
- TOKYO-WAVE-13 is closed as **4/4 SOURCE HOLD** with no production promotion: hitomi-memorial-hall-standard (2,070; row-8 wheelchair-compatible IDs 8, 9, 10, 45, 46, 47), tokyo-wave3-1019 (current-linked 1,290-seat PDF; pit variant separate), koganei-miyaji-main-standard (normal 569; 578-seat and front-row-removal operations separate), and theatre-1010-standard (701; independent read-only confirmation). Each has a current/current-linked official numbered map, but segmented or side-number groups lack issuer-defined row/area ownership; no geometric transcription, capacity fitting, or repository-defined ownership was made.

## Unresolved items

- shinbashi-enbujo-standard remains **USER REVIEW HOLD**: current official 2F/3F side number groups have no issuer-defined row/area ownership.
- bunkyo-civic-main-standard remains **USER REVIEW HOLD**: current official 1F side cells have no unique issuer-defined row ownership; visual occurrence is 1,258 versus the published 1,242 on 1F.
- iino-hall-standard is a separate follow-up. Do not reopen it in this closure.
- The four Wave13 source holds are not USER REVIEW HOLD and do not block a separately authorized future wave.

## Exact next action

Do not begin Wave14 without explicit authorization. Reopen an individual Wave13 source only if an issuer-defined row/area key or an equivalently explicit current official numbered-group label becomes available; do not infer it from diagram geometry.

## Recent completed work

- 2026-08-22: Integrated the two adopted TOKYO-WAVE-12 Sol audit conclusions only; source, inventory, Wave 1/Wave 12 readiness, Wave 12 result report, production fingerprint, catalog, and runtime artifacts are synchronized. Targeted review passed: Nissay 1,335 and Playhouse 845. Canonical venue validation is recorded in the active task before commit/push.
- 2026-08-22: Closed the explicitly bounded TOKYO-WAVE-13 scope as four source holds. Source, Tokyo inventory, carry-over batch, Wave 1/Wave 13 readiness, and Wave13 result report record the same evidence-based ownership blocker; production source data, generated catalog/runtime artifacts, and fingerprints remain unchanged. Targeted batch review/report and canonical `verify:venues` passed in the approved environment (including inventory/readiness/release coverage, build/check/validate/report, lint, typecheck, 212 unit tests, production build, 16 Playwright E2E tests, docs, and diff check).
