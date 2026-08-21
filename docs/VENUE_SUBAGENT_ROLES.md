# Venue subagent roles

This file is the only canonical definition of the optional venue-wave subagent roles. Provider adapters identify a role and point here; they do not restate its policy.

## Shared contract

- The main agent is the sole repository integration owner. Only the main agent may edit venue source, inventory, readiness/batch metadata, production fingerprints, generated files, or `HANDOFF.md`.
- Subagents are read-only. They do not edit repository files, promote a configuration, update a fingerprint, commit, push, deploy, or spawn an editing agent.
- Use a subagent only when separating noisy evidence work into a bounded context materially helps. A simple venue task may remain entirely with the main agent.
- The main agent chooses the difficulty lane from [`VENUE_WORKFLOW.md`](VENUE_WORKFLOW.md) and supplies the bounded venue/configuration scope. Role adapters do not select or pin a provider or model.
- Parallel delegation is limited to mutually independent, read-only scopes. Do not fan out by default, and never run concurrent repository editors. The main agent waits for delegated reports before integrating them.
- Repository evidence and the authority map in [`VENUE_WORKFLOW.md`](VENUE_WORKFLOW.md) remain authoritative. A subagent report is review input, not repository state or a production decision.
- If subagents are unavailable, use the existing fresh-pass procedure in [`VENUE_WORKFLOW.md`](VENUE_WORKFLOW.md) with the same evidence, independence, output, and production-gate contract.

Each delegated task must provide:

1. exact venue and configuration IDs, or another comparably bounded scope;
2. the assigned difficulty lane and evidence-based reason;
3. the public evidence entry points already known;
4. the requested role and report stage;
5. explicit exclusions and unresolved questions.

## Role: venue researcher

### Purpose

Support the first pass by extracting public evidence for only the bounded scope. Do not make repository changes or a production-promotion decision.

### Method

1. Confirm the bounded identity and configuration question before browsing.
2. Prefer current first-party public sources and record issuer, title, URL, source role, and visible generation/currentness.
3. Extract configuration candidates and the evidence that distinguishes them.
4. Transcribe the visible area, floor, row, seat-range, gap, and exclusion structure without inferring missing seat IDs.
5. Reconcile any stated and mapped totals without deleting seats to force a match.
6. Record wheelchair, companion, transfer, removable-seat, restricted-view, and other accessibility semantics only when the source establishes them.
7. Identify evidence gaps, ambiguity, stale sources, and facts that require an independent check.

### Report

Return only a structured report with these sections:

- `Scope`: bounded venue/configuration IDs, lane, and exclusions.
- `Public evidence`: issuer, title, URL, source role, generation/currentness, and the claim each source supports.
- `Configuration candidates`: candidate identity and distinguishing evidence.
- `Seat extraction`: area/floor, rows, inclusive ranges, gaps/exclusions, subtotals, and stated totals.
- `Accessibility`: source-grounded semantics and unresolved interpretation.
- `Evidence gaps`: contradictions, missing ownership, stale/currentness risk, and confidence.
- `Main-agent checks`: specific facts or samples the main agent should verify before integration.

Do not return patches, edited file contents, production fingerprints, or instructions to promote.

## Role: independent venue reviewer

### Purpose

Perform the independent review after the first pass. Do not treat the first-pass ranges or conclusions as ground truth, and do not edit or promote repository data.

### Independence protocol

The main agent must use two stages:

1. **Independent extraction:** provide the bounded identity, public evidence entry points, lane, and questions, but do not provide first-pass ranges, totals, conclusions, or in-scope repository mapping paths. The reviewer must not inspect in-scope source, inventory, batch, fingerprint, generated, or review-output files during this stage, even if they are discoverable. It extracts the public evidence and returns a complete `Independent extraction`.
2. **Comparison:** only after that extraction is returned, resume the same reviewer with the first-pass artifact paths or structured first-pass result. The reviewer compares without silently revising the already reported extraction.

If the provider cannot resume the reviewer, run comparison in another fresh read-only context and pass the frozen independent extraction as evidence. Do not collapse the two stages into a prompt that exposes the first-pass answer before independent extraction.

### Review coverage

Check:

- configuration identity, source scope, and configuration-specific applicability;
- every area/floor, row, inclusive range, gap, and exclusion;
- mapped subtotals, mapped total, stated total, and any reconciliation difference;
- source issuer, role, generation/currentness, and supersession risk;
- accessibility and removable/conditional-seat semantics;
- deterministic boundary, gap, exclusion, and representative review samples.

### Report

Return only a structured report with these sections:

- `Scope`: bounded IDs, lane, evidence set, and exclusions.
- `Independent extraction`: sources, configuration identity, all ranges/exclusions, totals, accessibility, samples, and uncertainties captured before comparison.
- `Comparison`: field-by-field `MATCH`, `MISMATCH`, or `UNRESOLVED` against the first pass, with evidence.
- `Totals and samples`: arithmetic reconciliation and exact review samples.
- `Production-gate impact`: which evidence requirements pass, fail, or remain unresolved; this is advice to the main agent, not promotion.
- `Required main-agent action`: the smallest evidence or repository-integration action needed next.

Do not return patches, edit repository files, update fingerprints, or perform production promotion.

## Main-agent integration

The main agent validates cited sources, resolves discrepancies, and performs every repository edit using [`VENUE_WORKFLOW.md`](VENUE_WORKFLOW.md), [`VENUE_DATA_GUIDE.md`](VENUE_DATA_GUIDE.md), and [`VALIDATION.md`](VALIDATION.md). It records unresolved evidence rather than accepting a subagent conclusion on authority. It integrates only after all relevant read-only tasks have finished, then runs the canonical generation, review, validation, and handoff steps.
