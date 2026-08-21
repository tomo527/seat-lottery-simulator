# Current save state

Updated: 2026-08-21 (Asia/Tokyo)

## Current state

- Harness Phase 1+2A is checkpointed locally on `main` at `1bbd7cdfa0f0bdc24559508052b0f29404a34ed4`; `origin/main` remains `9b9d1460711ea9e984d24e264d10d55dd38598cb`.
- Production data is **94 venues / 96 selectable configurations / 151,748 configuration-seat records**. Tokyo user-visible production coverage is **38/76 (50.0%)**, MUST **24/44 (54.5%)**, SHOULD **14/28 (50.0%)**; `venues:release:coverage` reports **RELEASE READY: yes**.
- `TOKYO-WAVE-12` is complete and deployed. `nissay-theatre-standard/current-official-block-numbered-seat-map` is production with 1,490 mapped seats; the other three bounded targets remain non-production handoffs.
- The Phase 1+2A checkpoint contains agent-neutral project knowledge, proportional `verify:*` entry points, the canonical venue workflow, and thin Codex/Claude instruction and Skill adapters. It changes no application behavior, venue data, generated venue artifact, or production meaning.
- Harness Phase 2B is implemented as an uncommitted working-tree diff: one read-only `scripts/session-context.mjs` feeds both repo-local SessionStart adapters, while `docs/COMMAND_GUARDRAILS.md` owns policy intent and Codex Rules / Claude permissions provide thin native command adapters.

## Unresolved items

- `tokyo-geigeki-playhouse-standard`: current official material has an internal 845-versus-829 numbered-seat contradiction; the repository readiness record also requires post-renovation/reopening currentness confirmation.
- `shinbashi-enbujo-standard`: current official 2F/3F side groups lack issuer-defined row/area ownership.
- `bunkyo-civic-main-standard`: current official 1F side cells lack unique row ownership; the visual attachment totals 1,258 against the stated 1,242.
- Phase 2B is ready for its authorized local checkpoint. The Phase 1+2A checkpoint and the pending Phase 2B checkpoint are local only; push and deploy are not authorized.

## Exact next action

Create the authorized local Phase 2B checkpoint, then implement the provider-neutral read-only venue researcher/reviewer roles for Phase 2C. Do not push, deploy, or commit the Phase 2C diff.

## Recent completed work

- 2026-08-21: Harness Phase 2B added shared read-only SessionStart restoration plus equivalent Codex/Claude approval intent for commits, normal pushes, force pushes, destructive Git operations, and local production deploys. Root, subdirectory, Windows adapter, no-side-effect, Claude Bash/PowerShell matching, JSON, syntax, docs, and lint checks passed. Claude Code live acceptance also confirmed SessionStart, shared instructions, `/venue-wave`, project Hook/permissions, and `verify:docs`. Codex live Hook/Rules loading remains unconfirmed because this environment cannot execute the installed WindowsApps CLI (`EPERM`); static checks, native inline Rules cases, and the Windows hook command passed.
- 2026-08-21: Harness Phase 2A added the shared Codex/Claude instruction adapter structure and canonical venue-wave workflow without changing application or venue semantics. `verify:docs` passed all 20 Markdown files plus the CLAUDE import/frontmatter/canonical-link/adapter-drift contracts; `node --check scripts/verify-docs.mjs`, ESLint, and provider-neutral new-session self-audits also passed.
- 2026-08-21: Harness engineering Phase 1 reorganized operational documentation and added proportional `verify:*` commands. Inventory/readiness/release reports, venue build/check/validate/report, lint, typecheck, unit tests (**20 files / 212 tests**), production build, local Markdown links, and diff checks passed; E2E passed **16/16** in the approved run after the known sandbox Wrangler-registry `EPERM`. Venue generation produced no tracked source/generated-artifact diff. The 24 existing venue validation warnings remain review information, not errors.
- 2026-08-20: Tokyo Wave 12 added the Nissay Theatre representative configuration, synchronized the bounded batch/readiness/coverage/generated artifacts/fingerprint, passed the full venue and app validation set, and was verified on the public Workers deployment with no browser console errors.
