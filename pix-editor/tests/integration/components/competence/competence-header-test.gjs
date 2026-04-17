import { render, fillByLabel, within } from '@1024pix/ember-testing-library';
import CompetenceHeader from 'pixeditor/components/competence/competence-header';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | competence/competence-header', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, competence;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    competence = store.createRecord('competence', {
      title: 'Lancer de hache',
      description: 'Wzzziiii',
      code: 'HACHE10',
    });
  });

  test('renders the language and the challenges menu', async function (assert) {
    // given
    const mockFn = () => {};
    //  when
    screen = await render(
      <template>
        <CompetenceHeader
          @competence={{competence}}
          @section="challenges"
          @languageFilter={{undefined}}
          @selectLanguageToFilter={{mockFn}}
          @view="production"
          @selectSection={{mockFn}}
        />
      </template>,
    );

    //  then

    assert.dom('h1').hasText('HACHE10 Lancer de hache');
    assert.dom(screen.getByRole('button', { name: 'Filtre par langue' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Epreuves' })).exists();
  });

  test('should filter locales options', async function (assert) {
    // given
    const mockFn = () => {};

    //  when
    screen = await render(
      <template>
        <CompetenceHeader
          @competence={{competence}}
          @section="challenges"
          @languageFilter={{undefined}}
          @selectLanguageToFilter={{mockFn}}
          @view="production"
          @selectSection={{mockFn}}
        />
      </template>,
    );
    await screen.getByRole('button', { name: 'Filtre par langue' }).click();

    await fillByLabel('Rechercher', 'ouganda');
    const listOptions = await screen.findByRole('listbox');

    const filteredOptions = within(listOptions).queryAllByRole('option');

    //  then
    assert.strictEqual(filteredOptions.length, 2);
    assert.strictEqual(filteredOptions[0].innerText, 'Filtre par langue');
    assert.strictEqual(filteredOptions[1].innerText, 'Anglais (Ouganda)');
  });
});
