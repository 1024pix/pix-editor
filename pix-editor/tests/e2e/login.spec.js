const { test, expect } = require('@playwright/test');

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('se connecter et se déconnecter', async function({ page }) {
    await expect(page).toHaveURL('/connexion');

    await test.step('utiliser une clé invalide', async () => {
      await page.getByRole('textbox', { name: 'Clé API' }).fill('invalid-key');
      await page.getByRole('textbox', { name: 'Clé API' }).press('Enter');

      await expect(page.getByText('La clé saisie n\'a pas pu être validée ou n\'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l\'équipe de développement.')).toBeVisible();
    });

    await test.step('se connecter en tant qu\'administrateur', async () => {
      await page.getByRole('textbox', { name: 'Clé API' }).fill('8d03a893-3967-4501-9dc4-e0aa6c6dc442');
      await page.getByRole('button', { name: 'Se connecter' }).click();

      await expect(page.getByRole('heading', { name: 'Pix Editor' })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/DEV\s+-\s+Version\s+\d+\.\d+\.\d+/)).toBeVisible();
    });

    await test.step('se déconnecter', async () => {
      const disconnectDialog = page.getByRole('dialog', { name: 'Déconnexion' });

      await page.getByRole('button', { name: 'Déconnexion' }).click();
      await expect(disconnectDialog).toBeVisible();

      await disconnectDialog.getByRole('button', { name: 'Non' }).click();
      await expect(disconnectDialog).not.toBeVisible();

      await page.getByRole('button', { name: 'Déconnexion' }).click();
      await expect(disconnectDialog).toBeVisible();

      await disconnectDialog.getByRole('button', { name: 'Oui' }).click();
      await expect(page).toHaveURL('/connexion');
    });

    await test.step('se connecter en tant qu\'éditeur', async () => {
      await page.getByRole('textbox', { name: 'Clé API' }).fill('adaf3eee-09dc-4f9a-a504-ff92e74c9d0f');
      await page.getByRole('button', { name: 'Se connecter' }).click();

      await expect(page.getByRole('heading', { name: 'Pix Editor' })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/EDI\s+-\s+Version\s+\d+\.\d+\.\d+/)).toBeVisible();
    });
  });
});
