import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import BrokenUrlFilters from 'pixeditor/components/broken-urls/filters';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | broken-urls/filters', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store, brokenUrls;

  let onApplyFiltersClicked;

  hooks.beforeEach(async function () {
    onApplyFiltersClicked = sinon.stub();

    store = this.owner.lookup('service:store');

    const skill1 = store.createRecord('skill', {
      id: 'skillId1',
      name: '@skill1',
    });
    const skill2 = store.createRecord('skill', {
      id: 'skillId2',
      name: '@skill2',
    });

    const localizedChallenge1 = store.createRecord('localized-challenge', {
      id: 'localizedChallengeId1',
    });

    const brokenUrl1 = store.createRecord('broken-url', {
      url: 'https://tomate.com',
      statusCode: 404,
      errorMessage: null,
      skills: [skill1],
      localizedChallenges: [],
    });
    const brokenUrl2 = store.createRecord('broken-url', {
      url: 'https://carotte.com',
      statusCode: 401,
      errorMessage: null,
      skills: [skill2],
      localizedChallenges: [],
    });
    const brokenUrl3 = store.createRecord('broken-url', {
      url: 'https://mayonnaise.com',
      statusCode: 500,
      errorMessage: null,
      skills: [],
      localizedChallenges: [localizedChallenge1],
    });

    brokenUrls = [brokenUrl1, brokenUrl2, brokenUrl3];
  });

  test('it should filter by url', async function (assert) {
    // given
    await render(
      <template>
        <BrokenUrlFilters @brokenUrls={{brokenUrls}} @onApplyFiltersClicked={{onApplyFiltersClicked}} />
      </template>,
    );

    // when
    await fillByLabel('URL à remplir', 'tomate');

    // then
    assert.ok(onApplyFiltersClicked.calledOnceWith('url', 'tomate'));
  });

  test('it should filter by statusCode', async function (assert) {
    // given
    const screen = await render(
      <template>
        <BrokenUrlFilters @brokenUrls={{brokenUrls}} @onApplyFiltersClicked={{onApplyFiltersClicked}} />
      </template>,
    );

    // when
    await click(
      screen.getByRole('button', {
        name: "Filtrer par statut d'erreur",
      }),
    );
    await click(
      await screen.findByRole('option', {
        name: '404',
      }),
    );

    // then
    assert.ok(onApplyFiltersClicked.calledOnceWith('statusCode', '404'));
  });

  test('it should filter by skill', async function (assert) {
    // given
    const screen = await render(
      <template>
        <BrokenUrlFilters @brokenUrls={{brokenUrls}} @onApplyFiltersClicked={{onApplyFiltersClicked}} />
      </template>,
    );

    // when
    await click(screen.getByLabelText('Filtrer par acquis'));
    await click(
      await screen.findByRole('checkbox', {
        name: '@skill1',
      }),
    );

    // then
    assert.ok(onApplyFiltersClicked.calledOnceWith('skills', ['skillId1']));
  });

  test('it should filter by localized challenge', async function (assert) {
    // given
    const screen = await render(
      <template>
        <BrokenUrlFilters @brokenUrls={{brokenUrls}} @onApplyFiltersClicked={{onApplyFiltersClicked}} />
      </template>,
    );

    // when
    await click(screen.getByLabelText('Filtrer par épreuve'));
    await click(
      await screen.findByRole('checkbox', {
        name: 'localizedChallengeId1',
      }),
    );

    // then
    assert.ok(onApplyFiltersClicked.calledOnceWith('localizedChallenges', ['localizedChallengeId1']));
  });
});
