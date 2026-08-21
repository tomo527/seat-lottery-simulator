# Project map

This repository is the mobile-first React / TypeScript / Vite **座席抽選シミュレーター**. It is an entertainment-only static application backed by a range-based venue database.

## Authority and entry points

- [`../AGENTS.md`](../AGENTS.md): agent-neutral permanent repository rules and the start-of-session checklist.
- [`../CLAUDE.md`](../CLAUDE.md): Claude Code discovery adapter; imports `AGENTS.md` and owns no duplicate project rules.
- [`HANDOFF.md`](HANDOFF.md): current save state only. Repository state wins if it is stale.
- [`VENUE_WORKFLOW.md`](VENUE_WORKFLOW.md): canonical venue-wave sequence, difficulty routing, and provider-neutral handoff contract.
- [`VALIDATION.md`](VALIDATION.md): validation profiles and the change-to-check matrix.
- [`COMMAND_GUARDRAILS.md`](COMMAND_GUARDRAILS.md): canonical command approval and denial intent shared by Codex and Claude Code adapters.
- [`DEPLOYMENT.md`](DEPLOYMENT.md): the established production path and release checks.
- [`VENUE_DATA_GUIDE.md`](VENUE_DATA_GUIDE.md): authoritative venue schema, evidence, production gate, generation, and review workflow.
- [`../README.md`](../README.md): product overview and local setup; not the authority for current work status.

## Application topology

```text
src/main.tsx                         React entry point
src/App.tsx                          main application state and page composition
src/components/venue/                venue search/selection and custom-seat input
src/components/lottery/              draw animation and result presentation
src/domain/lottery/                  draw orchestration and randomness
src/domain/seats/                    range sampling and custom-seat validation
src/data/venue-db/                   lightweight catalog access and lazy detail loading
src/pages/LegalPage.tsx              legal routes
src/config/                           legal and support configuration
src/lib/                              routing, preferences, sharing, page metadata
src/types/                            shared TypeScript types
tests/e2e/                            Playwright browser smoke coverage
```

`src/App.test.tsx` and colocated `*.test.ts(x)` files provide Vitest coverage. `playwright.config.ts`, `vitest.config.ts`, `vite.config.ts`, and the TypeScript/ESLint configs define the validation and build environment.

Repository-scoped agent adapters live in `.agents/skills/venue-wave/` for Codex and `.claude/skills/venue-wave/` for Claude Code. They intentionally contain no independent venue policy and both lead to `VENUE_WORKFLOW.md`. SessionStart and command-policy adapters live under `.codex/` and `.claude/settings.json`; both SessionStart hooks execute `scripts/session-context.mjs`, while command intent remains canonical in `COMMAND_GUARDRAILS.md`.

## Venue-data flow

```text
data/venue-sources/*.json
        │ authoring source of truth
        ▼
scripts/venues/*
        │ validate and generate deterministically
        ├── src/data/venue-db/catalog.generated.json
        └── public/venue-db/venues/*.json
```

- `data/venue-inventory/`, `data/venue-batches/`, `data/venue-reports/`, `data/venue-coverage/`, and `data/venue-release-targets/` track research and release governance.
- `data/venue-fingerprints/production.json` protects production semantics and must not be changed merely to silence a diff.
- The generated catalog is loaded initially; one runtime detail file is lazy-loaded after venue/configuration selection. The runtime intentionally does not expose research provenance.
- Never edit the two generated output locations directly. Use `npm run venues:build`, then inspect and validate the resulting diff.

## Runtime and delivery

- `npm run dev` starts local Vite development.
- `npm run build` cleans `dist`, checks/validates venue artifacts, typechecks, and creates the production bundle.
- `wrangler.jsonc` configures Cloudflare Workers Static Assets and SPA fallback.
- Production delivery is documented in [`DEPLOYMENT.md`](DEPLOYMENT.md).
