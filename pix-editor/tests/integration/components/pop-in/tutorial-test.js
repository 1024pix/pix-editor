import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | pop-in/tutorial', function(hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    const configService = this.owner.lookup('service:config');
    configService.tutorialLocaleToLanguageMap = {
      lang: 'Première langue',
    };
    store = this.owner.lookup('service:store');
  });

  test('save input should be disabled if mandatory field are empty', async function(assert) {
    //given
    this.set('close', () => {});
    this.set('saveTutorial', () => {});

    const emptyTutorial = store.createRecord('tutorial', {});
    this.set('tutorial', emptyTutorial);

    //when
    const screen = await render(hbs`<PopIn::Tutorial @close={{this.close}} @tutorial={{this.tutorial}} @saveTutorial={{this.saveTutorial}} @showModal={{true}} />`);

    //then
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).hasAria('disabled', 'true');
  });

  test('save input should not be disabled if mandatory field are empty', async function(assert) {
    //given
    this.set('close', () => {});
    this.set('saveTutorial', () => {});
    const filledTutorial = store.createRecord('tutorial', {
      title: 'title',
      language: 'fr',
      link: 'link',
      source: 'source',
      format: 'image',
      duration: '00:20:00',
    });
    this.set('tutorial', filledTutorial);

    //when
    const screen = await render(hbs`<PopIn::Tutorial @close={{this.close}} @tutorial={{this.tutorial}} @saveTutorial={{this.saveTutorial}} @showModal={{true}} />`);

    // then
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).hasAria('disabled', 'false');
  });
});
