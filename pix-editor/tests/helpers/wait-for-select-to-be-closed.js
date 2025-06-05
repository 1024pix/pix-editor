import { waitUntil } from '@ember/test-helpers';

export async function waitForSelectToBeClosed(screen, options = { timeout: 5000 }) {
  await waitUntil(() => {
    return screen.queryAllByRole('option').length === 0;
  }, options);
}
