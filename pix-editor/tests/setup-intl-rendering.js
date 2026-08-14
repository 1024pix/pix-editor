import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import translationsForFr from 'virtual:ember-intl/translations/fr';

export function setupIntlRenderingTest(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'fr');

  hooks.beforeEach(function () {
    const intl = this.owner.lookup('service:intl');
    intl.addTranslations('fr', translationsForFr);
  });
}
