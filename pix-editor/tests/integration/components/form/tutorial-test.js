import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { render, clickByName } from '@1024pix/ember-testing-library';

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

    await clickByName('Langue');
    assert.ok(screen.getByRole('listbox', { option: 'Première Langue' }));
    assert.ok(screen.getByRole('listbox', { option: 'Autre Langue' }));
  });
});
