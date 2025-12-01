import { clickByText, fillByLabel, render } from '@1024pix/ember-testing-library';
import SelectSearch from 'pixeditor/components/field/select-search';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | Field | select-search', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen;

  test('renders select search correctly with label and placeholder', async function (assert) {
    // given
    const resultList = [];
    const mockOnSelect = sinon.stub().resolves();
    const mockOnInput = sinon.stub().resolves();

    //  when
    screen = await render(
      <template>
        <SelectSearch
          @onSearch={{mockOnInput}}
          @onSelect={{mockOnSelect}}
          @options={{resultList}}
          @isLoading={{false}}
          @searchPlaceholder="Exemple: mon placeholder"
          @searchLabel="Rechercher un bidule"
        />
      </template>,
    );

    //  then
    assert.dom(screen.getByPlaceholderText('Exemple: mon placeholder')).exists();
    assert.dom(screen.queryByText('Rechercher un bidule')).exists();
  });

  test('shows "Recherche en cours" while results are being fetched after typing for something', async function (assert) {
    // given
    const resultList = [];
    const mockOnSelect = sinon.stub().resolves();
    const mockOnInput = sinon.stub().resolves();

    //  when
    screen = await render(
      <template>
        <SelectSearch
          @onSearch={{mockOnInput}}
          @onSelect={{mockOnSelect}}
          @options={{resultList}}
          @isLoading={{true}}
          @searchPlaceholder="Exemple: mon placeholder"
          @searchLabel="Rechercher un bidule"
        />
      </template>,
    );
    await fillByLabel('Rechercher un bidule', 'je tape quelque chose...');

    //  then
    assert.dom(screen.queryByText('Recherche en cours...')).exists();
  });

  test('shows "Aucun résultat" when no results returned after typing for something', async function (assert) {
    // given
    const resultList = [];
    const mockOnInput = sinon.stub().resolves();
    const mockOnSelect = sinon.stub().resolves();

    //  when
    screen = await render(
      <template>
        <SelectSearch
          @onSearch={{mockOnInput}}
          @onSelect={{mockOnSelect}}
          @options={{resultList}}
          @isLoading={{false}}
          @searchPlaceholder="Exemple: mon placeholder"
          @searchLabel="Rechercher un bidule"
        />
      </template>,
    );
    await fillByLabel('Rechercher un bidule', 'PISTACHE');

    //  then
    assert.dom(screen.queryByText('Pas de résultat')).exists();
    assert.ok(mockOnInput.calledWith('PISTACHE'));
  });

  test('shows some results after typing for something when there are some', async function (assert) {
    // given
    const resultList = [];
    const mockOnInput = sinon.stub().callsFake((typedSearch) => {
      resultList.push(...[`OUI ${typedSearch}`, `NON ${typedSearch}`]);
    });
    const mockOnSelect = sinon.stub().resolves();

    //  when
    screen = await render(
      <template>
        <SelectSearch
          @onSearch={{mockOnInput}}
          @onSelect={{mockOnSelect}}
          @options={{resultList}}
          @isLoading={{false}}
          @searchPlaceholder="Exemple: mon placeholder"
          @searchLabel="Rechercher un bidule"
        />
      </template>,
    );
    await fillByLabel('Rechercher un bidule', 'CHOCOLAT');

    //  then
    assert.dom(screen.queryByText('Pas de résultat')).doesNotExist();
    assert.ok(mockOnInput.calledWith('CHOCOLAT'));
    assert.dom(screen.queryByText('OUI CHOCOLAT')).exists();
    assert.dom(screen.queryByText('NON CHOCOLAT')).exists();
  });

  test('renders correctly yielded part when there are some results', async function (assert) {
    // given
    const resultList = [];
    const mockOnInput = sinon.stub().callsFake(() => {
      resultList.push(
        ...[
          { a: 'clé a 1', b: 'clé b 1' },
          { a: 'clé a 2', b: 'clé b 2' },
        ],
      );
    });
    const mockOnSelect = sinon.stub().resolves();

    //  when
    screen = await render(
      <template>
        <SelectSearch
          @onSearch={{mockOnInput}}
          @onSelect={{mockOnSelect}}
          @options={{resultList}}
          @isLoading={{false}}
          @searchPlaceholder="Exemple: mon placeholder"
          @searchLabel="Rechercher un bidule"
        >
          <:option as |resultItem|>
            {{resultItem.a}}
            --
            {{resultItem.b}}
          </:option>
        </SelectSearch>
      </template>,
    );
    await fillByLabel('Rechercher un bidule', 'osef');

    //  then
    assert.dom(screen.queryByText('Pas de résultat')).doesNotExist();
    assert.dom(screen.queryByText('clé a 1 -- clé b 1')).exists();
    assert.dom(screen.queryByText('clé a 2 -- clé b 2')).exists();
  });

  test('triggers slot when clicking on an item result', async function (assert) {
    // given
    const resultList = [];
    const mockOnInput = sinon.stub().callsFake((typedSearch) => {
      resultList.push(...[`OUI ${typedSearch}`, `NON ${typedSearch}`]);
    });
    const mockOnSelect = sinon.stub().resolves();

    //  when
    screen = await render(
      <template>
        <SelectSearch
          @onSearch={{mockOnInput}}
          @onSelect={{mockOnSelect}}
          @options={{resultList}}
          @isLoading={{false}}
          @searchPlaceholder="Exemple: mon placeholder"
          @searchLabel="Rechercher un bidule"
        />
      </template>,
    );
    await fillByLabel('Rechercher un bidule', 'CHOCOLAT');
    await clickByText('NON CHOCOLAT');

    //  then
    assert.ok(mockOnSelect.calledWith('NON CHOCOLAT'));
  });
});
