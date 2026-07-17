import { expect, test, type Page } from '@playwright/test'

const chooseVenue = async (page: Page, query: string, name: string) => {
  const trigger = page.getByRole('button', { name: /会場を選ぶ|会場を変更/ })
  await trigger.click()
  await page.getByLabel('会場名・所在地を検索').fill(query)
  await page.getByRole('button', { name: `${name}を選ぶ` }).click()
  await expect(page.getByRole('button', { name: '会場を変更' })).toBeFocused()
}

const drawAndExpectTextResult = async (page: Page, venueName: string) => {
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible({ timeout: 4_000 })
  const result = page.locator('.result-card')
  await expect(result.getByText(venueName)).toBeVisible()
  await expect(result.getByText('列', { exact: true })).toBeVisible()
  await expect(result.getByText('座席番号', { exact: true })).toBeVisible()
  await expect(result.locator('svg')).toHaveCount(0)
  await expect(result.locator('[data-presentation], .seat-grid, .seat-map-card')).toHaveCount(0)
  await expect(result).not.toContainText(/公式資料|公式情報確認日|データ精度|実際の位置関係や縮尺/)
}

test('production会場の選択・テキスト抽選結果・再抽選・別会場を確認できる', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeVisible()
  await chooseVenue(page, '文楽', '国立文楽劇場')
  await expect(page.locator('a[href*="ntj.jac.go.jp"], a[href*="kyoceradome-osaka.jp"]')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText(/公式・|公式資料で|公式情報確認日|データ精度/)
  await drawAndExpectTextResult(page, '国立文楽劇場')

  await page.getByRole('button', { name: 'もう一度抽選' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible({ timeout: 4_000 })

  await chooseVenue(page, '大阪市西区', '京セラドーム大阪')
  await expect(page.getByText('抽選対象 34,522席', { exact: true })).toBeVisible()
  await drawAndExpectTextResult(page, '京セラドーム大阪')
  expect(consoleErrors).toEqual([])
})

test('自作座席はエリアを任意にして従来どおり抽選できる', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '自分で作る' }).click()
  await page.getByLabel(/会場名/).fill('マイ会場')
  await page.getByLabel('最初の列').fill('A')
  await page.getByLabel('最後の列').fill('C')
  await page.getByLabel('最初の座席番号').fill('1')
  await page.getByLabel('最後の座席番号').fill('5')
  await expect(page.getByText('15席', { exact: true })).toBeVisible()
  await drawAndExpectTextResult(page, 'マイ会場')
  await expect(page.locator('.result-card').getByText('エリア', { exact: true })).toHaveCount(0)
})

for (const viewport of [{ width: 360, height: 800 }, { width: 768, height: 900 }, { width: 1280, height: 900 }]) {
  test(`${viewport.width}pxで横スクロールなく主要操作を表示できる`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('button', { name: '会場を選ぶ' })).toBeVisible()
    if (viewport.width === 360) {
      await chooseVenue(page, '文楽', '国立文楽劇場')
      await drawAndExpectTextResult(page, '国立文楽劇場')
      await expect(page.getByRole('button', { name: 'もう一度抽選' })).toBeVisible()
      await expect(page.getByRole('button', { name: '条件を変更' })).toBeVisible()
      await expect(page.getByRole('button', { name: '結果を共有' })).toBeVisible()
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
  })
}
