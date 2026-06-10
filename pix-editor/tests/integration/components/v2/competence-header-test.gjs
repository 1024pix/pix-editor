import { fillByLabel, render, within } from '@1024pix/ember-testing-library';
import CompetenceHeader from 'pixeditor/components/v2/competence-header';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | v2/competence-header', function (hooks) {
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
    //  when
    screen = await render(<template><CompetenceHeader @competence={{competence}} /></template>);

    //  then

    assert.dom('h2').hasText('HACHE10 Lancer de hache');
    assert.dom(screen.getByRole('button', { name: 'Choix de la langue' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Epreuves' })).exists();
  });

  test('should filter locales options', async function (assert) {
    //  when
    screen = await render(<template><CompetenceHeader @competence={{competence}} /></template>);
    await screen.getByRole('button', { name: 'Choix de la langue' }).click();

    await fillByLabel('Rechercher', 'ouganda');
    const listOptions = await screen.findByRole('listbox');

    const filteredOptions = within(listOptions).queryAllByRole('option');

    //  then
    assert.strictEqual(filteredOptions.length, 1);
    assert.strictEqual(filteredOptions[0].innerText, 'Anglais (Ouganda)');
  });
});
