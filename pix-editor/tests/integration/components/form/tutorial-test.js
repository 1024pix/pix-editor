import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | tutorial-form', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders tutorial languages from config', async function(assert) {
    class ConfigService extends Service {
      get tutorialLocaleToLanguageMap() {
        return {
          lang: 'Première langue',
          otherLang: 'Autre Langue',
        };
      }
    }
    this.owner.register('service:config', ConfigService);

    this.set('tutorial', { license: false, format: false, level: false });

    const screen = await render(hbs`<Form::Tutorial @tutorial={{this.tutorial}} />`);

    await clickByName('Langue *');
    assert.ok(screen.getByRole('listbox', { option: 'Première Langue' }));
    assert.ok(screen.getByRole('listbox', { option: 'Autre Langue' }));
  });
});
