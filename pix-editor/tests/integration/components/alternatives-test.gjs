import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import sinon from 'sinon';

import Alternatives from 'pix-editor/components/alternatives';

import { setupIntlRenderingTest } from '../../setup-intl-rendering';

module('Integration | Component | alternatives', function (hooks) {
  setupIntlRenderingTest(hooks);

  let newAlternativeStub, store, alternatives;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    alternatives = [
      store.createRecord('challenge', {
        id: 'recAlternativeId1',
        status: 'validé',
        instruction: 'ceci est une alternative validée',
        version: 2,
        genealogy: 'Décliné 1',
      }),
      store.createRecord('challenge', {
        id: 'recAlternativeId2',
        status: 'proposé',
        instruction: 'ceci est une alternative proposée',
        version: 2,
        genealogy: 'Décliné 1',
      }),
      store.createRecord('challenge', {
        id: 'recAlternativeId3',
        status: 'périmé',
        instruction: 'ceci est une alternative périmée',
        version: 2,
        genealogy: 'Décliné 1',
      }),
      store.createRecord('challenge', {
        id: 'recAlternativeId4',
        status: 'archivé',
        instruction: 'ceci est une alternative archivé',
        version: 2,
        genealogy: 'Décliné 4',
      }),
    ];

    const challenge = store.createRecord('challenge', {
      id: 'recChallengeId',
      version: 2,
      genealogy: 'Prototype 1',
    });
    store.createRecord('skill', { challenges: [challenge, ...alternatives] });

    newAlternativeStub = sinon.stub();

    this.challenge = challenge;
    this.newAlternative = newAlternativeStub;
  });

  test("displays challenge's alternatives", async function (assert) {
    const self = this;

    // when
    const screen = await render(
      <template>
        <Alternatives
          @challenge={{self.challenge}}
          @maximizeRight={{false}}
          @mayCreateAlternative={{false}}
          @newAlternative={{self.newAlternative}}
          @rightMaximized={{false}}
          @size="full"
        />
      </template>,
    );

    assert.dom(screen.queryByText('ceci est une alternative validée')).exists();
    assert.dom(screen.queryByText('ceci est une alternative proposée')).exists();
    assert.dom(screen.queryByText('ceci est une alternative périmée')).doesNotExist();

    assert.dom(screen.queryByRole('button', { name: 'Nouvelle déclinaison' })).doesNotExist();
  });

  test('displays obsolete alternatives when checked', async function (assert) {
    const self = this;

    // when
    const screen = await render(
      <template>
        <Alternatives
          @challenge={{self.challenge}}
          @maximizeRight={{false}}
          @mayCreateAlternative={{false}}
          @newAlternative={{self.newAlternative}}
          @rightMaximized={{false}}
          @size="full"
        />
      </template>,
    );

    await click(await screen.getByRole('checkbox', { name: 'Afficher les déclinaisons périmées' }));

    assert.dom(screen.queryByText('ceci est une alternative validée')).exists();
    assert.dom(screen.queryByText('ceci est une alternative proposée')).exists();
    assert.dom(await screen.findByText('ceci est une alternative périmée')).exists();
  });

  ['validé', 'proposé'].forEach((status) => {
    test(`alternative button exist for alternative status ${status}`, async function (assert) {
      const self = this;

      // when
      this.challenge = alternatives.find((challenge) => challenge.status === status);
      const screen = await render(
        <template>
          <Alternatives
            @challenge={{self.challenge}}
            @maximizeRight={{false}}
            @mayCreateAlternative={{true}}
            @newAlternative={{self.newAlternative}}
            @rightMaximized={{false}}
            @size="full"
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: 'Nouvelle déclinaison' }));
      sinon.assert.calledOnce(newAlternativeStub);
      assert.ok(true);
    });
  });
  ['périmé', 'archivé'].forEach((status) => {
    test(`alternative button does not exist for alternative status ${status}`, async function (assert) {
      const self = this;

      // when
      this.challenge = alternatives.find((challenge) => challenge.status === status);
      const screen = await render(
        <template>
          <Alternatives
            @challenge={{self.challenge}}
            @maximizeRight={{false}}
            @mayCreateAlternative={{true}}
            @newAlternative={{self.newAlternative}}
            @rightMaximized={{false}}
            @size="full"
          />
        </template>,
      );
      assert.dom(screen.queryByRole('button', { name: 'Nouvelle déclinaison' })).doesNotExist();
    });
  });
});
