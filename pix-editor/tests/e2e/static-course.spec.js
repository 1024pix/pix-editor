const { test, expect } = require('@playwright/test');

test.describe('Tests statiques', () => {

  test.use({ storageState: 'editor.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Pix Editor' })).toBeVisible({ timeout: 15000 });
  });

  test('accéder au détail d\'un test statique', async function({ page }) {
    await page.getByRole('link', { name: 'Tests statiques' }).click();
    await page.getByRole('cell', { name: 'Static Course 1' }).click();

    await expect(page.getByRole('heading', { name: 'Static Course 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1. Informations' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2. Liste des épreuves' })).toBeVisible();
  });
});
