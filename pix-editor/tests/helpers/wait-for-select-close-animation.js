import { waitUntil } from '@ember/test-helpers';

export async function waitForSelectCloseAnimation(screen, options = { timeout: 1000 }) {
  await waitUntil(() => {
    return screen.queryAllByRole('option').length === 0;
  }, options);
}
