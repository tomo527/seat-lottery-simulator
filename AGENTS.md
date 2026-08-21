# AGENTS.md

## Start here

At the start of every new agent session:

1. Read this file and [`docs/HANDOFF.md`](docs/HANDOFF.md).
2. Inspect the current branch, local `HEAD`, `origin/main`, and the working tree. Repository evidence is authoritative when notes disagree.
3. Use [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md) for repository topology, [`docs/VALIDATION.md`](docs/VALIDATION.md) for proportional checks, and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the release path.
4. For venue-data work, use [`docs/VENUE_WORKFLOW.md`](docs/VENUE_WORKFLOW.md) as the canonical workflow and follow [`docs/VENUE_DATA_GUIDE.md`](docs/VENUE_DATA_GUIDE.md) for the data contract.

## Permanent rules

- Make minimal, high-confidence changes and reuse existing patterns. Preserve unrelated user changes; do not rename public APIs, routes, environment variables, or schemas without necessity.
- Do not hand-edit generated venue catalog/runtime files. Keep source, inventory/readiness/batch metadata, generated artifacts, counts, confidence, and production fingerprints consistent through the existing `venues:*` tools.
- Never invent seat IDs or configuration differences, infer them from geometry/capacity, or delete mapped seats to force an official-total match. The production contract and evidence order live in `docs/VENUE_DATA_GUIDE.md`.
- Preserve the sampler, lazy loading, safe random selection, custom-seat limits, timer/sequence protections, accessibility, disclosures, and legal pages unless the task explicitly scopes a change.
- Release priority is P0 Tokyo/Kanagawa/Chiba/Saitama, then P1 Ibaraki/Tochigi/Gunma, then P2 major venues in Sapporo/Sendai/Nagoya/Kyoto/Osaka/Kobe/Hiroshima/Fukuoka; other regions are post-release.
- Route venue work by the task-difficulty lanes in `docs/VENUE_WORKFLOW.md`. Provider/model recommendations are advisory; handoffs must describe the task, evidence, blocker, and next action without requiring a particular provider or model name.
- Validate proportionally using `verify:*`; venue changes also require the target review command documented in `docs/VALIDATION.md`. If a check cannot run, state exactly what did and did not run.
- Commit, push, or deploy only when authorized. The production path is the established `main` to GitHub-connected Cloudflare Workers Builds flow; never force-push or substitute an unrequested local production deploy.
- Before finishing, update `docs/HANDOFF.md` as a concise current save state with current state, unresolved items, one exact next action, and recent completed work.
