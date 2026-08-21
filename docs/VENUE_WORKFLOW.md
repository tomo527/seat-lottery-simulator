# Venue wave workflow

This file is the canonical sequence for a bounded venue-addition wave. It defines orchestration and handoff only; it does not replace the existing data, evidence, validation, or release contracts.

## Authority map

| Concern | Canonical source |
| --- | --- |
| Permanent repository rules and session startup | [`../AGENTS.md`](../AGENTS.md) |
| Current state, unresolved work, and next action | [`HANDOFF.md`](HANDOFF.md) |
| Venue schema, evidence order, production gate, range rules, inventory, and generated artifacts | [`VENUE_DATA_GUIDE.md`](VENUE_DATA_GUIDE.md) |
| Proportional validation and target review | [`VALIDATION.md`](VALIDATION.md) |
| First-pass task template | [`prompts/VENUE_ADD_DRAFT.md`](prompts/VENUE_ADD_DRAFT.md) |
| Independent-review task template | [`prompts/VENUE_INDEPENDENT_REVIEW.md`](prompts/VENUE_INDEPENDENT_REVIEW.md) |
| Command behavior | `scripts/venues/` and the `venues:*` entries in [`../package.json`](../package.json) |
| Authorized production release | [`DEPLOYMENT.md`](DEPLOYMENT.md) |

If notes or a prompt disagree with repository data or these authorities, the repository evidence and the concern-specific canonical source win. Do not copy their rules into an agent-specific file.

## Difficulty routing

Choose the lane from the work itself, not from the agent or provider. Reclassify when the evidence proves the original lane wrong.

| Lane | Use when | Codex recommendation | Claude Code recommendation |
| --- | --- | --- | --- |
| `STANDARD` | A current numbered map has ordinary rows/areas and no material configuration dispute. | Luna, high reasoning | Sonnet |
| `DENSE` | The source is large, multi-floor, visually dense, or requires many independently checked ranges. | Terra, high reasoning | Sonnet with high effort |
| `JUDGMENT` | Configuration selection, conflicting public evidence, source-generation ambiguity, or another consequential interpretation must be resolved before transcription. | Sol, high reasoning | Opus |

These are replaceable recommendations, not data semantics. Persist only the lane and the evidence-based reason in active batch notes and handoffs. Use `HOLD` rather than a stronger model when public evidence cannot establish the declared seat-ID set.

## Canonical sequence

### 1. Reconstruct and bound the work

1. Complete the startup checks in `AGENTS.md`; treat the working tree and current data as authoritative.
2. Read `HANDOFF.md`, then the relevant inventory, batch, readiness, and source records. Confirm an explicit venue or batch scope before editing.
3. Assign `STANDARD`, `DENSE`, `JUDGMENT`, or `HOLD` from the criteria above. Record the reason, not merely a model label.
4. Do not reopen a completed wave, expand a batch, or convert a historical next action into active scope without explicit authorization.

### 2. First pass

1. Instantiate the first-pass template in `prompts/VENUE_ADD_DRAFT.md` with the bounded IDs.
2. Follow the data/evidence contract in `VENUE_DATA_GUIDE.md`. Keep the source/configuration non-production during this pass.
3. Synchronize only the in-scope source, inventory, and batch/readiness state. Do not hand-edit generated catalog or runtime files.
4. Run the target review and any bounded batch report required by `VALIDATION.md`. Leave concrete evidence gaps and blockers in repository metadata.

### 3. Independent review

1. Use a fresh pass with `prompts/VENUE_INDEPENDENT_REVIEW.md`; do not treat first-pass ranges or conclusions as ground truth.
2. Extract from public evidence before comparing with the first pass. Compare configuration identity and scope, every area/row/range/exclusion, mapped totals, source roles/generation, accessibility semantics, and deterministic review samples.
3. Resolve differences from evidence. Preserve unresolved conflicts and total differences as metadata; never fit capacity or invent seat IDs.
4. Promote only configurations that satisfy the production gate in `VENUE_DATA_GUIDE.md`. Otherwise leave an explicit non-production disposition and next evidence requirement.

### 4. Integrate and validate

1. Synchronize source, inventory, batch/readiness/report metadata, and production fingerprints through the repository's existing tools and contracts.
2. Generate catalog/runtime artifacts only with `venues:build`, then inspect the complete source and generated diff.
3. Run the affected venue or batch review plus the profile and additions prescribed by `VALIDATION.md`. Warnings remain review input; errors are blockers.
4. Confirm no out-of-scope application behavior, UI, venue data, production semantics, or prior production fingerprints changed.

### 5. Write a provider-neutral handoff

Update `HANDOFF.md` with only current state:

- bounded scope and disposition;
- difficulty lane and evidence-based reason;
- evidence already confirmed and the exact unresolved point;
- one exact next file, command, or evidence-gathering action;
- validation performed and anything not run;
- authorization state for commit, push, and deploy.

The next action must be executable by either Codex or Claude Code from a new session. Do not write instructions such as "ask Sol" or "continue with Opus"; state the decision to make, the source conflict to resolve, or the command to run.

## Agent entry points

- Codex: invoke `$venue-wave`; the repository adapter is `.agents/skills/venue-wave/SKILL.md`.
- Claude Code: invoke `/venue-wave`; the repository adapter is `.claude/skills/venue-wave/SKILL.md`.

Both adapters point here and must remain thin. This workflow is the only maintained venue-wave procedure.
