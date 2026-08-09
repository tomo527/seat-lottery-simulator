# AGENTS.md

## Repository purpose

This repository contains the mobile-first React / TypeScript / Vite **座席抽選シミュレーター**. It is entertainment-only and uses a static, range-based venue database with generated catalog and lazy-loaded runtime details.

## Permanent working rules

- At the start of every new Codex thread, read this file and [`docs/HANDOFF.md`](docs/HANDOFF.md), then inspect branch, local HEAD, `origin/main`, and working tree. Repository evidence is authoritative when notes disagree.
- Release priority is Kanto coverage first: Tokyo, Kanagawa, Chiba, and Saitama (P0), then Ibaraki, Tochigi, and Gunma (P1). National expansion is limited to major venues in Sapporo, Sendai, Nagoya, Kyoto, Osaka, Kobe, Hiroshima, and Fukuoka (P2); other regions are post-release (P3).
- Use only official seat maps, official seat-count material, and issuer-owned primary sources. Do not infer seats from visual regularity, OCR, nominal capacity, unofficial diagrams, or capacity matching. Do not mix layouts, guess exclusions, or manufacture ranges.
- A production venue requires one complete representative pattern, explicit ranges and exclusions, official structure/count evidence, `expectedSeatCount == calculatedSeatCount`, an independent second official-source pass with zero diff, `verification.status: verified`, and `verification.unresolvedIssues: []`.
- Luna high is the default model for ordinary official numbered-map range work. Use Terra high for large or high-density row/area extraction. Use Sol high only for advanced decisions such as wheelchair conversion, pit/迫り/花道, source-date differences, local first/second-pass discrepancies, or official-source contradictions.
- Keep every venue's authoritative source, inventory/readiness/batch metadata, generated catalog, runtime detail, calculated count, expected count, and production fingerprint consistent. Do not hand-edit generated catalog/runtime files or update fingerprints merely to silence a diff.
- Preserve the sampler, lazy loading, safe random selection, custom-seat limits, timer/sequence protections, accessibility, disclosures, and legal pages unless explicitly scoped otherwise.

## Existing detailed workflow

The complete source schema, production gate, two-pass review, range rules, and validation commands are in [`docs/VENUE_DATA_GUIDE.md`](docs/VENUE_DATA_GUIDE.md). Reuse the first-pass and independent-review prompts in [`docs/prompts/`](docs/prompts/), and use the existing `venues:*` scripts for generated artifacts.

## Validation and Git

- Run validation proportional to the change; venue changes normally require inventory/release reports, `venues:build`, `venues:check`, `venues:validate`, `venues:report`, lint, typecheck, tests, build, E2E, and `git diff --check`.
- Preserve unrelated user changes. Commit, push, or deploy only when authorized. Use the established `main` → GitHub-to-Cloudflare Workers Builds flow; do not force-push or substitute a local production deploy.
- Before finishing, update [`docs/HANDOFF.md`](docs/HANDOFF.md) as the concise current save state, including exact next action and unresolved holds.
