import { chromium } from '@playwright/test';

// FIXME read from database?
const users = [
  { access: 'admin', apiKey: '8d03a893-3967-4501-9dc4-e0aa6c6dc442' },
  { access: 'editor', apiKey: 'adaf3eee-09dc-4f9a-a504-ff92e74c9d0f' },
  { access: 'readonly', apiKey: '3b234506-e31e-45eb-a56e-17f64f31ca1b' },
  { access: 'readpixonly', apiKey: '09ae36c4-11e1-4212-ae51-e5719d142f57' },
];

export default async function globalSetup(config) {
  const project = config.projects.find(({ name }) => name === 'chromium');
  const browser = await chromium.launch();

  try {
    // Limit parallel logins to avoid hitting Airtable's rate limit
    for (const user of users) {
      const context = await browser.newContext(project.use);

      try {
        const page = await context.newPage();
        await page.goto('/');
        await page.getByRole('textbox', { name: 'Clé API' }).fill(user.apiKey);
        await page.getByRole('button', { name: 'Se connecter' }).click();
        await page.waitForURL('/');

        await context.storageState({ path: `${user.access}.storageState.json` });
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
