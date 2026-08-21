import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(entryPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath)
    }
  }

  return files
}

function localLinkTarget(rawTarget) {
  const trimmed = rawTarget.trim()
  const target = trimmed.startsWith('<')
    ? trimmed.slice(1, trimmed.indexOf('>'))
    : trimmed.split(/\s+["']/u, 1)[0]
  const withoutFragment = target.split('#', 1)[0]

  if (!withoutFragment || /^(?:https?:|mailto:|\/)/u.test(withoutFragment)) {
    return null
  }

  return decodeURIComponent(withoutFragment)
}

function skillFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u)
  return match?.[1] ?? null
}

const sharedSkillPaths = [
  path.join(repositoryRoot, '.agents', 'skills', 'venue-wave', 'SKILL.md'),
  path.join(repositoryRoot, '.claude', 'skills', 'venue-wave', 'SKILL.md'),
]

const markdownFiles = [
  path.join(repositoryRoot, 'AGENTS.md'),
  path.join(repositoryRoot, 'CLAUDE.md'),
  path.join(repositoryRoot, 'README.md'),
  ...await collectMarkdownFiles(path.join(repositoryRoot, 'docs')),
  ...await collectMarkdownFiles(path.join(repositoryRoot, '.agents')),
  ...await collectMarkdownFiles(path.join(repositoryRoot, '.claude')),
]
const missingLinks = []
const harnessErrors = []

for (const markdownFile of markdownFiles) {
  const content = await readFile(markdownFile, 'utf8')
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/gu

  for (const match of content.matchAll(linkPattern)) {
    const target = localLinkTarget(match[1])
    if (!target) continue

    const resolvedTarget = path.resolve(path.dirname(markdownFile), target)
    try {
      await stat(resolvedTarget)
    } catch {
      missingLinks.push(
        `${path.relative(repositoryRoot, markdownFile)} -> ${target}`,
      )
    }
  }
}

const claudeInstructions = await readFile(path.join(repositoryRoot, 'CLAUDE.md'), 'utf8')
if (!/^@AGENTS\.md\s*$/mu.test(claudeInstructions)) {
  harnessErrors.push('CLAUDE.md must import @AGENTS.md')
}

const skillContents = await Promise.all(sharedSkillPaths.map((skillPath) => readFile(skillPath, 'utf8')))
for (const [index, content] of skillContents.entries()) {
  const frontmatter = skillFrontmatter(content)
  const label = path.relative(repositoryRoot, sharedSkillPaths[index])
  if (!frontmatter || !/^name:\s*venue-wave\s*$/mu.test(frontmatter)) {
    harnessErrors.push(`${label} must declare name: venue-wave`)
  }
  if (!frontmatter || !/^description:\s*\S.+$/mu.test(frontmatter)) {
    harnessErrors.push(`${label} must declare a non-empty description`)
  }
  if (!content.includes('../../../docs/VENUE_WORKFLOW.md')) {
    harnessErrors.push(`${label} must reference docs/VENUE_WORKFLOW.md`)
  }
}

if (skillContents[0] !== skillContents[1]) {
  harnessErrors.push('Codex and Claude venue-wave adapters must remain identical')
}


if (missingLinks.length > 0) {
  console.error('Broken local Markdown links:')
  for (const missingLink of missingLinks) console.error(`  ${missingLink}`)
  process.exitCode = 1
} else {
  console.log(`Local Markdown links are valid (${markdownFiles.length} files).`)
}

if (harnessErrors.length > 0) {
  console.error('Shared harness errors:')
  for (const harnessError of harnessErrors) console.error(`  ${harnessError}`)
  process.exitCode = 1
} else if (missingLinks.length === 0) {
  console.log('Shared agent instructions and venue-wave adapters are valid.')
}
