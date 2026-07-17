import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const SOURCE_URL = 'https://www.kyoceradome-osaka.jp/app/_src/data.json'
const OUTPUT_URL = new URL('../src/data/venues/generated/kyoceraBaseballSeats.ts', import.meta.url)

const sectionIds = {
  '中央A\u0000下段': 'center-a-lower',
  '中央B\u0000下段': 'center-b-lower',
  '中央C\u0000下段': 'center-c-lower',
  '中央D\u0000下段': 'center-d-lower',
  '中央E\u0000下段': 'center-e-lower',
  '中央F\u0000下段': 'center-f-lower',
  '中央G\u0000下段': 'center-g-lower',
  '中央H\u0000下段': 'center-h-lower',
  '中央I\u0000下段': 'center-i-lower',
  '中央J\u0000下段': 'center-j-lower',
  '中央K\u0000下段': 'center-k-lower',
  '中央L\u0000下段': 'center-l-lower',
  '1塁側\u0000下段': 'first-base-lower',
  '1塁側\u0000上段': 'first-base-upper',
  '1塁側\u0000FAブロック': 'first-base-fa',
  '1塁側\u0000FBブロック': 'first-base-fb',
  '3塁側\u0000下段': 'third-base-lower',
  '3塁側\u0000上段': 'third-base-upper',
  '3塁側\u0000FAブロック': 'third-base-fa',
  '3塁側\u0000FBブロック': 'third-base-fb',
}

const response = await fetch(SOURCE_URL)
if (!response.ok) throw new Error(`Could not download official seat data: ${response.status}`)
const sourceText = await response.text()
const sourceData = JSON.parse(sourceText)

const compressNumbers = (values) => {
  const numbers = values.map(Number).sort((left, right) => left - right)
  const ranges = []
  let from = numbers[0]
  let to = numbers[0]
  for (const number of numbers.slice(1)) {
    if (number === to + 1) to = number
    else {
      ranges.push(from === to ? String(from) : `${from}-${to}`)
      from = number
      to = number
    }
  }
  ranges.push(from === to ? String(from) : `${from}-${to}`)
  return ranges.join(',')
}

const sections = []
let seatCount = 0
for (const [area, levels] of Object.entries(sourceData)) {
  for (const [level, rows] of Object.entries(levels)) {
    const key = `${area}\u0000${level}`
    const id = sectionIds[key]
    if (!id) throw new Error(`No stable section ID is defined for ${area} ${level}`)
    const compactRows = {}
    for (const rowLabel of Object.keys(rows).sort((left, right) => left.localeCompare(right, 'ja', { numeric: true }))) {
      const seatNumbers = Object.keys(rows[rowLabel])
      compactRows[rowLabel] = compressNumbers(seatNumbers)
      seatCount += seatNumbers.length
    }
    sections.push({ id, label: `${area} ${level}`, rows: compactRows })
  }
}

const sourceHash = createHash('sha256').update(sourceText).digest('hex')
const generated = `// Generated from the official Kyocera Dome Osaka seat-search data.\n// Do not edit manually; run: node scripts/import-kyocera-seat-data.mjs\nexport const KYOCERA_BASEBALL_SOURCE_SHA256 = '${sourceHash}'\nexport const KYOCERA_BASEBALL_EXPECTED_SEAT_COUNT = ${seatCount}\nexport const kyoceraBaseballCompactSections = ${JSON.stringify(sections, null, 2)} as const\n`

await mkdir(fileURLToPath(new URL('../src/data/venues/generated/', import.meta.url)), { recursive: true })
await writeFile(fileURLToPath(OUTPUT_URL), generated, 'utf8')
console.log(`Generated ${sections.length} sections and ${seatCount.toLocaleString('en-US')} seats.`)
