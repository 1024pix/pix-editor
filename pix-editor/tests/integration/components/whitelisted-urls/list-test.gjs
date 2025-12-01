import { clickByName, clickByText, fillByLabel, render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import sinon from 'sinon';
import WhitelistedUrlsList from 'pixeditor/components/whitelisted-urls/list';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | whitelisted-urls/list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store, whitelistedUrl1, whitelistedUrl2, hour1_create, hour1_update, hour2_create;
  let onApplyFiltersClickedStub, onClearFiltersClickedStub, onDeleteItemClickedStub, onEditStub;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    whitelistedUrl1 = store.createRecord('whitelisted-url', {
      id: '1',
      url: 'https://foo.com',
      creatorName: 'Laura le chocolat',
      latestUpdatorName: "Iris l'anis",
      relatedSkillNames: '',
      checkType: 'exact_match',
      comment: 'Un commentaire sur Laura',
      createdAt: new Date('2020-01-01T09:00:00Z'),
      updatedAt: new Date('2021-01-01T09:00:00Z'),
    });
    // FIXME Not great but better than a flaky test due to daytime savings hour change
    hour1_create = Intl.DateTimeFormat('fr', { hour: 'numeric' })
      .format(new Date('2020-01-01T09:00:00Z'))
      .replaceAll(/[A-Za-z\s]/g, '');
    hour1_update = Intl.DateTimeFormat('fr', { hour: 'numeric' })
      .format(new Date('2021-01-01T09:00:00Z'))
      .replaceAll(/[A-Za-z\s]/g, '');
    whitelistedUrl2 = store.createRecord('whitelisted-url', {
      id: '2',
      url: 'https://bar.com',
      creatorName: 'Fael le miel',
      latestUpdatorName: null,
      relatedSkillNames: '@fruit4,@legume5',
      checkType: 'starts_with',
      comment: 'Un commentaire sur Fael',
      createdAt: new Date('2021-12-01T12:00:00Z'),
      updatedAt: null,
    });
    hour2_create = Intl.DateTimeFormat('fr', { hour: 'numeric' })
      .format(new Date('2021-12-01T12:00:00Z'))
      .replaceAll(/[A-Za-z\s]/g, '');
    onApplyFiltersClickedStub = sinon.stub();
    onClearFiltersClickedStub = sinon.stub();
    onDeleteItemClickedStub = sinon.stub();
    onEditStub = sinon.stub();
  });

  test('it should display list of whitelisted urls passed in params and initialize filter inputs', async function (assert) {
    const self = this;

    // given
    this.whitelistedUrls = [whitelistedUrl1, whitelistedUrl2];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;
    this.onDeleteItemClicked = onDeleteItemClickedStub;
    this.goToEditWhitelistedUrl = onEditStub;

    // when
    const screen = await render(
      <template>
        <WhitelistedUrlsList
          @whitelistedUrls={{self.whitelistedUrls}}
          @urlFilterValue={{self.urlFilterValue}}
          @namesFilterValue={{self.namesFilterValue}}
          @onApplyFiltersClicked={{self.onApplyFiltersClicked}}
          @onClearFiltersClicked={{self.onClearFiltersClicked}}
          @onDeleteItemClicked={{self.onDeleteItemClicked}}
          @goToEditWhitelistedUrl={{self.goToEditWhitelistedUrl}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('columnheader', { name: 'Nom des acquis concernés' }));
    assert.ok(screen.getByRole('columnheader', { name: 'Type de comparaison' }));
    assert.ok(screen.getByRole('columnheader', { name: 'URL' }));
    assert.ok(screen.getByRole('columnheader', { name: 'Commentaire' }));
    assert.ok(screen.getByRole('columnheader', { name: 'Créée le' }));
    assert.ok(screen.getByRole('columnheader', { name: 'Modifiée le' }));
    assert.strictEqual(screen.getAllByRole('row').length, 3);
    assert.ok(screen.getByRole('cell', { name: 'https://foo.com' }), 'https://foo.com');
    assert.ok(screen.getByRole('cell', { name: 'Strictement égale à' }), 'Strictement égale à');
    assert.ok(screen.getByRole('cell', { name: 'Un commentaire sur Laura' }), 'Un commentaire sur Laura');
    assert.ok(
      screen.getByRole('cell', { name: `01/01/2020 à ${hour1_create}:00 par Laura le chocolat` }),
      `01/01/2020 à ${hour1_create}:00 par Laura le chocolat`,
    );
    assert.ok(
      screen.getByRole('cell', { name: `01/01/2021 à ${hour1_update}:00 par Iris l'anis` }),
      `01/01/2021 à ${hour1_update}:00 par Iris l'anis`,
    );
    assert.ok(screen.getByText('@fruit4 et 1 autre acquis'));
    assert.ok(screen.getByRole('cell', { name: 'https://bar.com' }), 'https://bar.com');
    assert.ok(screen.getByRole('cell', { name: 'Commence par' }), 'Commence par');
    assert.ok(screen.getByRole('cell', { name: 'Un commentaire sur Fael' }), 'Un commentaire sur Fael');
    assert.ok(
      screen.getByRole('cell', { name: `01/12/2021 à ${hour2_create}:00 par Fael le miel` }),
      `01/12/2021 à ${hour2_create}:00 par Fael le miel`,
    );
    assert.strictEqual(screen.getByLabelText('URL').value, 'initialUrlValue');
    assert.strictEqual(screen.getByLabelText("Nom d'acquis").value, 'initialNamesValue');
  });

  test('it should pass up typed url filter and keeping the previous names filter when applying', async function (assert) {
    const self = this;

    // given
    this.whitelistedUrls = [whitelistedUrl1, whitelistedUrl2];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;
    this.onDeleteItemClicked = onDeleteItemClickedStub;
    this.goToEditWhitelistedUrl = onEditStub;

    // when
    const screen = await render(
      <template>
        <WhitelistedUrlsList
          @whitelistedUrls={{self.whitelistedUrls}}
          @urlFilterValue={{self.urlFilterValue}}
          @namesFilterValue={{self.namesFilterValue}}
          @onApplyFiltersClicked={{self.onApplyFiltersClicked}}
          @onClearFiltersClicked={{self.onClearFiltersClicked}}
          @onDeleteItemClicked={{self.onDeleteItemClicked}}
          @goToEditWhitelistedUrl={{self.goToEditWhitelistedUrl}}
        />
      </template>,
    );
    await fillByLabel('URL', 'different url value');
    await clickByName('Filtrer');

    // then
    assert.strictEqual(screen.getByLabelText("Nom d'acquis").value, 'initialNamesValue');
    assert.strictEqual(screen.getByLabelText('URL').value, 'different url value');
    sinon.assert.calledWithExactly(onApplyFiltersClickedStub, 'different url value', 'initialNamesValue');
  });

  test('it should pass up typed names filter and keeping the previous url filter when applying', async function (assert) {
    const self = this;

    // given
    this.whitelistedUrls = [whitelistedUrl1, whitelistedUrl2];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;
    this.onDeleteItemClicked = onDeleteItemClickedStub;
    this.goToEditWhitelistedUrl = onEditStub;

    // when
    const screen = await render(
      <template>
        <WhitelistedUrlsList
          @whitelistedUrls={{self.whitelistedUrls}}
          @urlFilterValue={{self.urlFilterValue}}
          @namesFilterValue={{self.namesFilterValue}}
          @onApplyFiltersClicked={{self.onApplyFiltersClicked}}
          @onClearFiltersClicked={{self.onClearFiltersClicked}}
          @onDeleteItemClicked={{self.onDeleteItemClicked}}
          @goToEditWhitelistedUrl={{self.goToEditWhitelistedUrl}}
        />
      </template>,
    );
    await fillByLabel("Nom d'acquis", 'different names value');
    await clickByName('Filtrer');

    // then
    assert.strictEqual(screen.getByLabelText("Nom d'acquis").value, 'different names value');
    assert.strictEqual(screen.getByLabelText('URL').value, 'initialUrlValue');
    sinon.assert.calledWithExactly(onApplyFiltersClickedStub, 'initialUrlValue', 'different names value');
  });

  test('it should pass up both typed names and url filters when applying', async function (assert) {
    const self = this;

    // given
    this.whitelistedUrls = [whitelistedUrl1, whitelistedUrl2];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;
    this.onDeleteItemClicked = onDeleteItemClickedStub;
    this.goToEditWhitelistedUrl = onEditStub;

    // when
    const screen = await render(
      <template>
        <WhitelistedUrlsList
          @whitelistedUrls={{self.whitelistedUrls}}
          @urlFilterValue={{self.urlFilterValue}}
          @namesFilterValue={{self.namesFilterValue}}
          @onApplyFiltersClicked={{self.onApplyFiltersClicked}}
          @onClearFiltersClicked={{self.onClearFiltersClicked}}
          @onDeleteItemClicked={{self.onDeleteItemClicked}}
          @goToEditWhitelistedUrl={{self.goToEditWhitelistedUrl}}
        />
      </template>,
    );
    await fillByLabel("Nom d'acquis", 'different names value');
    await fillByLabel('URL', 'different url value');
    await clickByName('Filtrer');

    // then
    assert.strictEqual(screen.getByLabelText("Nom d'acquis").value, 'different names value');
    assert.strictEqual(screen.getByLabelText('URL').value, 'different url value');
    sinon.assert.calledWithExactly(onApplyFiltersClickedStub, 'different url value', 'different names value');
  });

  test('it should call arg function when clearing filters', async function (assert) {
    const self = this;

    // given
    this.whitelistedUrls = [whitelistedUrl1, whitelistedUrl2];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;
    this.onDeleteItemClicked = onDeleteItemClickedStub;
    this.goToEditWhitelistedUrl = onEditStub;

    // when
    await render(
      <template>
        <WhitelistedUrlsList
          @whitelistedUrls={{self.whitelistedUrls}}
          @urlFilterValue={{self.urlFilterValue}}
          @namesFilterValue={{self.namesFilterValue}}
          @onApplyFiltersClicked={{self.onApplyFiltersClicked}}
          @onClearFiltersClicked={{self.onClearFiltersClicked}}
          @onDeleteItemClicked={{self.onDeleteItemClicked}}
          @goToEditWhitelistedUrl={{self.goToEditWhitelistedUrl}}
        />
      </template>,
    );
    await clickByName('Réinitialiser les filtres');

    // then
    sinon.assert.calledOnce(onClearFiltersClickedStub);
    assert.ok(true);
  });

  test('it should call arg edit function when clicking on list item', async function (assert) {
    const self = this;

    // given
    this.whitelistedUrls = [whitelistedUrl1, whitelistedUrl2];
    this.urlFilterValue = 'initialUrlValue';
    this.namesFilterValue = 'initialNamesValue';
    this.onApplyFiltersClicked = onApplyFiltersClickedStub;
    this.onClearFiltersClicked = onClearFiltersClickedStub;
    this.onDeleteItemClicked = onDeleteItemClickedStub;
    this.goToEditWhitelistedUrl = onEditStub;

    // when
    await render(
      <template>
        <WhitelistedUrlsList
          @whitelistedUrls={{self.whitelistedUrls}}
          @urlFilterValue={{self.urlFilterValue}}
          @namesFilterValue={{self.namesFilterValue}}
          @onApplyFiltersClicked={{self.onApplyFiltersClicked}}
          @onClearFiltersClicked={{self.onClearFiltersClicked}}
          @onDeleteItemClicked={{self.onDeleteItemClicked}}
          @goToEditWhitelistedUrl={{self.goToEditWhitelistedUrl}}
        />
      </template>,
    );
    await clickByText('Strictement égale à');
    await clickByText('Un commentaire sur Laura');
    await clickByText('https://foo.com');
    await clickByText('@fruit4 et 1 autre acquis');

    // then
    assert.strictEqual(onEditStub.callCount, 4);
  });
});
