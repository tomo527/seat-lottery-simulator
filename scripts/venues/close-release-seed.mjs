import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
const TODAY = '2026-08-03'
const manifestPath = path.join(ROOT, 'data/venue-release-targets/release-seed-v1.json')
const batchPath = path.join(ROOT, 'data/venue-batches/release-seed-v1.json')
const sourceDir = path.join(ROOT, 'data/venue-sources')
const inventoryDir = path.join(ROOT, 'data/venue-inventory')
const reportPath = path.join(ROOT, 'data/venue-reports/release-seed-v1-closure.json')

const m = (classification, route, options = {}) => ({
  officialFacilityPage: options.facilityPage ?? 'あり',
  officialSeatStructureSource: options.mapUrl ? 'あり' : 'なし',
  officialSeatCountSource: options.countUrl ? 'あり' : 'なし',
  completeNumberedSeatMap: options.mapUrl ? 'あり' : 'なし',
  exactNominalSeatCount: options.countUrl ? 'あり' : 'なし',
  representativeLayout: options.mapUrl ? (options.representativeLayout ?? '一意') : '不明',
  fixedSeats: options.fixedSeats ?? (options.mapUrl ? 'あり' : '不明'),
  movableSeats: options.movableSeats ?? (options.mapUrl ? 'なし' : '不明'),
  wheelchair: options.wheelchair ?? (options.mapUrl ? '不明' : '不明'),
  pit: options.pit ?? (options.mapUrl ? 'なし' : '不明'),
  areas: options.areas ?? (classification === 'SOURCE HOLD' ? '不明' : '複数'),
  processingRoute: route,
  classification,
  mapUrl: options.mapUrl ?? null,
  countUrl: options.countUrl ?? options.mapUrl ?? null,
  checkedAt: TODAY,
  rationale: options.rationale ?? `公式資料の現行状態をClosure Passで確認し、${classification}へ分類。番号rangeは未転記。`,
})

const entries = {
  'kanagawa-kenmin-hall-main-release-seed': m('SOL HANDOFF', 'Sol', { mapUrl: 'https://www.kanagawa-kenminhall.com/about/mainhall', countUrl: 'https://www.kanagawa-kenminhall.com/about/mainhall', areas: '複雑', wheelchair: '不明', pit: '不明', rationale: '公式大ホール施設ページは確認できたが、通常配置の完全な番号図と転換・車椅子条件の独立照合を要する。' }),
  'yokohama-minatomirai-hall-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://yokohama-minatomiraihall.jp/static/file/guide/download/hallm.pdf', countUrl: 'https://yokohama-minatomiraihall.jp/ticket/main.html', areas: '複数', wheelchair: '非番号区画', rationale: '公式大ホール座席表PDFと公式座席案内ページを確認。複数階の通常配置を独立転記する対象。' }),
  'muza-kawasaki-symphony-hall-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.kawasaki-sym-hall.jp/', countUrl: 'https://www.kawasaki-sym-hall.jp/', areas: '複数', rationale: '公式施設サイト内のホール座席資料導線を確認。通常配置の公式資料照合が残る。' }),
  'yokosuka-arts-theatre-release-seed': m('SOL HANDOFF', 'Sol', { mapUrl: 'https://www.yokosuka-arts.or.jp/rental/download/pdf/L_seat.pdf', countUrl: 'https://www.yokosuka-arts.or.jp/rental/download/pdf/L_sisetsu.pdf', areas: '複雑', wheelchair: '不明', pit: 'あり', rationale: '公式座席図PDFと施設資料PDFを確認。大劇場のピット・転換条件を含むため高度照合が必要。' }),
  'culttz-kawasaki-hall-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://culttz.city.kawasaki.jp/seating-chart/', countUrl: 'https://culttz.city.kawasaki.jp/seating-chart/', areas: '複数', wheelchair: '不明' }),
  'sagamihara-green-hall-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://hall-net.or.jp/01greenhall/visitors/seatmap/', countUrl: 'https://hall-net.or.jp/01greenhall/rental/mainhall/', areas: '複数', wheelchair: '非番号区画', rationale: '公式案内で大ホール客席数1,790席と座席表導線を確認。通常配置の番号集合を転記可能。' }),
  'ichikawa-culture-hall-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.tekona.net/bunkakaikan/ticket/mainhall', countUrl: 'https://www.tekona.net/bunkakaikan/ticket/mainhall', areas: '複数' }),
  'mori-no-hall21-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.morinohall21.com/hall21/hall_l.html', countUrl: 'https://www.morinohall21.com/hall21/hall_l.html', areas: '複数' }),
  'narashino-culture-hall-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: 'なし', rationale: '登録済み公式URLが404で、現行施設ページ・番号図・厳密席数を確認できない。' }),
  'funabashi-civic-culture-hall-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: '不明', rationale: '登録済み公式URLへの現行資料到達を確認できず、番号図・厳密席数を確定しない。' }),
  'chiba-city-culture-center-hall-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '登録URLは財団トップへリダイレクトし、対象アートホールの現行番号図・厳密席数を特定できない。' }),
  'urayasu-culture-hall-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式施設ページは確認できたが、現行の完全番号図と厳密席数の組合せを特定できない。' }),
  'saitama-arts-theatre-main-release-seed': m('SOL HANDOFF', 'Sol', { mapUrl: 'https://www.saf.or.jp/arthall/facilities/main_hall/', countUrl: 'https://www.saf.or.jp/arthall/facilities/main_hall/', areas: '複雑', wheelchair: '不明', pit: '不明', rationale: '公式大ホール施設ページは確認できたが、多層・密な客席と可動・転換条件の独立照合が必要。' }),
  'saitama-kaikan-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.saf.or.jp/saitama/facilities/main_hall/', countUrl: 'https://www.saf.or.jp/saitama/facilities/main_hall/', areas: '複数' }),
  'omiya-sonic-city-large-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.sonic-city.or.jp/visitors/seating.html', countUrl: 'https://www.sonic-city.or.jp/visitors/seating.html', areas: '複数', wheelchair: '不明' }),
  'kawaguchi-lilia-main-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式トップは確認できたが、改修後の対象メインホールについて現行完全番号図・厳密席数を確定できない。' }),
  'tokorozawa-muse-ark-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.muse-tokorozawa.or.jp/seat/', countUrl: 'https://www.muse-tokorozawa.or.jp/seat/', areas: '複数', wheelchair: '不明' }),
  'westa-kawagoe-large-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://westa-kawagoe.jp/facility/seat.html', countUrl: 'https://westa-kawagoe.jp/facility/seat.html', areas: '複数', wheelchair: '不明' }),
  'mito-arts-tower-concert-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式ホール施設ページは確認できたが、現行コンサートホールATMの完全番号図と厳密席数を同一対象として特定できない。' }),
  'ibaraki-kenritsu-bunka-center-large-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式施設サイトは確認できたが、対象大ホールの現行完全番号図・厳密席数を確定できない。' }),
  'tochigi-ken-sogo-bunka-center-main-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: '不明', rationale: '登録済み公式URLへの現行資料到達を確認できず、番号図・厳密席数を確定しない。' }),
  'utsunomiya-city-culture-hall-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.bunkakaikan.com/facilityguide/seat.html', countUrl: 'https://www.bunkakaikan.com/facilityguide/b_hall.html', areas: '複数', wheelchair: '不明' }),
  'gunma-music-center-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '登録URLは高崎芸術劇場の資料ページで、群馬音楽センター対象の現行番号図・厳密席数を識別できない。' }),
  'takasaki-city-theatre-main-release-seed': m('SOL HANDOFF', 'Sol', { mapUrl: 'https://www.takasaki-foundation.or.jp/theatre/', countUrl: 'https://www.takasaki-foundation.or.jp/theatre/', areas: '複雑', wheelchair: '不明', pit: '不明' }),
  'sapporo-kitara-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.kitara-sapporo.or.jp/facility/seat.html', countUrl: 'https://www.kitara-sapporo.or.jp/facility/mainhall.html', areas: '複数', wheelchair: '不明' }),
  'sapporo-kitara-small-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.kitara-sapporo.or.jp/facility/seat.html', countUrl: 'https://www.kitara-sapporo.or.jp/facility/smallhall.html', areas: '複数', wheelchair: '不明' }),
  'sapporo-hitaru-release-seed': m('TERRA HANDOFF', 'Terra', { mapUrl: 'https://www.sapporo-community-plaza.jp/theater_seat.html', countUrl: 'https://www.sapporo-community-plaza.jp/facility_theater.html', areas: '複雑', wheelchair: '不明', pit: '不明', rationale: '公式座席図と劇場施設資料を確認。多層・密なrange抽出をTerraへ引き継ぐ。' }),
  'sendai-sunplaza-hall-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.sendai-sunplaza.com/hall/abouthall/', countUrl: 'https://www.sendai-sunplaza.com/hall/abouthall/', areas: '複数', wheelchair: '不明' }),
  'tokyo-electron-hall-miyagi-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: '不明', rationale: '登録済み公式URLは403で現行対象資料を確認できず、番号図・厳密席数を確定しない。' }),
  'izumity21-main-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: '不明', rationale: '登録済み公式URLは403で現行対象資料を確認できず、番号図・厳密席数を確定しない。' }),
  'aichi-arts-center-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www-stage.aac.pref.aichi.jp/facility/main-seat.html', countUrl: 'https://www-stage.aac.pref.aichi.jp/facility/main.html', areas: '複数', wheelchair: '不明' }),
  'niterra-forest-hall-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式財団トップは確認できたが、対象フォレストホールの現行完全番号図・厳密席数を特定できない。' }),
  'misonoza-release-seed': m('TERRA HANDOFF', 'Terra', { mapUrl: 'https://www.misonoza.co.jp/seat/', countUrl: 'https://www.misonoza.co.jp/seat/', areas: '複雑', wheelchair: '不明', pit: '不明', rationale: '公式座席案内を確認。階・桟敷・ボックス等の密なrange抽出をTerraへ引き継ぐ。' }),
  'kyoto-concert-hall-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.kyotoconcerthall.org/seat/', countUrl: 'https://www.kyotoconcerthall.org/seat/', areas: '複数', wheelchair: '不明' }),
  'rohm-theatre-kyoto-main-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://rohmtheatrekyoto.jp/floorguide/main-hall/', countUrl: 'https://rohmtheatrekyoto.jp/floorguide/main-hall/', areas: '複数', wheelchair: '不明' }),
  'kyoto-art-theatre-shunjuza-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式サイトは確認できたが、春秋座の現行完全番号図・厳密席数の資料を対象ページから確定できない。' }),
  'festival-hall-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.festivalhall.jp/about/zaseki.html', countUrl: 'https://www.festivalhall.jp/about/zaseki.html', areas: '複数', wheelchair: '不明' }),
  'orix-theatre-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式トップは確認できたが、対象劇場の現行完全番号図・厳密席数を確定できない。' }),
  'umeda-arts-theater-main-release-seed': m('TERRA HANDOFF', 'Terra', { mapUrl: 'https://www.umegei.com/guide/seat/', countUrl: 'https://www.umegei.com/guide/floormap/', areas: '複雑', wheelchair: '不明', pit: '不明' }),
  'kobe-kokusai-hall-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: '不明', rationale: '登録済み公式URLへの現行資料到達を確認できず、番号図・厳密席数を確定しない。' }),
  'kobe-matsukata-hall-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: '不明', rationale: '登録済み公式URLへの現行資料到達を確認できず、番号図・厳密席数を確定しない。' }),
  'kobe-bunka-hall-main-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '公式サイトは確認できたが、改修・新ホール時点を含む対象大ホールの現行完全番号図・厳密席数を確定できない。' }),
  'hbg-hall-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://h-bkk.jp/hall/seat/', countUrl: 'https://h-bkk.jp/hall/summary/', areas: '単純', wheelchair: '不明' }),
  'jms-aster-plaza-large-release-seed': m('SOURCE HOLD', 'Hold', { facilityPage: '不明', rationale: '登録済み公式URLへの現行資料到達を確認できず、番号図・厳密席数を確定しない。' }),
  'hiroshima-city-culture-exchange-hall-release-seed': m('SOURCE HOLD', 'Hold', { rationale: '同一公式サイトは確認できたが、HBGホールと対象施設の資料対象を分離できず、番号図・厳密席数を確定しない。' }),
  'acros-fukuoka-symphony-release-seed': m('TERRA HANDOFF', 'Terra', { mapUrl: 'https://www.acros.or.jp/images/pdf/sh_zasekihyo.pdf', countUrl: 'https://www.acros.or.jp/s_facilities/user_guide/', areas: '複雑', wheelchair: '不明', pit: '不明' }),
  'fukuoka-sunpalace-hall-release-seed': m('STANDARD', 'Luna', { mapUrl: 'https://www.f-sunpalace.com/hall/hall-seat-guide/', countUrl: 'https://www.f-sunpalace.com/hall/hall-seat-guide/', areas: '複数', wheelchair: '不明' }),
  'hakataza-release-seed': m('TERRA HANDOFF', 'Terra', { mapUrl: 'https://www.hakataza.co.jp/', countUrl: 'https://www.hakataza.co.jp/', areas: '複雑', wheelchair: '不明', pit: '不明', rationale: '公式劇場サイトは確認できたが、劇場座席の密なrange抽出と配置資料の対象照合をTerraへ引き継ぐ。' }),
}

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))
const writeJson = async (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')

const manifest = await readJson(manifestPath)
const batch = await readJson(batchPath)
const sourceFiles = new Map()
for (const file of await readdir(sourceDir)) {
  if (file.endsWith('-release-seed.json')) sourceFiles.set(file.replace(/\.json$/, ''), path.join(sourceDir, file))
}
const inventoryFiles = await readdir(inventoryDir)
const inventoryBySourceId = new Map()
for (const file of inventoryFiles.filter((item) => item.startsWith('release-seed-') && item.endsWith('.json'))) {
  const data = await readJson(path.join(inventoryDir, file))
  for (const venue of data.venues ?? []) inventoryBySourceId.set(venue.venueSourceId, { file: path.join(inventoryDir, file), data, venue })
}

const reportTargets = []
for (const target of manifest.targets) {
  const preflight = entries[target.venueId]
  if (!preflight) throw new Error(`Missing closure entry for ${target.venueId}`)
  const oldUrl = target.preflight?.officialFacilityUrl
  target.preflight = { ...preflight, officialFacilityUrl: oldUrl }
  target.currentStatus = preflight.classification === 'SOURCE HOLD' ? 'source-hold' : 'preflight-complete'

  const sourcePath = sourceFiles.get(target.venueId)
  if (!sourcePath) throw new Error(`Missing source for ${target.venueId}`)
  const source = await readJson(sourcePath)
  source.preflight = {
    ...preflight,
    officialFacilityUrl: oldUrl,
    status: 'complete',
    rangeEntry: 'not-started',
    decision: 'pending',
  }
  if (preflight.mapUrl) {
    const ids = new Set(source.sources.map((item) => item.id))
    if (!ids.has('official-seat-map')) source.sources.push({ id: 'official-seat-map', official: true, roles: ['seat-structure'], publisher: source.name, title: '公式座席図・座席案内', url: preflight.mapUrl, checkedAt: TODAY })
    if (!ids.has('official-seat-count')) source.sources.push({ id: 'official-seat-count', official: true, roles: ['seat-count'], publisher: source.name, title: '公式施設・座席数案内', url: preflight.countUrl, checkedAt: TODAY })
  }
  source.knownLimitations = [
    `Closure Pass分類: ${preflight.classification}。${preflight.rationale}`,
    'Closure Passでは公式資料の存在と処理経路を確定し、番号rangeの転記は行っていない。',
  ]
  await writeJson(sourcePath, source)

  const inventory = inventoryBySourceId.get(target.venueId)
  if (!inventory) throw new Error(`Missing inventory for ${target.venueId}`)
  inventory.venue.researchStatus = preflight.classification === 'SOURCE HOLD' ? 'blocked' : 'draft-created'
  inventory.venue.researchLastCheckedAt = TODAY
  inventory.venue.blockingReason = preflight.classification === 'SOURCE HOLD' ? preflight.rationale : null
  await writeJson(inventory.file, inventory.data)

  const existingAssessment = batch.complexityAssessments.find((item) => item.inventoryId === target.inventoryId)
  if (!existingAssessment) throw new Error(`Missing batch assessment for ${target.inventoryId}`)
  existingAssessment.classification = preflight.classification
  existingAssessment.rationale = preflight.rationale
  existingAssessment.preflightComplete = true
  existingAssessment.processingRoute = preflight.processingRoute
}

await writeJson(manifestPath, manifest)
await writeJson(batchPath, batch)

const report = {
  reportVersion: 1,
  reportId: 'release-seed-v1-closure',
  generatedAt: TODAY,
  targetCount: manifest.targets.length,
  scope: 'Official-source closure preflight; no range transcription.',
  decisionCompleteStatuses: ['production', 'SOURCE HOLD', 'POLICY HOLD', 'CONTRADICTION', 'INDEPENDENT REVIEW MISMATCH'],
  targets: manifest.targets.map((target) => ({
    id: target.venueId,
    venueName: target.name,
    region: target.prefecture,
    city: target.city,
    priority: target.priority,
    seatMap: target.preflight.officialSeatStructureSource,
    seatCount: target.preflight.officialSeatCountSource,
    representativePattern: target.preflight.representativeLayout,
    preflightClassification: target.preflight.classification,
    finalStatus: target.currentStatus,
    production: false,
    modelHandoff: target.preflight.processingRoute,
    preflight: target.preflight,
  })),
  handoffs: {
    terraMacro: manifest.targets.filter(({ preflight }) => preflight.classification === 'TERRA HANDOFF').map(({ venueId, name, prefecture, priority, preflight }) => ({ venueId, venueName: name, region: prefecture, priority, officialSeatMap: preflight.mapUrl, officialSeatCount: preflight.countUrl, nominalSeatCount: '公式資料の厳密値はrange前に転記', representativePattern: preflight.representativeLayout, confirmedAreas: preflight.areas, unresolved: preflight.rationale, doNotGuess: ['座席番号', '欠番', '車椅子転換対象番号', 'ピット・迫り撤去番号'], nextWork: '公式図をレンダー確認し、密なarea/row rangeを第1・第2パスで独立抽出する。' })),
    solMacro: manifest.targets.filter(({ preflight }) => preflight.classification === 'SOL HANDOFF').map(({ venueId, name, prefecture, priority, preflight }) => ({ venueId, venueName: name, region: prefecture, priority, officialSeatMap: preflight.mapUrl, officialSeatCount: preflight.countUrl, nominalSeatCount: '公式資料の厳密値はrange前に転記', representativePattern: preflight.representativeLayout, confirmedAreas: preflight.areas, unresolved: preflight.rationale, doNotGuess: ['車椅子転換対象番号', 'ピット・迫り撤去番号', '資料時点差', '局所的不一致'], nextWork: '公式資料間の対象配置を照合し、必要ならSolで判断を確定してからrangeを入力する。' })),
  },
}
await writeJson(reportPath, report)
console.log(`Closed ${report.targets.length} Release Seed preflight records.`)
