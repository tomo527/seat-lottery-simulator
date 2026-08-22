# Current save state

Updated: 2026-08-22 (Asia/Tokyo)

## Current state

- main, local HEAD, and origin/main were 6fdb500314d2cad1c7068beb1a4e4a8b4c0c5b52 at integration start. The working tree now contains only the uncommitted TOKYO-WAVE-12 Sol-audit integration and its generated artifacts.
- Production data is **95 venues / 97 selectable configurations / 152,438 configuration-seat records**. Tokyo user-visible production coverage is **39/76 (51.3%)**, MUST **25/44 (56.8%)**, SHOULD **14/28 (50.0%)**; venues:release:coverage reports **RELEASE READY: yes**.
- nissay-theatre-standard/current-official-block-numbered-seat-map is corrected atomically to the current official PDF printed set: **1,335 mapped / 1,334 official / rangeDiff +1 / representative**. No capacity fitting was used.
- tokyo-geigeki-playhouse-standard/current-official-printed-seat-map is production: **845 mapped / 829 official / rangeDiff +16 / representative**. It preserves the official PDF's 1F A-E **132 printed versus 116 table** difference, the pit-removal, wheelchair-conversion, and performance-difference disclosures; no capacity fitting was used.

## Unresolved items

- shinbashi-enbujo-standard remains draft: current official 2F/3F side number groups have no issuer-defined row/area ownership.
- bunkyo-civic-main-standard remains draft: current official 1F side cells have no unique issuer-defined row ownership; visual occurrence is 1,258 versus the published 1,242 on 1F.
- iino-hall-standard is a separate follow-up. Do not reopen it in this closure.

## Exact next action

After the authorized commit/push/deployment verification for this integration, wait for **USER CONFIRMATION REQUIRED** on the official-source questions for Shinbashi Enbujo and Bunkyo Civic Hall Main Hall. Do not productionize either, create repository-defined row/area ownership, or begin Wave 13.

## Recent completed work

- 2026-08-22: Integrated the two adopted TOKYO-WAVE-12 Sol audit conclusions only; source, inventory, Wave 1/Wave 12 readiness, Wave 12 result report, production fingerprint, catalog, and runtime artifacts are synchronized. Targeted review passed: Nissay 1,335 and Playhouse 845. Canonical venue validation is recorded in the active task before commit/push.
