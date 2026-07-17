import { expect, test } from '@playwright/test'

test('会場と自作座席から今日の1席を抽選できる', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '会場を選ぶ' }).click()
  await page.getByLabel('会場名・所在地を検索').fill('星見アリーナ')
  await expect(page.getByText('1件の会場')).toBeVisible()
  await page.getByRole('button', { name: '星見アリーナを選ぶ' }).click()
  await expect(page.getByText('星見アリーナ')).toBeVisible()

  await page.getByRole('button', { name: '座席を抽選する' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible()
  await expect(page.getByText('座席番号')).toBeVisible()
  await expect(page.getByRole('img', { name: /星見アリーナ.*簡易座席図/ })).toBeVisible()

  await page.getByRole('button', { name: 'もう一度抽選' }).click()
  await expect(page.getByRole('heading', { name: '抽選中……' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'あなたの席はこちら！' })).toBeVisible()

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
