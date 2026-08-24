import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

declare global {
  interface Window { __osShareCalls: number }
}

const catalog = JSON.parse(readFileSync(new URL('../../src/data/venue-db/catalog.generated.json', import.meta.url), 'utf8')) as {
  prefecture: string
}[]
const tokyoVenueCount = catalog.filter((venue) => venue.prefecture === '東京都').length

const openPicker = (page: Page) => page.getByRole('button', { name: /会場を選ぶ|会場を変更/ }).click()

const resetPicker = async (page: Page) => {
  const reset = page.getByRole('button', { name: '絞り込みをリセット' })
  if (await reset.isEnabled()) await reset.click()
}

const chooseVenue = async (page: Page, query: string, name: string) => {
  await openPicker(page)
  await resetPicker(page)
  await page.getByLabel('会場名で検索').fill(query)
  await page.getByRole('button', { name: `${name}を選ぶ` }).click()
  await expect(page.getByText('座席データを読み込んでいます')).toBeVisible()
  await expect(page.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
  await expect(page.getByRole('button', { name: '会場を変更' })).toBeFocused()
}

const drawAndExpectNotification = async (page: Page, venueName: string, minimumDuration = 3_800) => {
  const startedAt = Date.now()
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByTestId('lottery-animation').locator('.lottery-sprite-wrap')).toBeVisible()
  await expect(page.getByTestId('lottery-animation').locator('.drawing-progress')).toBeVisible()
  await expect(page.getByRole('button', { name: '抽選中……' })).toBeDisabled()
  await expect(page.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeVisible({ timeout: 8_000 })
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(minimumDuration)
  const result = page.locator('.result-card')
  await expect(result.getByText(venueName, { exact: true })).toBeVisible()
  await expect(result.locator('.result-message')).toContainText('厳正なる抽選の結果、')
  await expect(result.locator('.result-message')).toContainText('以下のお席となりました。')
  await expect(result.getByText('列', { exact: true })).toBeVisible()
  await expect(result.getByText('座席番号', { exact: true })).toBeVisible()
  await expect(result.getByText('SIMULATION')).toBeVisible()
  await expect(result.locator('svg, img, [data-presentation], .seat-grid, .seat-map-card')).toHaveCount(0)
  await expect(result.locator('a[href^="http"]')).toHaveCount(0)
  await expect(result).not.toContainText(/QRコード|バーコード|チケットぴあ|ローチケ|e\+/)
}

test.beforeEach(async ({ page }) => {
  await page.route('**/venue-db/venues/*.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    await route.continue()
  })
})

test('フッターから法務ページを往復し、直接URLでも表示できる', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: '利用規約' }).click()
  await expect(page).toHaveURL(/\/terms$/)
  await expect(page).toHaveTitle('利用規約｜座席抽選シミュレーター')
  await expect(page.getByRole('heading', { name: '利用規約', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: '第8条（免責事項）' })).toBeVisible()
  await page.getByRole('link', { name: '← TOPへ戻る' }).click()
  await expect(page.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeVisible()

  await page.getByRole('link', { name: 'プライバシーポリシー' }).click()
  await expect(page).toHaveURL(/\/privacy$/)
  await expect(page).toHaveTitle('プライバシーポリシー｜座席抽選シミュレーター')
  await expect(page.getByText(/Cloudflare Workers Static Assets/)).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'プライバシーポリシー', level: 1 })).toBeVisible()
  await page.getByRole('link', { name: '← TOPへ戻る' }).click()
  await expect(page.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeVisible()

  await page.getByRole('link', { name: '特定商取引法に基づく表記' }).click()
  await expect(page).toHaveURL(/\/tokushoho$/)
  await expect(page).toHaveTitle('特定商取引法に基づく表記｜座席抽選シミュレーター')
  await expect(page.getByRole('heading', { name: '特定商取引法に基づく表記', level: 1 })).toBeVisible()
  await expect(page.getByText('現在、開発支援の受付は無効です。')).toHaveCount(0)
  await page.reload()
  await expect(page.getByText('キャンセル・返金')).toBeVisible()
  await expect(page.getByRole('link', { name: 'studiotomo99@gmail.com' })).toHaveAttribute('href', 'mailto:studiotomo99@gmail.com')
  await page.getByRole('link', { name: '← TOPへ戻る' }).click()
  await expect(page.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeVisible()
  await expect(page.locator('.support-section')).not.toBeVisible()

  await page.goto('/terms')
  await expect(page.getByRole('heading', { name: '利用規約', level: 1 })).toBeVisible()
  await page.goto('/tokushoho')
  await expect(page.getByRole('heading', { name: '特定商取引法に基づく表記', level: 1 })).toBeVisible()
  await page.goto('/unknown-spa-path')
  await expect(page.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeVisible()
})

test('願掛け（開発支援）は抽選結果表示後だけ現れ、再抽選や条件変更で再び消える', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.support-section')).not.toBeVisible()

  await chooseVenue(page, '一橋大学一橋講堂', '一橋講堂')
  await expect(page.locator('.support-section')).not.toBeVisible()

  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.locator('.support-section')).not.toBeVisible()
  await expect(page.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeVisible({ timeout: 8_000 })
  await expect(page.locator('.support-section')).toBeVisible()
  await expect(page.getByRole('link', { name: /支援する/ })).toHaveAttribute('href', 'https://buy.stripe.com/cNidRbb7kfvKgiA4mbdnW00')
  await expect(page.locator('.result-card .support-section')).toHaveCount(0)

  await page.getByRole('button', { name: 'もう一度抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.locator('.support-section')).not.toBeVisible()
  await expect(page.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeVisible({ timeout: 8_000 })
  await expect(page.locator('.support-section')).toBeVisible()

  await page.getByRole('button', { name: '条件を変更する' }).click()
  await expect(page.locator('.support-section')).not.toBeVisible()
})

test('4要素をANDで絞り込み、通知風結果を再抽選できる', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await page.goto('/')
  await openPicker(page)
  await page.getByLabel('エリア').selectOption({ label: '関東' })
  await page.getByLabel('都道府県').selectOption({ label: '東京都' })
  await page.getByLabel('市区町村').selectOption({ label: '千代田区' })
  await page.getByLabel('会場名で検索').fill('ＩＩＮＯ　ＨＡＬＬ')
  await expect(page.getByText('絞り込み結果 1件')).toBeVisible()
  await page.getByRole('button', { name: 'イイノホールを選ぶ' }).click()
  await expect(page.getByText('座席データを読み込んでいます')).toBeVisible()
  await expect(page.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
  await drawAndExpectNotification(page, 'イイノホール')

  await page.getByRole('button', { name: 'もう一度抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeVisible({ timeout: 8_000 })
  expect(consoleErrors).toEqual([])
})

test('一橋講堂をalias検索し、detailをlazy loadして階表示付きで抽選できる', async ({ page }) => {
  await page.goto('/')
  await openPicker(page)
  await page.getByLabel('会場名で検索').fill('一橋大学一橋講堂')
  await expect(page.getByText('絞り込み結果 1件')).toBeVisible()
  const detailResponse = page.waitForResponse((response) =>
    response.url().endsWith('/venue-db/venues/hitotsubashi-hall-standard.json') && response.ok())
  await page.getByRole('button', { name: '一橋講堂を選ぶ' }).click()
  await detailResponse
  await expect(page).toHaveURL(/\?venue=hitotsubashi-hall-standard$/)
  await expect(page.getByText('抽選対象 521席')).toBeVisible()
  await expect(page.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
  await drawAndExpectNotification(page, '一橋講堂')
  await expect(page.locator('.ticket-details').getByText('エリア', { exact: true })).toBeVisible()
  await expect(page.locator('.ticket-details dd').filter({ hasText: /1階|2階/ })).toBeVisible()
})

test('明治座を1会場として検索し、公式2configurationを選び分けて抽選できる', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await page.goto('/')
  await openPicker(page)
  await page.getByLabel('会場名で検索').fill('明治座')
  await expect(page.getByText('絞り込み結果 1件')).toBeVisible()
  await page.getByRole('button', { name: '明治座を選ぶ' }).click()

  await expect(page.getByRole('radio', { name: /花道あり.*1,368席/ })).toBeVisible()
  await expect(page.getByRole('radio', { name: /花道なし.*1,448席/ })).toBeVisible()
  await expect(page.getByRole('button', { name: '座席を抽選する' })).toBeDisabled()

  const detailResponse = page.waitForResponse((response) => response.url().endsWith('/venue-db/venues/meijiza-standard--with-hanamichi.json') && response.ok())
  await page.getByRole('radio', { name: /花道あり.*1,368席/ }).check()
  await detailResponse
  await expect(page.getByText('抽選対象 1,368席', { exact: true })).toBeVisible()
  await drawAndExpectNotification(page, '明治座')
  await expect(page.locator('.result-card').getByText('花道あり', { exact: true })).toBeVisible()

  const withoutDetailResponse = page.waitForResponse((response) => response.url().endsWith('/venue-db/venues/meijiza-standard--without-hanamichi.json') && response.ok())
  await page.getByRole('radio', { name: /花道なし.*1,448席/ }).check()
  await withoutDetailResponse
  await expect(page.getByText('抽選対象 1,448席', { exact: true })).toBeVisible()
  await drawAndExpectNotification(page, '明治座')
  await expect(page.locator('.result-card').getByText('花道なし', { exact: true })).toBeVisible()
  expect(consoleErrors).toEqual([])
})

test('新国立劇場 中劇場の公式AB迫りconfigurationを選んで抽選でき、抽選範囲の説明は画面に表示しない', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await page.goto('/')
  await openPicker(page)
  await page.getByLabel('会場名で検索').fill('NNTT Playhouse')
  await expect(page.getByText('絞り込み結果 1件')).toBeVisible()

  const detailResponse = page.waitForResponse((response) =>
    response.url().endsWith('/venue-db/venues/nntt-playhouse-standard--proscenium-ab-seri.json') && response.ok())
  await page.getByRole('button', { name: '新国立劇場 中劇場を選ぶ' }).click()
  await detailResponse

  await expect(page.getByText('抽選対象 906席', { exact: true })).toBeVisible()
  await expect(page.getByText(/公式定義するプロセニアム形式③（A・B号迫り使用）/)).not.toBeVisible()
  await expect(page.getByText(/他の4基本パターン、最大8席の無番号車椅子スペース、公演別の最前列販売停止は含みません/)).not.toBeVisible()
  await drawAndExpectNotification(page, '新国立劇場 中劇場')
  await expect(page.locator('.result-card').getByText('プロセニアム形式③ A・B号迫り使用', { exact: true })).toBeVisible()
  await expect(page.locator('.result-card').getByText('抽選範囲', { exact: true })).not.toBeVisible()
  expect(consoleErrors).toEqual([])
})

test('会場切替と自作座席でも通知カードが成立する', async ({ page }) => {
  await page.goto('/')
  await chooseVenue(page, '東京芸術劇場', '東京芸術劇場 シアターイースト')
  await expect(page.getByText('抽選対象 272席')).toBeVisible()
  await drawAndExpectNotification(page, '東京芸術劇場 シアターイースト')

  await chooseVenue(page, '京セラ', '京セラドーム大阪')
  await expect(page.getByText('抽選対象 34,522席')).toBeVisible()
  await drawAndExpectNotification(page, '京セラドーム大阪')

  await page.getByRole('button', { name: '自分で作る' }).click()
  await page.getByLabel(/会場名/).fill('マイ会場')
  await page.getByLabel('最初の列').fill('A')
  await page.getByLabel('最後の列').fill('C')
  await page.getByLabel('最初の座席番号').fill('1')
  await page.getByLabel('最後の座席番号').fill('5')
  await expect(page.getByText('15席', { exact: true })).toBeVisible()
  await drawAndExpectNotification(page, 'マイ会場')
  await expect(page.locator('.ticket-details').getByText('エリア')).toHaveCount(0)
})

test('抽選結果をXで共有し、投稿文とサイトURLをX Web Intentへ渡す', async ({ page, context }) => {
  await context.route('https://x.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>X intent stub</title>' }))
  await page.goto('/')
  await chooseVenue(page, '一橋大学一橋講堂', '一橋講堂')
  await drawAndExpectNotification(page, '一橋講堂')
  const seatArea = await page.locator('.ticket-details div').filter({ hasText: 'エリア' }).locator('dd').textContent()
  const seatRow = await page.locator('.ticket-details .seat-value dd').first().textContent()
  const seatNumber = await page.locator('.ticket-details .seat-value dd').last().textContent()

  const share = page.getByRole('button', { name: 'Xで共有する' })
  await expect(share).toBeVisible()
  await expect(page.getByRole('button', { name: '結果を共有する' })).toHaveCount(0)
  await page.evaluate(() => {
    window.__osShareCalls = 0
    // OS標準共有メニューが使われないことを実ブラウザで検証する
    Object.defineProperty(navigator, 'share', { configurable: true, value: () => { window.__osShareCalls += 1; return Promise.resolve() } })
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => { window.__osShareCalls += 1; return true } })
  })
  const [popup] = await Promise.all([page.waitForEvent('popup'), share.click()])
  expect(await page.evaluate(() => window.__osShareCalls)).toBe(0)

  const intent = new URL(popup.url())
  expect(`${intent.origin}${intent.pathname}`).toBe('https://x.com/intent/tweet')
  expect(await popup.evaluate(() => ({ width: window.outerWidth, height: window.outerHeight }))).toEqual({ width: 600, height: 560 })
  expect(intent.searchParams.get('text')).toBe(`座席抽選シミュレーターの結果、一橋講堂の${seatArea} ${seatRow}${seatNumber}でした！`)
  expect(intent.searchParams.get('url')).toContain('?venue=hitotsubashi-hall-standard')
  expect(popup.url()).toContain(`text=${encodeURIComponent(String(intent.searchParams.get('text')))}`)
  await expect(page.locator('.share-status')).toHaveText('Xの投稿画面を開きました。投稿内容を確認してください。')
  await popup.close()
})

test('申込枚数を3枚にすると同一列の連番3席を範囲表示し、X共有文も範囲になる', async ({ page, context }) => {
  await context.route('https://x.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>X intent stub</title>' }))
  await page.goto('/')
  await chooseVenue(page, 'イイノ', 'イイノホール')
  const ticketCount = page.getByLabel('申込枚数')
  await expect(ticketCount).toHaveValue('1')
  await expect(page.getByText('500席から今日の1席を抽選します')).toBeVisible()
  await ticketCount.selectOption('3')
  await expect(page.getByText('500席から今日の3席を抽選します')).toBeVisible()

  await drawAndExpectNotification(page, 'イイノホール')
  await expect(page.locator('.ticket-details .seat-value')).toHaveCount(2)
  const seatRow = await page.locator('.ticket-details .seat-value dd').first().textContent()
  const seatNumbers = await page.locator('.ticket-details .seat-value dd').last().textContent()
  expect(seatNumbers).toMatch(/^\d+番〜\d+番$/)
  const [firstSeat, lastSeat] = seatNumbers!.match(/\d+/g)!.map(Number)
  expect(lastSeat - firstSeat).toBe(2)

  const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Xで共有する' }).click()])
  expect(new URL(popup.url()).searchParams.get('text')).toBe(`座席抽選シミュレーターの結果、イイノホールの${seatRow}${seatNumbers}でした！`)
  await popup.close()

  await ticketCount.selectOption('1')
  await expect(page.getByRole('heading', { name: '抽選結果のお知らせ' })).toHaveCount(0)
  await drawAndExpectNotification(page, 'イイノホール')
  await expect(page.locator('.ticket-details .seat-value dd').last()).toHaveText(/^\d+番$/)
})

test('reduced motionでも4秒程度待ち、スプライトの表示を固定する', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await chooseVenue(page, 'イイノ', 'イイノホール')
  const startedAt = Date.now()
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  const animation = page.getByTestId('lottery-animation')
  await expect(animation).toBeVisible()
  const readState = () => animation.evaluate((element) => ({
    spritePosition: getComputedStyle(element.querySelector('.lottery-sprite')!).backgroundPosition,
    glowAnimation: getComputedStyle(element.querySelector('.drawing-glow')!).animationName,
  }))
  const first = await readState()
  expect(first.glowAnimation).toBe('reduced-breathe')
  await page.waitForTimeout(1_500)
  const second = await readState()
  expect(second.spritePosition).toBe(first.spritePosition)
  await expect(page.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeVisible({ timeout: 8_000 })
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(3_800)
})

test('抽選中はスプライトのフレームが実際の時間経過で切り替わる', async ({ page }) => {
  await page.goto('/')
  await chooseVenue(page, 'イイノ', 'イイノホール')
  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false)
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  const sprite = page.getByTestId('lottery-sprite')
  await expect(sprite).toBeVisible()
  const readPosition = () => sprite.evaluate((el) => getComputedStyle(el).backgroundPosition)
  // 累積で0.2/0.7/1.3/2.0/3.0/3.7秒付近をサンプリング（4秒の抽選中に収まる範囲）
  const deltas = [200, 500, 600, 700, 1_000, 700]
  const samples: string[] = []
  for (const ms of deltas) {
    await page.waitForTimeout(ms)
    samples.push(await readPosition())
  }
  expect(new Set(samples).size).toBeGreaterThan(1)
  // 1.3秒以降（探るループ区間）でも複数フレームが観測されること
  const loopSamples = samples.slice(2)
  expect(new Set(loopSamples).size).toBeGreaterThan(1)
})

for (const viewport of [{ width: 360, height: 800 }, { width: 768, height: 900 }, { width: 1280, height: 900 }]) {
  test(`${viewport.width}pxで横スクロールなく地域階層を操作できる`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await openPicker(page)
    await page.getByLabel('エリア').selectOption({ label: '関東' })
    await page.getByLabel('都道府県').selectOption({ label: '東京都' })
    await expect(page.getByLabel('市区町村')).toBeEnabled()
    await expect(page.getByText(`絞り込み結果 ${tokyoVenueCount}件`)).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })

  test(`${viewport.width}pxで法務ページが横スクロールしない`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: 'プライバシーポリシー', level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}
