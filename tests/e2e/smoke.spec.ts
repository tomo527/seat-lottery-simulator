import { expect, test } from '@playwright/test'

test('実在会場の精度別座席図と自作座席から抽選できる', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'あなたの今日の席運は？' })).toBeVisible()
  await expect(page.getByText(/星見アリーナ|キラメキホール|オーシャンドーム/)).toHaveCount(0)

  await page.getByRole('button', { name: '会場を選ぶ' }).click()
  await page.getByLabel('会場名・所在地を検索').fill('東京国際フォーラム')
  await expect(page.getByText('1件の会場')).toBeVisible()
  await page.getByRole('button', { name: '東京国際フォーラム ホールCを選ぶ' }).click()
  await expect(page.getByText(/1階席の一部/)).toBeVisible()
  await expect(page.getByText(/公式情報確認日/)).toBeVisible()
  await expect(page.getByRole('link', { name: '公式座席情報を確認' })).toHaveAttribute('target', '_blank')

  const startedAt = Date.now()
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible()
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(1_700)
  await expect(page.locator('[data-presentation="verified-section-map"]')).toBeVisible()
  await expect(page.getByText('座席番号')).toBeVisible()
  await expect(page.getByText(/実際の公演では座席構成が異なる可能性/)).toBeVisible()

  await page.getByRole('button', { name: '条件を変更' }).click()
  await page.getByRole('button', { name: '会場を変更' }).click()
  await page.getByLabel('会場名・所在地を検索').fill('京セラドーム大阪')
  await page.getByRole('button', { name: '京セラドーム大阪（通常野球開催時）を選ぶ' }).click()
  await expect(page.getByText(/コンサート等では一部の座席位置やアリーナ席が変わる/)).toBeVisible()
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible()
  await expect(page.locator('[data-presentation="seat-grid"]')).toBeVisible()
  await expect(page.getByText(/実際の位置関係や縮尺を表すものではありません/)).toBeVisible()

  await page.getByRole('button', { name: '自分で作る' }).click()
  await page.getByLabel('最初の列').fill('A')
  await page.getByLabel('最後の列').fill('A')
  await page.getByLabel('最初の座席番号').fill('1')
  await page.getByLabel('最後の座席番号').fill('2')
  await expect(page.getByText('2席から今日の1席を抽選します')).toBeVisible()
  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible()
  await expect(page.getByRole('figure', { name: '自作座席の簡易座席図' })).toBeVisible()
})

const responsiveCases = [
  { width: 360, venueId: 'kyocera-dome-osaka-stand-subset', venueName: '京セラドーム大阪（通常野球開催時）', presentation: 'seat-grid' },
  { width: 768, venueId: 'yokohama-arena-fixed-a-subset', venueName: '横浜アリーナ', presentation: 'verified-section-map' },
  { width: 1280, venueId: 'tokyo-international-forum-hall-c', venueName: '東京国際フォーラム ホールC', presentation: 'verified-section-map' },
]

for (const { width, venueId, venueName, presentation } of responsiveCases) {
  test(`${width}pxで横スクロールなく結果座席図を確認できる`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`/?venue=${venueId}`)
    await expect(page.getByText(venueName)).toBeVisible()
    await page.getByRole('button', { name: '座席を抽選する' }).click()
    await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible()
    await expect(page.locator(`[data-presentation="${presentation}"]`)).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    if (presentation === 'seat-grid') {
      const selected = await page.locator('.mini-seat.selected').boundingBox()
      const scroller = await page.locator('.seat-grid-scroll').boundingBox()
      expect(selected).not.toBeNull()
      expect(scroller).not.toBeNull()
      expect(selected!.x).toBeGreaterThanOrEqual(scroller!.x)
      expect(selected!.x + selected!.width).toBeLessThanOrEqual(scroller!.x + scroller!.width + 1)
    }
  })
}
