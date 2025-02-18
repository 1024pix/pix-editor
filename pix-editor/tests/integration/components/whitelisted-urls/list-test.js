import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | whitelisted-urls/list', function(hooks) {
  setupIntlRenderingTest(hooks);
  let store, whitelistedUrl1;
  let onApplyFiltersClickedStub, onClearFiltersClickedStub;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
    whitelistedUrl1 = store.createRecord('whitelisted-url', {
      id: '1',
      url: 'https://foo.com',
      creatorName: 'Laura le chocolat',
      latestUpdatorName: 'Iris l\'anis',
      relatedSkillNames: '',
      checkType: 'exact_match',
      comment: 'Un commentaire sur Laura',
      createdAt: new Date('2020-01-01T09:00:00Z'),
      updatedAt: new Date('2021-01-01T09:00:00Z'),
    });
    onApplyFiltersClickedStub = sinon.stub();
    onClearFiltersClickedStub = sinon.stub();
  });

  test('it should display list of whitelisted urls passed in params and initialize filter inputs', async function(assert) {
    // given
    this.whitelistedUrls = [whitelistedUrl1];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;

    // when
    const screen = await render(hbs`
      <WhitelistedUrls::List
        @whitelistedUrls={{this.whitelistedUrls}}
        @urlFilterValue={{this.urlFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @onApplyFiltersClicked={{this.onApplyFiltersClicked}}
        @onClearFiltersClicked={{this.onClearFiltersClicked}}
      />`);

    // then
    assert.strictEqual(screen.getAllByRole('row').length, 2);
    assert.strictEqual(screen.getByLabelText('URL').value, 'initialUrlValue');
    assert.strictEqual(screen.getByLabelText('Nom d\'acquis').value, 'initialNamesValue');
  });

  test('it should pass up typed url filter and keeping the previous names filter when applying', async function(assert) {
    // given
    this.whitelistedUrls = [];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;

    // when
    const screen = await render(hbs`
      <WhitelistedUrls::List
        @whitelistedUrls={{this.whitelistedUrls}}
        @urlFilterValue={{this.urlFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @onApplyFiltersClicked={{this.onApplyFiltersClicked}}
        @onClearFiltersClicked={{this.onClearFiltersClicked}}
      />`);
    await fillByLabel('URL', 'different url value');
    await clickByName('Filtrer');

    // then
    assert.strictEqual(screen.getByLabelText('Nom d\'acquis').value, 'initialNamesValue');
    assert.strictEqual(screen.getByLabelText('URL').value, 'different url value');
    sinon.assert.calledWithExactly(onApplyFiltersClickedStub, 'different url value', 'initialNamesValue');
  });

  test('it should pass up typed names filter and keeping the previous url filter when applying', async function(assert) {
    // given
    this.whitelistedUrls = [];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;

    // when
    const screen = await render(hbs`
      <WhitelistedUrls::List
        @whitelistedUrls={{this.whitelistedUrls}}
        @urlFilterValue={{this.urlFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @onApplyFiltersClicked={{this.onApplyFiltersClicked}}
        @onClearFiltersClicked={{this.onClearFiltersClicked}}
      />`);
    await fillByLabel('Nom d\'acquis', 'different names value');
    await clickByName('Filtrer');

    // then
    assert.strictEqual(screen.getByLabelText('Nom d\'acquis').value, 'different names value');
    assert.strictEqual(screen.getByLabelText('URL').value, 'initialUrlValue');
    sinon.assert.calledWithExactly(onApplyFiltersClickedStub, 'initialUrlValue', 'different names value');
  });

  test('it should pass up both typed names and url filters when applying', async function(assert) {
    // given
    this.whitelistedUrls = [];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;

    // when
    const screen = await render(hbs`
      <WhitelistedUrls::List
        @whitelistedUrls={{this.whitelistedUrls}}
        @urlFilterValue={{this.urlFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @onApplyFiltersClicked={{this.onApplyFiltersClicked}}
        @onClearFiltersClicked={{this.onClearFiltersClicked}}
      />`);
    await fillByLabel('Nom d\'acquis', 'different names value');
    await fillByLabel('URL', 'different url value');
    await clickByName('Filtrer');

    // then
    assert.strictEqual(screen.getByLabelText('Nom d\'acquis').value, 'different names value');
    assert.strictEqual(screen.getByLabelText('URL').value, 'different url value');
    sinon.assert.calledWithExactly(onApplyFiltersClickedStub, 'different url value', 'different names value');
  });

  test('it should call arg function when clearing filters', async function(assert) {
    // given
    this.whitelistedUrls = [];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;

    // when
    await render(hbs`
      <WhitelistedUrls::List
        @whitelistedUrls={{this.whitelistedUrls}}
        @urlFilterValue={{this.urlFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @onApplyFiltersClicked={{this.onApplyFiltersClicked}}
        @onClearFiltersClicked={{this.onClearFiltersClicked}}
      />`);
    await clickByName('Réinitialiser les filtres');

    // then
    assert.ok(onClearFiltersClickedStub.calledOnce);
  });

  test('it should pass delete item arg function to WhitelistedUrlsTable', async function(assert) {
    // given
    this.whitelistedUrls = [whitelistedUrl1];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;
    this.onDeleteItemClicked = sinon.stub();

    // when
    const screen = await render(hbs`
      <WhitelistedUrls::List
        @whitelistedUrls={{this.whitelistedUrls}}
        @urlFilterValue={{this.urlFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @namesFilterValue={{this.namesFilterValue}}
        @onApplyFiltersClicked={{this.onApplyFiltersClicked}}
        @onClearFiltersClicked={{this.onClearFiltersClicked}}
        @onDeleteItemClicked={{this.onDeleteItemClicked}}
      />`);
    await screen.getByRole('button', { name: 'Supprimer l\'URL de la whitelist' }).click();

    // then
    assert.ok(this.onDeleteItemClicked.calledOnce);
  });
});
