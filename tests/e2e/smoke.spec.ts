import { expect, test, type Page } from '@playwright/test'

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

const drawAndExpectNotification = async (page: Page, venueName: string, minimumDuration = 2_000) => {
  const startedAt = Date.now()
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('button', { name: '抽選中……' })).toBeDisabled()
  await expect(page.getByRole('heading', { name: '抽選結果のお知らせ' })).toBeVisible({ timeout: 8_000 })
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(minimumDuration)
  const result = page.locator('.result-card')
  await expect(result.getByText(venueName)).toBeVisible()
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

for (const viewport of [{ width: 360, height: 800 }, { width: 768, height: 900 }, { width: 1280, height: 900 }]) {
  test(`${viewport.width}pxで横スクロールなく地域階層を操作できる`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await openPicker(page)
    await page.getByLabel('エリア').selectOption({ label: '関東' })
    await page.getByLabel('都道府県').selectOption({ label: '東京都' })
    await expect(page.getByLabel('市区町村')).toBeEnabled()
    await expect(page.getByText('絞り込み結果 10件')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}
