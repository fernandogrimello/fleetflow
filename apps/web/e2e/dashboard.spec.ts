import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'luizfernandogrimello@hotmail.com')
  await page.fill('input[type="password"]', '123456')
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
})

test.describe('Painel de Frota', () => {
  test('deve exibir os veiculos da frota', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("Painel de Frota")')).toBeVisible()
    await expect(page.locator('text=Toyota Hilux').first()).toBeVisible({ timeout: 10000 })
  })

  test('deve filtrar veiculos por busca', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder*="Buscar"]', 'Hilux')
    await page.waitForTimeout(500)
    await expect(page.locator('text=Toyota Hilux').first()).toBeVisible()
    await expect(page.locator('text=Mercedes Sprinter')).not.toBeVisible()
  })

  test('deve navegar para detalhe do veiculo', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.locator('text=Toyota Hilux').first().click()
    await page.waitForURL(/equipment/, { timeout: 10000 })
    await expect(page.locator('text=QR Code')).toBeVisible({ timeout: 10000 })
  })

  test('deve navegar para o mapa da frota', async ({ page }) => {
    await page.click('text=Mapa da Frota')
    await expect(page).toHaveURL(/map/)
    await expect(page.locator('h1:has-text("Mapa da Frota")')).toBeVisible()
    await expect(page.locator('text=veiculos com localizacao')).toBeVisible({ timeout: 10000 })
  })

  test('deve navegar para clientes', async ({ page }) => {
    await page.click('text=Clientes')
    await expect(page).toHaveURL(/clients/)
    await expect(page.locator('text=Novo Cliente')).toBeVisible()
  })

  test('deve navegar para seguros', async ({ page }) => {
    await page.click('text=Seguros')
    await expect(page).toHaveURL(/insurance/)
    await expect(page.locator('text=Nova Apolice')).toBeVisible()
  })
})
