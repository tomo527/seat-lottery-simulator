# Validation

Use the smallest profile that covers the changed behavior. The `verify:*` scripts only compose existing checks; they add no second validation framework.

## Profiles

| Command | Use for | Runs |
| --- | --- | --- |
| `npm run verify:docs` | Markdown or harness configuration only | local Markdown links, shared instruction/Skill contracts, SessionStart/config guardrails, `git diff --check` |
| `npm run verify:app` | TypeScript, React, CSS, configuration, unit-test, or build changes | lint, typecheck, unit tests, production build, diff check |
| `npm run verify:full` | UI interaction, routing, async/timer behavior, release-sensitive app changes | `verify:app`, then Playwright E2E |
| `npm run verify:venues` | Venue source, inventory, batch, coverage, fingerprint, or generated venue artifacts | inventory/readiness/release reports, venue build/check/validate/report, then `verify:full` |

`npm run build` already includes `venues:check`, `venues:validate`, and TypeScript build checks. The venue profile still runs the explicit venue sequence because its generated-artifact and reporting steps have separate review value.
`verify:docs` includes `CLAUDE.md`, the repository-scoped Skill adapters, the Claude agent adapters, and their canonical links. It checks the `@AGENTS.md` import, required venue-wave frontmatter, canonical-workflow reachability, and Skill adapter drift.
It also runs `verify:harness`, which checks the shared SessionStart script from the repository root and a subdirectory, concise side-effect-free output, both Hook adapters, Claude permission cases, and Codex `execpolicy check` cases when available. The same command validates one canonical subagent-role contract, thin reachable provider adapters, read-only reviewer constraints, independent-first comparison, main-only integration, model inheritance, and the no-subagent fallback.


## Change-specific additions

- Before `verify:venues`, review the affected scope with `npm run venues:review -- --id <venue-id>` or `npm run venues:review -- --batch <batch-id>`. Use `--all` only when that breadth is justified.
- For a venue batch, also run `npm run venues:batch:report -- --batch <batch-id>` if the generic readiness/release reports do not show the bounded batch result.
- Dependency changes require an intentional lockfile review and, when network access is available, `npm audit`; audit is not embedded in deterministic local verification.
- Deployment-configuration changes require `verify:full`. Actual deployment and public smoke checks occur only when deployment is authorized.

## Interpreting results

- Warnings from venue reports are review input; errors are blockers. Do not remove real mapped seats, relax gates, or edit fingerprints/generated files solely to make warnings disappear.
- `venues:build` can update tracked generated artifacts. Inspect those diffs and confirm they are the expected deterministic projection of source changes.
- Playwright requires Chromium. In restricted environments, Miniflare/Wrangler may fail while writing its user-level registry; rerun in an approved environment and record both the environment failure and the final result.
- Finish every change with `git diff --check` and a review of `git diff` plus `git status --short`.
