const { test, expect } = require('@playwright/test');

test.describe('Épreuves', () => {

  test.use({ storageState: 'editor.storageState.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Pix Editor' })).toBeVisible({ timeout: 10000 });
  });

  test('accéder au détail d\'une épreuve', async function({ page }) {
    await page.getByRole('button', { name: '1. Information et données' }).click();
    await page.getByRole('link', { name: '1.1 Mener une recherche et une veille d’information' }).click();
    await page.getByRole('link', { name: '@Moteur1 2 NR' }).click({ timeout: 10000 });

    await expect(page.getByText('Citer le numéro d\'une des applications permettant d\'aller sur le web (navigateur web).')).toBeVisible();
  });
});
