# AGENTS.md

## Start here

At the start of every new agent session:

1. Read this file and [`docs/HANDOFF.md`](docs/HANDOFF.md).
2. Inspect the current branch, local `HEAD`, `origin/main`, and the working tree. Repository evidence is authoritative when notes disagree.
3. Use [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md) for repository topology, [`docs/VALIDATION.md`](docs/VALIDATION.md) for proportional checks, [`docs/COMMAND_GUARDRAILS.md`](docs/COMMAND_GUARDRAILS.md) for command approval boundaries, and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the release path.
4. For venue-data work, use [`docs/VENUE_WORKFLOW.md`](docs/VENUE_WORKFLOW.md) as the canonical workflow and follow [`docs/VENUE_DATA_GUIDE.md`](docs/VENUE_DATA_GUIDE.md) for the data contract.

## Permanent rules

- Make minimal, high-confidence changes and reuse existing patterns. Preserve unrelated user changes; do not rename public APIs, routes, environment variables, or schemas without necessity.
- Do not hand-edit generated venue catalog/runtime files. Keep source, inventory/readiness/batch metadata, generated artifacts, counts, confidence, and production fingerprints consistent through the existing `venues:*` tools.
- Never invent seat IDs or configuration differences, infer them from geometry/capacity, or delete mapped seats to force an official-total match. The production contract and evidence order live in `docs/VENUE_DATA_GUIDE.md`.
- Preserve the sampler, lazy loading, safe random selection, custom-seat limits, timer/sequence protections, accessibility, disclosures, and legal pages unless the task explicitly scopes a change.
- Release priority is P0 Tokyo/Kanagawa/Chiba/Saitama, then P1 Ibaraki/Tochigi/Gunma, then P2 major venues in Sapporo/Sendai/Nagoya/Kyoto/Osaka/Kobe/Hiroshima/Fukuoka; other regions are post-release.
- Route venue work by the task-difficulty lanes in `docs/VENUE_WORKFLOW.md`. Provider/model recommendations are advisory; handoffs must describe the task, evidence, blocker, and next action without requiring a particular provider or model name.
- Continue or stop bounded multi-candidate work by the GREEN / YELLOW / LOCAL RED / GLOBAL RED dispositions below. They control continuation only and relax no evidence, production, schema, or validation rule.
- Validate proportionally using `verify:*`; venue changes also require the target review command documented in `docs/VALIDATION.md`. If a check cannot run, state exactly what did and did not run.
- Commit, push, or deploy only when authorized. The production path is the established `main` to GitHub-connected Cloudflare Workers Builds flow; never force-push or substitute an unrequested local production deploy.
- Before finishing, update `docs/HANDOFF.md` as a concise current save state with current state, unresolved items, one exact next action, and recent completed work.

## Autonomous continuation policy (GREEN / YELLOW / LOCAL RED / GLOBAL RED)

These four dispositions are permanent and apply to every bounded venue wave, preflight, and comparable multi-candidate task. They decide only **when to continue and when to stop within the phase the current task already authorizes**; they change no evidence, production, schema, or validation rule, and they never authorize relaxing one. Classify each candidate as it is resolved, not the batch as a whole. The user and any supervising assistant are exception handlers and policy owners, not per-candidate reviewers.

The task's own scope, phase, and stop rule always win. `GREEN`, `YELLOW`, and `LOCAL RED` grant no authority to widen that scope: they never convert a research or preflight task into transcription, implementation, or promotion, never add candidates, and never carry work past the task's stop rule. Continuing means moving to the next in-scope candidate at the same phase, not to the next phase.

| Disposition | Condition | Action |
| --- | --- | --- |
| `GREEN` | Existing rules fully resolve the candidate inside the current task's scope and phase. | Complete that phase's work for it and continue to the next in-scope candidate without asking. |
| `YELLOW` | Not production-eligible, but an existing formal non-production disposition fits. | Record that disposition with its evidence and continue. |
| `LOCAL RED` | A human decision is required, but the problem is confined to this candidate. | Isolate it as a formal blocked/unresolved item and continue the remaining candidates. |
| `GLOBAL RED` | The problem can affect the correctness of the rest of the work. | Stop the batch and write a handoff. |

### GREEN — autonomous completion

A candidate is `GREEN` when the existing rules resolve it completely **for the work the current task authorizes**: the evidence is an accepted source type in the order defined by `docs/VENUE_DATA_GUIDE.md`; the numbered-seat structure is explicit, so no inference is needed; capacity and configuration evidence are coherent; the current schema expresses it losslessly; no new waiver, exception, or evidence class is required; and no existing production venue changes meaning. What `GREEN` then authorizes depends on the task's phase.

**Research, audit, or preflight-only tasks.** `GREEN` means the candidate reaches the positive disposition that task permits — typically an `ADOPT` / production-candidate assessment — with its evidence, exact scope, and reopen or follow-up condition recorded in the wave record under `data/venue-reports/` and the inventory. `ADOPT` states only that a bounded implementation looks feasible. Transcribe no seat, create or edit no range, promote nothing, run no `venues:build`, and change no source, fingerprint, generated artifact, or production total. Then move to the next candidate in the preflight pool. Implementation of an `ADOPT` candidate is separate, later, and separately authorized work.

**Implementation tasks.** `GREEN` additionally requires that the production gate and the cross-check requirements in `docs/VENUE_DATA_GUIDE.md` pass and that the prescribed review and validation pass. Here, do not pause for confirmation between phases: run research, evidence recording, implementation, `venues:build`, the target review and the validation profile from `docs/VALIDATION.md`, the required inventory/batch/readiness/report and fingerprint updates, and `docs/HANDOFF.md`, then move to the next candidate in scope.

When a task does not state its phase, resolve it from the task's own wording and stop rule and take the narrower reading; never widen a preflight into an implementation on your own judgment.

### YELLOW — formal non-production disposition, then continue

A candidate is `YELLOW` when it cannot be promoted but an existing formal disposition already covers it: `HOLD`, `NEED EVIDENCE`, formal `DEFER`, `CONTRADICTION`, or source `status: "rejected"` with its `rejectionReason`. Record it in the established places — inventory `researchStatus` (`blocked` and its required `blockingReason`, plus `recheckNotBefore` where the reopen condition is dated), source `verification.unresolvedIssues`, batch `carryOvers`, and the wave or preflight record under `data/venue-reports/`.

Preserve the evidence found, state the exact blocker and reopen condition, invent no missing seat information, and do not push the candidate toward production. Then treat that candidate as handled and continue.

**Failing to reach production is not a reason to stop.** When an existing disposition applies, do not request per-candidate confirmation.

### LOCAL RED — isolate and continue

A candidate is `LOCAL RED` when a human decision is genuinely required but the issue does not affect the other candidates: the production/HOLD boundary is not uniquely determined by existing rules; official sources conflict materially about this venue only; seat numbering or layout would have to be inferred to proceed; or the case is special but does not generalize.

Then: decide nothing unilaterally; record the candidate through the existing unresolved machinery above (inventory `blocked` + `blockingReason`, `verification.unresolvedIssues`, and the wave record) with the evidence and the exact blocking question; list it in the unresolved items of `docs/HANDOFF.md` as awaiting a user decision; make no production change to it; and continue the remaining bounded candidates.

The repository has no separate human-decision queue status, and none may be created. Use the existing statuses and fields. If a case genuinely cannot be represented by them, that is `GLOBAL RED`, not a reason to invent a status.

### GLOBAL RED — stop the batch and hand off

Stop when resolving the issue would require any of: changing production eligibility policy; a new waiver, exception, or evidence class; changed schema semantics; a change to validation policy or a validator; deleting, demoting, or materially reinterpreting an existing production venue; a broad migration or destructive data change; repairing broken inventory/batch/fingerprint/ledger consistency; resolving a contradiction between current formal rules; or a product/policy decision that repository evidence cannot settle. Also stop when the same issue will recur across the remaining candidates.

Do not implement the policy change first. Halt the remaining candidates and write a handoff in `docs/HANDOFF.md` containing: (1) the exact blocking question; (2) the evidence found; (3) why this is global rather than local; (4) alternatives considered; (5) the recommended option; (6) affected files, venues, and configurations; (7) commands, reviews, and validation already run; and (8) the exact next action once the decision is made. Policy revisions of this kind take effect only as user-authorized revisions to the canonical documents, as recorded in `docs/VENUE_DATA_GUIDE.md`.

### Bounded batch

Autonomous continuation is bounded. Work only the candidate set, pool, or batch the task defines; never expand into another priority, jurisdiction, or pool on your own, and never reopen a closed wave. Within the batch, `GREEN` completes, `YELLOW` is recorded formally, `LOCAL RED` is isolated, and only `GLOBAL RED` halts the batch. A `LOCAL RED` in the middle of a batch never justifies abandoning the remaining candidates. When the batch's own stop rule is reached, stop there and hand off.

### No inference, unchanged production standard

Continuing autonomously is not a licence to change rules autonomously. Evidence gaps are never filled by inference; seat numbers, rows, capacity, and configuration are never invented; the accepted-source and currentness policies are never loosened; validation is never bypassed and tests are never weakened; and `HOLD`/`DEFER` candidates are never nudged toward production. The purpose is to keep judgeable work moving while leaving unjudgeable work correctly unresolved.

### Git under this policy

The existing Git rules above and in `docs/COMMAND_GUARDRAILS.md` remain in force and win wherever they are stricter: commit, push, and deploy still happen only when authorized and through the established release path. Within that constraint, routine `GREEN` and `YELLOW` work is ordinary committable work once its existing commit conditions are met; unapproved production changes for a `LOCAL RED` candidate are not committed; `GLOBAL RED` policy changes are not implemented or committed before the decision; and pushing requires explicit authorization for that task.
