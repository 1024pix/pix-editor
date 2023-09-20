import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';

export function setupIntlRenderingTest(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'fr');
}
