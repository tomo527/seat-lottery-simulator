import { expect, test } from '@playwright/test'

test('自作座席を作り、抽選してもう一度抽選できる', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('tab', { name: '自分で作る' }).click()
  await page.getByLabel('最初の列').fill('A')
  await page.getByLabel('最後の列').fill('A')
  await page.getByLabel('最初の座席番号').fill('1')
  await page.getByLabel('最後の座席番号').fill('2')
  await expect(page.getByText('2席', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /座席を抽選する/ }).click()
  await expect(page.getByRole('heading', { name: 'チケットをご用意できました！' })).toBeVisible()
  await expect(page.getByText('これはシミュレーションです')).toBeVisible()
  await page.getByRole('button', { name: 'もう一度抽選' }).click()
  await expect(page.getByRole('heading', { name: 'チケットをご用意できました！' })).toBeVisible()
})
