import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest as emberSetupApplicationTest } from 'ember-qunit';

export function setupApplicationTest(hooks) {
  emberSetupApplicationTest(hooks);
  setupIntl(hooks, 'fr');
}
