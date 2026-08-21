# Command guardrails

This file is the canonical policy intent for repository command approval. Provider-specific files translate this policy into their native matching syntax; they do not own a separate policy.

## Boundary

| Command class | Required outcome |
| --- | --- |
| Read-only repository inspection and existing local validation | Use the normal agent permission flow; do not add repository rules that broadly block or auto-approve them. |
| `git commit` | Ask the user for approval for each invocation. |
| Normal `git push` | Ask the user for approval for each invocation. |
| Force push | Block. Never convert approval for a normal push into approval for a forced push. |
| Destructive Git operations that discard working files, untracked files, branches, or stash recovery points | Block the known direct forms. Prefer inspection and recoverable, explicitly targeted edits. |
| Direct local Cloudflare production deploy | Block. The production path remains authorized commit on `main`, normal push to GitHub, then Cloudflare Workers Builds as defined in [`DEPLOYMENT.md`](DEPLOYMENT.md). |

The adapters are:

- Codex SessionStart: [`.codex/hooks.json`](../.codex/hooks.json); command decisions: [`.codex/rules/project.rules`](../.codex/rules/project.rules).
- Claude Code SessionStart and command decisions: [`.claude/settings.json`](../.claude/settings.json).
- Both SessionStart adapters execute [`../scripts/session-context.mjs`](../scripts/session-context.mjs). Hooks contain no command policy.

## Scope and limitations

- Project-local configuration is not an operating-system security boundary. Shell wrappers, aliases, unusual option ordering, a disabled project settings source, or a higher-level managed policy can change what a provider can match or load.
- Codex loads project hooks and rules only when the `.codex/` layer is trusted. A changed non-managed hook is skipped until its exact definition is reviewed and trusted with `/hooks`.
- Claude Code project hooks and permissions require the project settings source. Managed settings can restrict project hooks or project permission rules; use `/status`, `/hooks`, and `/permissions` to inspect the active configuration.
- Codex prefix rules match argument prefixes. The adapter blocks conventional force-push forms and keeps every other direct `git push` behind approval, but a force flag placed after an arbitrary remote/ref can fall through to the generic push prompt rather than a hard block.
- Claude Code wildcard rules cover force flags in ordinary argument positions for both Bash and PowerShell, and deny rules take precedence over ask rules.
- These guards cover direct repository commands, not a deliberately concealed command inside an unrecognized interpreter or newly introduced wrapper. Permanent instructions still prohibit force push and release-path bypass.

The implementation follows the current official [Codex Hooks](https://learn.chatgpt.com/docs/hooks), [Codex Rules](https://learn.chatgpt.com/docs/agent-configuration/rules), [Claude Code Hooks](https://code.claude.com/docs/en/hooks), and [Claude Code permissions](https://code.claude.com/docs/en/permissions) specifications, reviewed 2026-08-21.
