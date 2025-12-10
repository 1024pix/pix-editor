import { clickByText, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import TutorialForm from 'pix-editor/components/form/tutorial';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | tutorial-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders tutorial languages from config', async function (assert) {
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

  test('it shows a tutorial licenses dropdown with default empty option "Licence non renseignée"', async function (assert) {
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

    const tutorial = store.createRecord('tutorial', { id: 'rectTuto1', source: 'ma source', level: 1 });

    const screen = await render(<template><TutorialForm @tutorial={{tutorial}} /></template>);
    await clickByText('Licence');
    assert.dom(await screen.findByRole('option', { name: 'Licence non renseignée' })).hasAria('selected', 'true');
    assert.dom(screen.getByRole('option', { name: '(c)' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: 'Youtube' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: 'CC-BY-SA' })).hasAria('selected', 'false');
  });

  test('it shows a tutorial levels dropdown with default empty option "Niveau non renseigné"', async function (assert) {
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

    const tutorial = store.createRecord('tutorial', { id: 'rectTuto1', source: 'ma source', licence: 'Youtube' });

    const screen = await render(<template><TutorialForm @tutorial={{tutorial}} /></template>);
    await clickByText('Niveau');
    assert.dom(await screen.findByRole('option', { name: 'Niveau non renseigné' })).hasAria('selected', 'true');
    assert.dom(screen.getByRole('option', { name: '1' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '2' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '3' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '4' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '5' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '6' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '7' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '8' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '9' })).hasAria('selected', 'false');
    assert.dom(screen.getByRole('option', { name: '10' })).hasAria('selected', 'false');
  });
});
