# AGENTS.md

## Repository purpose

This repository contains the mobile-first React / TypeScript / Vite **座席抽選シミュレーター**. It is entertainment-only and uses a static, range-based venue database with generated catalog and lazy-loaded runtime details.

## Permanent working rules

- At the start of every new Codex thread, read this file and [`docs/HANDOFF.md`](docs/HANDOFF.md), then inspect branch, local HEAD, `origin/main`, and working tree. Repository evidence is authoritative when notes disagree.
- Release priority is Kanto coverage first: Tokyo, Kanagawa, Chiba, and Saitama (P0), then Ibaraki, Tochigi, and Gunma (P1). National expansion is limited to major venues in Sapporo, Sendai, Nagoya, Kyoto, Osaka, Kobe, Hiroshima, and Fukuoka (P2); other regions are post-release (P3).
- Prefer current official venue/operator maps, then current-linked older official maps, official basic/seated examples, official event layouts, and finally a reputable secondary numbered map supported by non-contradictory official capacity/structure evidence. Record secondary provenance. Do not invent seats from geometry, OCR regularity, nominal capacity, anonymous images, or capacity fitting.
- A production configuration requires one complete mapped seat-ID set for its declared representative scope, explicit ranges/exclusions, traceable public evidence, no repository-invented seat IDs or configuration differences, and a mechanically valid non-empty runtime set. Exact official-total agreement, zero range diff, independent second generation, resolved wheelchair/companion conversion, and every variant are confidence information rather than blockers.
- When wheelchair conversion numbers are unpublished, keep the normal numbered-seat set, mark `accessibilityConversionNotReflected: true`, and rely on the global disclosure. Fixed stands may be production without event-dependent arena/floor seats. An official real-event configuration may be stored as `representativeEventLayout` when no stable basic layout exists.
- Use Luna high for ordinary numbered-map work, Terra high for large or dense extraction, and Sol high only when configuration selection or conflicting public evidence genuinely needs advanced judgment.
- Keep every venue's source, inventory/readiness/batch metadata, generated catalog, runtime detail, mapped count, published total, confidence, and production fingerprint consistent. Preserve published-total differences instead of deleting mapped seats to force equality. Do not hand-edit generated catalog/runtime files or update fingerprints merely to silence a diff.
- Preserve the sampler, lazy loading, safe random selection, custom-seat limits, timer/sequence protections, accessibility, disclosures, and legal pages unless explicitly scoped otherwise.

## Existing detailed workflow

The complete source schema, production gate, two-pass review, range rules, and validation commands are in [`docs/VENUE_DATA_GUIDE.md`](docs/VENUE_DATA_GUIDE.md). Reuse the first-pass and independent-review prompts in [`docs/prompts/`](docs/prompts/), and use the existing `venues:*` scripts for generated artifacts.

## Validation and Git

- Run validation proportional to the change; venue changes normally require inventory/release reports, `venues:build`, `venues:check`, `venues:validate`, `venues:report`, lint, typecheck, tests, build, E2E, and `git diff --check`.
- Preserve unrelated user changes. Commit, push, or deploy only when authorized. Use the established `main` → GitHub-to-Cloudflare Workers Builds flow; do not force-push or substitute a local production deploy.
- Before finishing, update [`docs/HANDOFF.md`](docs/HANDOFF.md) as the concise current save state, including exact next action and unresolved holds.
