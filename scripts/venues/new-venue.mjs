import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, requireArgs } from './cli.mjs'
import { jsonText, SOURCE_DIR } from './lib.mjs'
import { regionForPrefecture } from './regions.mjs'
import { validateSources } from './validation.mjs'
import { VENUE_TYPES } from './constants.mjs'

export const newVenueTemplate = ({ id, name, prefecture, city, type }) => ({
  schemaVersion: 1,
  status: 'draft',
  id,
  name,
  prefecture,
  city,
  aliases: [],
  venueType: type,
  representativePattern: {
    id: '',
    name: '',
    coverage: 'draft',
    expectedSeatCount: null,
    selectionReason: '',
    notIncludedPatterns: [],
  },
  sources: [],
  registeredScope: '',
  completenessBasis: '',
  transformation: '',
  knownLimitations: [],
  verification: {
    status: 'pending',
    checkedAt: null,
    method: '',
    seatStructure: 'pending',
    seatCount: 'pending',
    unresolvedIssues: [],
  },
  ranges: [],
})

export const createVenueSource = async (values, options = {}) => {
  const sourceDir = options.sourceDir ?? SOURCE_DIR
  for (const key of ['id', 'name', 'prefecture', 'city', 'type']) {
    if (typeof values[key] === 'string' && values[key] !== values[key].trim()) {
      throw new Error(`Invalid --${key}: leading or trailing whitespace is not allowed.`)
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.id ?? '')) throw new Error('Invalid --id: use lowercase letters, digits, and hyphens.')
  if (!VENUE_TYPES.has(values.type)) throw new Error(`Invalid --type: expected one of ${[...VENUE_TYPES].join(', ')}.`)
  if (!regionForPrefecture(values.prefecture)) throw new Error(`Unknown --prefecture: ${values.prefecture}`)
  for (const key of ['name', 'city']) {
    if (typeof values[key] !== 'string' || !values[key].trim()) throw new Error(`Invalid --${key}: value must not be empty.`)
  }
  const data = newVenueTemplate(values)
  const file = `${values.id}.json`
  const validation = validateSources([{ file, data }])
  if (validation.errors.length) throw new Error(`Generated draft failed basic validation:\n${validation.errors.join('\n')}`)
  await mkdir(sourceDir, { recursive: true })
  const target = path.join(sourceDir, file)
  await writeFile(target, jsonText(data), { encoding: 'utf8', flag: 'wx' }).catch((error) => {
    if (error?.code === 'EEXIST') throw new Error(`Refusing to overwrite existing source: ${target}`)
    throw error
  })
  return target
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const args = parseArgs(process.argv.slice(2), new Map([
      ['id', 'value'],
      ['name', 'value'],
      ['prefecture', 'value'],
      ['city', 'value'],
      ['type', 'value'],
    ]))
    requireArgs(args, ['id', 'name', 'prefecture', 'city', 'type'])
    const target = await createVenueSource(args)
    console.log(`Created draft venue source: ${path.relative(process.cwd(), target)}`)
    console.log('Add official sources and explicit seat ranges before promotion to production.')
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
