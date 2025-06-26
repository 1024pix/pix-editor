import { clickByText, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import TutorialForm from 'pixeditor/components/form/tutorial';
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
    const store = this.owner.lookup('service:store');

    const tutorial = store.createRecord('tutorial', { id: 'rectTuto1', source: 'ma source' });

    const screen = await render(<template><TutorialForm @tutorial={{tutorial}} /></template>);

    await clickByText('Langue');
    assert.dom(await screen.findByRole('option', { name: 'Première langue' })).exists();
    assert.dom(await screen.findByRole('option', { name: 'Autre Langue' })).exists();
  });
});
