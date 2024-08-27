import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../setup-intl-rendering';

module('Integration | Component | alternatives', function(hooks) {
  setupIntlRenderingTest(hooks);

  let newAlternativeStub;

  hooks.beforeEach(function() {
    const alternatives = [
      EmberObject.create({
        id: 'recAlternativeId1',
        status: 'validé',
        instruction: 'ceci est une alternative validée',
        version: 2,
      }),
      EmberObject.create({
        id: 'recAlternativeId2',
        status: 'proposé',
        instruction: 'ceci est une alternative proposée',
        version: 3,
      }),
      EmberObject.create({
        id: 'recAlternativeId3',
        status: 'périmé',
        instruction: 'ceci est une alternative périmée',
        version: 4,
      }),
    ];

    const challenge = EmberObject.create({
      id: 'recChallengeId',
      alternatives,
      version: 1,
    });

    newAlternativeStub = sinon.stub();

    this.set('challenge', challenge);
    this.set('newAlternative', newAlternativeStub);
  });

  test('displays challenge\'s alternatives', async function(assert) {
    // when
    const screen = await render(hbs`
      <Alternatives
        @challenge={{this.challenge}}
        @maximizeRight={{false}}
        @mayCreateAlternative={{false}}
        @newAlternative={{this.newAlternative}}
        @rightMaximized={{false}}
        @size="full"
      />
    `);

    assert.dom(screen.queryByText('ceci est une alternative validée')).exists();
    assert.dom(screen.queryByText('ceci est une alternative proposée')).exists();
    assert.dom(screen.queryByText('ceci est une alternative périmée')).doesNotExist();

    assert.dom(screen.queryByRole('button', { name: 'Nouvelle déclinaison' })).doesNotExist();
  });

  test('display\'s obsolete alternatives when checked', async function(assert) {
    // when
    const screen = await render(hbs`
      <Alternatives
        @challenge={{this.challenge}}
        @maximizeRight={{false}}
        @mayCreateAlternative={{false}}
        @newAlternative={{this.newAlternative}}
        @rightMaximized={{false}}
        @size="full"
      />
    `);

    await click(screen.getByRole('checkbox', { name: 'Afficher les déclinaisons périmées' }));

    assert.dom(screen.queryByText('ceci est une alternative validée')).exists();
    assert.dom(screen.queryByText('ceci est une alternative proposée')).exists();
    assert.dom(screen.queryByText('ceci est une alternative périmée')).exists();
  });

  test('creates new alternative when allowed', async function(assert) {
    // when
    const screen = await render(hbs`
      <Alternatives
        @challenge={{this.challenge}}
        @maximizeRight={{false}}
        @mayCreateAlternative={{true}}
        @newAlternative={{this.newAlternative}}
        @rightMaximized={{false}}
        @size="full"
      />
    `);

    await click(screen.getByRole('button', { name: 'Nouvelle déclinaison' }));

    sinon.assert.calledOnce(newAlternativeStub);
    assert.ok(true);
  });
});
