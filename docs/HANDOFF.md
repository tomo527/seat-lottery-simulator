# Current save state

Updated: 2026-08-21 (Asia/Tokyo)

## Current state

- Baseline repository state before the current uncommitted Harness work: `main` at `9b9d1460711ea9e984d24e264d10d55dd38598cb`, equal to `origin/main`.
- Production data is **94 venues / 96 selectable configurations / 151,748 configuration-seat records**. Tokyo user-visible production coverage is **38/76 (50.0%)**, MUST **24/44 (54.5%)**, SHOULD **14/28 (50.0%)**; `venues:release:coverage` reports **RELEASE READY: yes**.
- `TOKYO-WAVE-12` is complete and deployed. `nissay-theatre-standard/current-official-block-numbered-seat-map` is production with 1,490 mapped seats; the other three bounded targets remain non-production handoffs.
- Harness engineering Phase 1 is implemented in the working tree: permanent topology, validation, and deployment knowledge is separated from this file; `verify:*` npm entry points compose the existing checks. No application behavior, venue source, generated venue artifact, or production meaning was intentionally changed.
- Harness Phase 2A is implemented in the working tree: `AGENTS.md` is agent-neutral, `CLAUDE.md` imports it, `docs/VENUE_WORKFLOW.md` is the single venue-wave procedure, and identical thin adapters expose it from `.agents/skills/` and `.claude/skills/`.

## Unresolved items

- `tokyo-geigeki-playhouse-standard`: current official material has an internal 845-versus-829 numbered-seat contradiction; the repository readiness record also requires post-renovation/reopening currentness confirmation.
- `shinbashi-enbujo-standard`: current official 2F/3F side groups lack issuer-defined row/area ownership.
- `bunkyo-civic-main-standard`: current official 1F side cells lack unique row ownership; the visual attachment totals 1,258 against the stated 1,242.
- The current Harness changes are uncommitted by request. Commit, push, and deploy were not authorized.

## Exact next action

Await explicit authorization to commit the uncommitted Harness Phase 1+2A diff. Do not start a venue wave, Phase 2B, push, or deploy implicitly.

## Recent completed work

- 2026-08-21: Harness Phase 2A added the shared Codex/Claude instruction adapter structure and canonical venue-wave workflow without changing application or venue semantics. `verify:docs` passed all 20 Markdown files plus the CLAUDE import/frontmatter/canonical-link/adapter-drift contracts; `node --check scripts/verify-docs.mjs`, ESLint, and provider-neutral new-session self-audits also passed.
- 2026-08-21: Harness engineering Phase 1 reorganized operational documentation and added proportional `verify:*` commands. Inventory/readiness/release reports, venue build/check/validate/report, lint, typecheck, unit tests (**20 files / 212 tests**), production build, local Markdown links, and diff checks passed; E2E passed **16/16** in the approved run after the known sandbox Wrangler-registry `EPERM`. Venue generation produced no tracked source/generated-artifact diff. The 24 existing venue validation warnings remain review information, not errors.
- 2026-08-20: Tokyo Wave 12 added the Nissay Theatre representative configuration, synchronized the bounded batch/readiness/coverage/generated artifacts/fingerprint, passed the full venue and app validation set, and was verified on the public Workers deployment with no browser console errors.
