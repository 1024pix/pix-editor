import { render } from '@1024pix/ember-testing-library';
import TutorialPopin from 'pix-editor/components/pop-in/tutorial';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | pop-in/tutorial', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    const configService = this.owner.lookup('service:config');
    configService.tutorialLocaleToLanguageMap = { lang: 'Première langue' };
    store = this.owner.lookup('service:store');
  });

  test('save input should be disabled if mandatory field are empty', async function (assert) {
    // given
    const closeFn = () => {};
    const saveTutorialFn = () => {};

    const emptyTutorial = store.createRecord('tutorial', {});

    // when
    const screen = await render(
      <template>
        <TutorialPopin
          @close={{closeFn}}
          @tutorial={{emptyTutorial}}
          @saveTutorial={{saveTutorialFn}}
          @showModal={{true}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).hasAria('disabled', 'true');
  });

  test('save input should not be disabled if mandatory field are empty', async function (assert) {
    // given
    const closeFn = () => {};
    const saveTutorialFn = () => {};
    const filledTutorial = store.createRecord('tutorial', {
      title: 'title',
      language: 'fr',
      link: 'link',
      source: 'source',
      format: 'image',
      duration: '00:20:00',
    });

    // when
    const screen = await render(
      <template>
        <TutorialPopin
          @close={{closeFn}}
          @tutorial={{filledTutorial}}
          @saveTutorial={{saveTutorialFn}}
          @showModal={{true}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).doesNotHaveAttribute('aria-disabled');
  });
});
