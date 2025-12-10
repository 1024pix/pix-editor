import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ChallengesProduction from 'pix-editor/components/challenges-production/challenges-production';
import Challenge from 'pix-editor/models/challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenges-production | challenges-production', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    const skillInStore = store.createRecord('skill', {
      id: 'skillAId',
      name: '@skillA1',
      version: 3,
    });
    const challengesInStore = [
      store.createRecord('challenge', {
        id: 'challengeDecliValidee1',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        alternativeVersion: 1,
        instruction:
          'Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, Une consigne super maxi longue, ',
        updatedAt: new Date('2020-01-01'),
        author: 'MOI',
        status: Challenge.STATUSES.VALIDE,
        locales: ['fr', 'en'],
        preview: 'api/urlto/challengeDecliValidee1',
      }),
      store.createRecord('challenge', {
        id: 'challengeDecliArchivee2',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        alternativeVersion: 2,
        instruction: 'consigne challengeDecliArchivee2',
        updatedAt: new Date('2020-01-02'),
        author: 'BUBU',
        status: Challenge.STATUSES.ARCHIVE,
        locales: ['fr'],
        preview: 'api/urlto/challengeDecliArchivee2',
      }),
      store.createRecord('challenge', {
        id: 'challengeDecliProposee3',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        alternativeVersion: 3,
        instruction: 'consigne challengeDecliProposee3',
        updatedAt: new Date('2020-01-03'),
        author: 'BUBU',
        status: Challenge.STATUSES.PROPOSE,
        locales: ['fr'],
        preview: 'api/urlto/challengeDecliProposee3',
      }),
      store.createRecord('challenge', {
        id: 'challengeDecliPerimee4',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        alternativeVersion: 4,
        instruction: 'consigne challengeDecliPerimee4',
        updatedAt: new Date('2020-01-04'),
        author: 'BUBU',
        status: Challenge.STATUSES.PERIME,
        locales: ['fr'],
        preview: 'api/urlto/challengeDecliPerimee4',
      }),
      store.createRecord('challenge', {
        id: 'challengeDecliValidee5',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        alternativeVersion: 5,
        instruction: 'consigne challengeDecliValidee5',
        updatedAt: new Date('2020-01-05'),
        author: 'TOI',
        status: Challenge.STATUSES.VALIDE,
        locales: ['fr'],
        preview: 'api/urlto/challengeDecliValidee5',
      }),
      store.createRecord('challenge', {
        id: 'challengeProtoValidee',
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        alternativeVersion: null,
        instruction: 'consigne challengeProtoValidee',
        updatedAt: new Date('2019-12-25'),
        author: 'ELLE',
        status: Challenge.STATUSES.VALIDE,
        locales: ['fr'],
        preview: 'api/urlto/challengeProtoValidee',
      }),
    ];
    screen = await render(
      <template><ChallengesProduction @skill={{skillInStore}} @challenges={{challengesInStore}} /></template>,
    );
  });

  module('when displaying the list', function () {
    module('when box to display obsolete challenges not checked', function () {
      test('should display all but obsolete', async function (assert) {
        // then
        const validatedChallenges = screen.queryAllByText('validé');
        const obsoleteChallenges = screen.queryAllByText('périmé');
        const archivedChallenges = screen.queryAllByText('archivé');
        const proposedChallenges = screen.queryAllByText('proposé');

        assert.strictEqual(validatedChallenges.length, 3);
        assert.strictEqual(obsoleteChallenges.length, 0);
        assert.strictEqual(archivedChallenges.length, 1);
        assert.strictEqual(proposedChallenges.length, 1);
      });
    });
    module('when box to display obsolete challenges checked', function () {
      test('display all challenges', async function (assert) {
        // when
        await click(screen.getByLabelText('Afficher les épreuves périmées'));

        // then
        const validatedChallenges = screen.queryAllByText('validé');
        const obsoleteChallenges = screen.queryAllByText('périmé');
        const archivedChallenges = screen.queryAllByText('archivé');
        const proposedChallenges = screen.queryAllByText('proposé');

        assert.strictEqual(validatedChallenges.length, 3);
        assert.strictEqual(obsoleteChallenges.length, 1);
        assert.strictEqual(archivedChallenges.length, 1);
        assert.strictEqual(proposedChallenges.length, 1);
      });
    });
  });

  module('list item', function () {
    test('should display all expected info for a given challenge', async function (assert) {
      // then
      const validatedChallenges = screen.queryAllByRole('row');
      const prototype = validatedChallenges[1];
      assert.dom(prototype).includesText('Proto');
      assert.dom(prototype).includesText('consigne challengeProtoValidee');
      assert.dom(prototype).includesText('25/12/2019');
      assert.dom(prototype).includesText('ELLE');
      assert.dom(prototype).includesText('validé');
      assert.dom(prototype).includesText('🇫🇷 fr');
      assert.dom(prototype).includesText("Copier le lien de l'épreuve challengeProtoValidee");
    });

    module('copy preview url action', function () {
      test('copy preview url button should exist', async function (assert) {
        // then
        assert.dom(screen.getByRole('button', { name: "Copier le lien de l'épreuve challengeProtoValidee" })).exists();
      });
    });

    module('go to preview action', function () {
      test('should redirect to preview', async function (assert) {
        // when
        const a = screen.getByRole('link', { name: "Prévisualiser l'épreuve challengeProtoValidee" });

        // then
        assert.ok(a.href.endsWith('/api/urlto/challengeProtoValidee'));
        assert.strictEqual(a.target, '_blank');
      });
    });
  });
});
