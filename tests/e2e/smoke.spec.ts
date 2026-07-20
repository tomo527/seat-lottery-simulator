import { expect, test, type Page } from '@playwright/test'

const openPicker = (page: Page) => page.getByRole('button', { name: /会場を選ぶ|会場を変更/ }).click()

const chooseVenue = async (page: Page, query: string, name: string) => {
  await openPicker(page)
  await page.getByLabel('会場名・所在地を検索').fill(query)
  await page.getByRole('button', { name: `${name}を選ぶ` }).click()
  await expect(page.getByText('座席データを読み込んでいます')).toBeVisible()
  await expect(page.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
  await expect(page.getByRole('button', { name: '会場を変更' })).toBeFocused()
}

const drawAndExpectTextResult = async (page: Page, venueName: string) => {
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible({ timeout: 8_000 })
  const result = page.locator('.result-card')
  await expect(result.getByText(venueName)).toBeVisible()
  await expect(result.getByText('列', { exact: true })).toBeVisible()
  await expect(result.getByText('座席番号', { exact: true })).toBeVisible()
  await expect(result.locator('svg, [data-presentation], .seat-grid, .seat-map-card')).toHaveCount(0)
  await expect(result.locator('a[href^="http"]')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await page.route('**/venue-db/venues/*.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    await route.continue()
  })
})

test('東京10会場を検索し、会場切替後も対象データだけで抽選できる', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await page.goto('/')
  await openPicker(page)
  await page.getByLabel('地域').selectOption({ label: '東京' })
  await expect(page.getByText('10件の会場')).toBeVisible()
  await expect(page.getByRole('list', { name: '会場の検索結果' }).getByRole('listitem')).toHaveCount(10)
  await page.getByLabel('会場名・所在地を検索').fill('ＩＩＮＯ　ＨＡＬＬ')
  await page.getByRole('button', { name: 'イイノホールを選ぶ' }).click()
  await expect(page.getByText('座席データを読み込んでいます')).toBeVisible()
  await expect(page.getByRole('button', { name: '座席を抽選する' })).toBeEnabled()
  await drawAndExpectTextResult(page, 'イイノホール')

  await chooseVenue(page, '豊島区', '東京芸術劇場 シアターイースト')
  await expect(page.getByText('抽選対象 272席')).toBeVisible()
  await drawAndExpectTextResult(page, '東京芸術劇場 シアターイースト')
  expect(consoleErrors).toEqual([])
})

test('大規模会場と自作座席を抽選できる', async ({ page }) => {
  await page.goto('/')
  await chooseVenue(page, '京セラ', '京セラドーム大阪')
  await expect(page.getByText('抽選対象 34,522席')).toBeVisible()
  await drawAndExpectTextResult(page, '京セラドーム大阪')

  await page.getByRole('button', { name: '自分で作る' }).click()
  await page.getByLabel(/会場名/).fill('マイ会場')
  await page.getByLabel('最初の列').fill('A')
  await page.getByLabel('最後の列').fill('C')
  await page.getByLabel('最初の座席番号').fill('1')
  await page.getByLabel('最後の座席番号').fill('5')
  await expect(page.getByText('15席', { exact: true })).toBeVisible()
  await drawAndExpectTextResult(page, 'マイ会場')
})

for (const viewport of [{ width: 360, height: 800 }, { width: 768, height: 900 }, { width: 1280, height: 900 }]) {
  test(`${viewport.width}pxで横スクロールなく会場を探せる`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await openPicker(page)
    await page.getByLabel('地域').selectOption({ label: '東京' })
    await expect(page.getByText('10件の会場')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  })
}
