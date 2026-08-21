import { spawnSync } from 'node:child_process'
import path from 'node:path'

function git(args, cwd = process.cwd(), trimOutput = true) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
  })

  if (result.status !== 0) return null
  return trimOutput
    ? result.stdout.trim()
    : result.stdout.replace(/\r?\n$/u, '')
}

const repositoryRoot = git(['rev-parse', '--show-toplevel'])

if (!repositoryRoot) {
  console.log([
    '[repository session context]',
    'repository: unavailable from the current directory',
    'Read AGENTS.md and docs/HANDOFF.md before acting; repository evidence is authoritative.',
  ].join('\n'))
  process.exit(0)
}

const branch = git(['branch', '--show-current'], repositoryRoot) || 'detached HEAD'
const head = git(['rev-parse', '--short=12', 'HEAD'], repositoryRoot) || 'unavailable'
const originMain = git(['rev-parse', '--short=12', 'origin/main'], repositoryRoot)
const statusLines = (git(['status', '--porcelain=v1'], repositoryRoot, false) || '')
  .split(/\r?\n/u)
  .filter(Boolean)

let staged = 0
let unstaged = 0
let untracked = 0

for (const line of statusLines) {
  if (line.startsWith('??')) {
    untracked += 1
    continue
  }
  if (line[0] !== ' ') staged += 1
  if (line[1] !== ' ') unstaged += 1
}

let originLine = 'origin/main: unavailable'
if (originMain) {
  const divergence = git(
    ['rev-list', '--left-right', '--count', 'HEAD...origin/main'],
    repositoryRoot,
  )
  const [ahead = '?', behind = '?'] = divergence?.split(/\s+/u) ?? []
  originLine = `origin/main: ${originMain} (ahead ${ahead}, behind ${behind})`
}

const worktreeLine = statusLines.length === 0
  ? 'working tree: clean'
  : `working tree: dirty (${statusLines.length} entries; staged ${staged}, unstaged ${unstaged}, untracked ${untracked})`

console.log([
  '[repository session context]',
  `repository: ${path.basename(repositoryRoot)}`,
  `branch: ${branch}`,
  `HEAD: ${head}`,
  originLine,
  worktreeLine,
  'Read AGENTS.md and docs/HANDOFF.md before acting; repository evidence is authoritative.',
].join('\n'))
