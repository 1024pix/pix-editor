import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pop-in/tutorial', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const configService = this.owner.lookup('service:config');
    configService.tutorialLocaleToLanguageMap = {
      lang: 'Première langue',
    };
  });

  test('save input should be disabled if mandatory field are empty', async function(assert) {
    //given
    this.set('close', () => {});
    this.set('saveTutorial', () => {});
    this.set('tutorial', {
      title:'',
      language:'',
      link:'',
      source:'',
      license:'',
      format:'',
      duration:'',
      level:'',
      tags:[]
    });

    //when
    await render(hbs`<PopIn::Tutorial @close={{this.close}} @tutorial={{this.tutorial}} @saveTutorial={{this.saveTutorial}}/>`);

    //then
    assert.dom('[data-test-save-tutorial-button]').isDisabled();
  });

  test('save input should not be disabled if mandatory field are empty', async function(assert) {
    //given
    this.set('close', () => {});
    this.set('saveTutorial', () => {});
    this.set('tutorial', {
      title:'title',
      language:'fr-fr',
      link:'link',
      source:'source',
      license:'',
      format:'image',
      duration:'00:20:00',
      level:'',
      tags:[]
    });

    //when
    await render(hbs`<PopIn::Tutorial @close={{this.close}} @tutorial={{this.tutorial}} @saveTutorial={{this.saveTutorial}}/>`);

    //then
    assert.dom('[data-test-save-tutorial-button]').isNotDisabled();
  });
});
