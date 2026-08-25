import { test as setup } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

setup('autenticar', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'luizfernandogrimello@hotmail.com')
  await page.fill('input[type="password"]', '123456')
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard/, { timeout: 15000 })
  await page.context().storageState({ path: authFile })
})
