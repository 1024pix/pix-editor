import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import MultiSelect from 'pixeditor/components/field/multi-select';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | field/multi-select', function (hooks) {
  setupIntlRenderingTest(hooks);

  const options = [
    { value: 'couleur', label: 'Couleur' },
    { value: 'courage', label: 'Courage' },
    { value: 'evolution', label: 'Évolution' },
  ];
  const texts = { placeholder: 'Choisir', searchLabel: 'Rechercher une option' };

  test('it should filter options without taking accents and case into account', async function (assert) {
    // given
    const screen = await render(
      <template>
        <MultiSelect @options={{options}} @texts={{texts}} @isSearchable={{true}}>
          <:label>Options</:label>
        </MultiSelect>
      </template>,
    );
    await clickByName('Options');

    // when
    await fillByLabel('Rechercher une option', 'EVOL');

    // then
    assert.dom(await screen.findByRole('checkbox', { name: 'Évolution' })).exists();
    assert.dom(screen.queryByRole('checkbox', { name: 'Couleur' })).doesNotExist();
    assert.dom(screen.queryByRole('checkbox', { name: 'Courage' })).doesNotExist();
  });

  test('it should display the default empty search message when nothing matches', async function (assert) {
    // given
    const screen = await render(
      <template>
        <MultiSelect @options={{options}} @texts={{texts}} @isSearchable={{true}}>
          <:label>Options</:label>
        </MultiSelect>
      </template>,
    );
    await clickByName('Options');

    // when
    await fillByLabel('Rechercher une option', 'introuvable');

    // then
    assert.dom(screen.getByText('Aucun résultat')).exists();
  });

  test('it should keep selected labels in the placeholder while searching', async function (assert) {
    // given
    const values = ['couleur'];
    const screen = await render(
      <template>
        <MultiSelect @options={{options}} @values={{values}} @texts={{texts}} @isSearchable={{true}}>
          <:label>Options</:label>
        </MultiSelect>
      </template>,
    );
    await clickByName('Options');

    // when
    await fillByLabel('Rechercher une option', 'evol');

    // then
    assert.dom(screen.getByRole('button', { name: 'Options' })).hasText('Couleur');
  });

  test('it should delegate the search when @onSearch is provided', async function (assert) {
    // given
    const onSearch = sinon.stub();
    const screen = await render(
      <template>
        <MultiSelect @options={{options}} @texts={{texts}} @isSearchable={{true}} @onSearch={{onSearch}}>
          <:label>Options</:label>
        </MultiSelect>
      </template>,
    );
    await clickByName('Options');

    // when
    await fillByLabel('Rechercher une option', 'evol');

    // then
    assert.ok(onSearch.calledWith('evol'));
    assert.dom(await screen.findByRole('checkbox', { name: 'Couleur' })).exists();
  });
});
