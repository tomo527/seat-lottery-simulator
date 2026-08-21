import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sessionScript = path.join(repositoryRoot, 'scripts', 'session-context.mjs')
const codexHooksPath = path.join(repositoryRoot, '.codex', 'hooks.json')
const codexRulesPath = path.join(repositoryRoot, '.codex', 'rules', 'project.rules')
const claudeSettingsPath = path.join(repositoryRoot, '.claude', 'settings.json')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function run(command, args, cwd, options = {}) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    ...options,
  })
}

function gitStatus() {
  const result = run('git', ['status', '--porcelain=v1'], repositoryRoot)
  assert(result.status === 0, 'git status failed: ' + result.stderr)
  return result.stdout
}

function checkSessionOutput(output, label) {
  assert(output.length <= 700, label + ' output is too large')
  assert(output.trim().split(/\r?\n/u).length <= 7, label + ' output has too many lines')
  for (const marker of ['branch:', 'HEAD:', 'origin/main:', 'working tree:', 'AGENTS.md', 'docs/HANDOFF.md']) {
    assert(output.includes(marker), label + ' output is missing ' + marker)
  }
  const normalizedOutput = output.replaceAll('\\', '/').toLowerCase()
  const normalizedRoot = repositoryRoot.replaceAll('\\', '/').toLowerCase()
  assert(!normalizedOutput.includes(normalizedRoot), label + ' output exposes an absolute repository path')
}

function wildcardMatch(pattern, command) {
  let source = pattern
    .replace(/[.+?^$(){}|[\]\\]/gu, '\\$&')
    .replaceAll('*', '.*')
  if (pattern.endsWith(' *')) source = source.slice(0, -3) + '(?: .*)?'
  return new RegExp('^' + source + '$', 'u').test(command)
}

function permissionPatterns(settings, tool, outcome) {
  return settings.permissions[outcome]
    .filter((rule) => rule.startsWith(tool + '(') && rule.endsWith(')'))
    .map((rule) => rule.slice(tool.length + 1, -1))
}

function anyPermissionMatch(settings, tool, outcome, command) {
  return permissionPatterns(settings, tool, outcome)
    .some((pattern) => wildcardMatch(pattern, command))
}

function codexExecpolicyCheck(args, expected) {
  const result = run('codex', [
    'execpolicy', 'check', '--pretty', '--rules', codexRulesPath, '--', ...args,
  ], repositoryRoot, { timeout: 10_000 })

  if (['ENOENT', 'EACCES', 'EPERM'].includes(result.error?.code)) {
    return { available: false, reason: result.error.code }
  }
  const combinedOutput = (result.stdout || '') + '\n' + (result.stderr || '')
  if (result.status !== 0 && /unknown|unrecognized|not recognized|access is denied/iu.test(combinedOutput)) {
    return { available: false, reason: 'execpolicy check unavailable' }
  }
  assert(result.status === 0, 'codex execpolicy check failed: ' + combinedOutput)
  assert(new RegExp('"decision"\\s*:\\s*"' + expected + '"', 'u').test(result.stdout),
    'Codex decision for ' + args.join(' ') + ' was not ' + expected + ': ' + result.stdout)
  return { available: true }
}

const beforeStatus = gitStatus()
const [codexHooks, claudeSettings, codexRules] = await Promise.all([
  readFile(codexHooksPath, 'utf8').then(JSON.parse),
  readFile(claudeSettingsPath, 'utf8').then(JSON.parse),
  readFile(codexRulesPath, 'utf8'),
])

assert(Object.keys(codexHooks.hooks).join(',') === 'SessionStart', 'Codex hooks must contain only SessionStart')
assert(Object.keys(claudeSettings.hooks).join(',') === 'SessionStart', 'Claude hooks must contain only SessionStart')

const codexGroup = codexHooks.hooks.SessionStart[0]
const claudeGroup = claudeSettings.hooks.SessionStart[0]
const codexHandler = codexGroup.hooks[0]
const claudeHandler = claudeGroup.hooks[0]

assert(codexGroup.matcher === 'startup|resume|clear|compact', 'Codex SessionStart matcher drifted')
for (const source of ['startup', 'resume', 'clear', 'compact']) {
  assert(claudeGroup.matcher.split('|').includes(source), 'Claude SessionStart omits ' + source)
}
assert(codexHandler.command.includes('scripts/session-context.mjs'), 'Codex hook does not use the shared script')
assert(codexHandler.commandWindows.includes('scripts/session-context.mjs'), 'Codex Windows hook does not use the shared script')
assert(claudeHandler.command === 'node', 'Claude SessionStart must use Node exec form')
assert(claudeHandler.args.length === 1 && claudeHandler.args[0] === '${CLAUDE_PROJECT_DIR}/scripts/session-context.mjs',
  'Claude hook does not use the shared script through CLAUDE_PROJECT_DIR')
assert(!('allow' in claudeSettings.permissions), 'Claude adapter must not broadly auto-allow commands')
assert(claudeSettings.permissions.disableBypassPermissionsMode === 'disable',
  'Claude bypass-permissions mode must be disabled')

for (const tool of ['Bash', 'PowerShell']) {
  for (const command of ['git commit -m checkpoint', 'git push origin main']) {
    assert(anyPermissionMatch(claudeSettings, tool, 'ask', command), tool + ' does not ask for ' + command)
  }
  for (const command of [
    'git push --force origin main',
    'git push origin main --force-with-lease',
    'git push origin main -f',
    'git reset --hard HEAD',
    'git clean -fd',
    'git checkout -- docs/HANDOFF.md',
    'git restore docs/HANDOFF.md',
    'git branch -D old-branch',
    'git stash clear',
    'npm run deploy',
    'npx wrangler deploy',
    'npm exec wrangler deploy',
    'wrangler deploy',
  ]) {
    assert(anyPermissionMatch(claudeSettings, tool, 'deny', command), tool + ' does not deny ' + command)
  }
  for (const command of [
    'git status',
    'npm run lint',
    'npm run verify:docs',
    'npm run venues:review -- --id example',
  ]) {
    assert(!anyPermissionMatch(claudeSettings, tool, 'deny', command), tool + ' over-blocks ' + command)
  }
}

for (const requiredText of [
  'pattern = ["git", "commit"]',
  'pattern = ["git", "push"]',
  'decision = "prompt"',
  'decision = "forbidden"',
  'git push --force origin main',
  'git reset --hard HEAD',
  'npm run deploy',
  'not_match =',
]) {
  assert(codexRules.includes(requiredText), 'Codex rules omit ' + requiredText)
}

const rootRun = run(process.execPath, [sessionScript], repositoryRoot)
const subdirectoryRun = run(process.execPath, [sessionScript], path.join(repositoryRoot, 'docs'))
assert(rootRun.status === 0, 'root SessionStart failed: ' + rootRun.stderr)
assert(subdirectoryRun.status === 0, 'subdirectory SessionStart failed: ' + subdirectoryRun.stderr)
checkSessionOutput(rootRun.stdout, 'root SessionStart')
checkSessionOutput(subdirectoryRun.stdout, 'subdirectory SessionStart')
assert(rootRun.stdout === subdirectoryRun.stdout, 'root and subdirectory SessionStart output differs')

if (process.platform === 'win32') {
  const windowsHookRun = run(codexHandler.commandWindows, [], path.join(repositoryRoot, 'docs'), { shell: true })
  assert(windowsHookRun.status === 0, 'Codex commandWindows failed: ' + windowsHookRun.stderr)
  checkSessionOutput(windowsHookRun.stdout, 'Codex commandWindows')
}

const afterStatus = gitStatus()
assert(beforeStatus === afterStatus, 'SessionStart verification changed the working tree')

const codexCases = [
  { args: ['git', 'commit', '-m', 'checkpoint'], expected: 'prompt' },
  { args: ['git', 'push', 'origin', 'main'], expected: 'prompt' },
  { args: ['git', 'push', '--force', 'origin', 'main'], expected: 'forbidden' },
  { args: ['git', 'reset', '--hard', 'HEAD'], expected: 'forbidden' },
  { args: ['npm', 'run', 'deploy'], expected: 'forbidden' },
]
let codexAvailable = true
let unavailableReason = ''
for (const testCase of codexCases) {
  const result = codexExecpolicyCheck(testCase.args, testCase.expected)
  if (!result.available) {
    codexAvailable = false
    unavailableReason = result.reason
    break
  }
}

console.log('Shared SessionStart passed from the repository root and docs/ with no working-tree side effect.')
console.log('Codex and Claude SessionStart adapters use the same concise context script.')
console.log('Claude Bash/PowerShell ask, deny, and non-blocking validation cases passed.')
if (codexAvailable) {
  console.log('Codex execpolicy matching cases passed.')
} else {
  console.log('Codex execpolicy check unavailable; inline rule tests remain configured (' + unavailableReason + ').')
}
