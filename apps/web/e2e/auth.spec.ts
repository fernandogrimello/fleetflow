import { test, expect } from '@playwright/test'

test.describe('Autenticacao', () => {
  test('deve redirecionar para login quando nao autenticado', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
    await context.close()
  })

  test('deve fazer login com credenciais validas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'luizfernandogrimello@hotmail.com')
    await page.fill('input[type="password"]', '123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/)
    await expect(page.locator('h1:has-text("Painel de Frota")')).toBeVisible()
  })

  test('deve rejeitar credenciais invalidas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@test.com')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/login/)
  })

  test('deve fazer logout', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'luizfernandogrimello@hotmail.com')
    await page.fill('input[type="password"]', '123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/)
    await page.click('text=Sair')
    await expect(page).toHaveURL(/login/)
  })
})
