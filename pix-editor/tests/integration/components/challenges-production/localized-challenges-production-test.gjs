import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import LocalizedChallengesProduction from 'pixeditor/components/challenges-production/localized-challenges-production';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenges-production | localized-challenges-production', function(hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
    const skill = store.createRecord('skill', {
      id: 'skillAId',
      name: '@skillA1',
      version: 3,
    });

    // proto
    const challengeProtoValide = store.createRecord('challenge', {
      id: 'challengeProtoValide',
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      alternativeVersion: null,
      instruction: 'consigne challengeProtoValide',
      updatedAt: new Date('2019-12-25'),
      author: 'ELLE',
      status: Challenge.STATUSES.VALIDE,
      locales: ['fr'],
      preview: 'api/urlto/challengeProtoValide',
    });
    const localizedProtoValideFr = store.createRecord('localized-challenge', {
      id: challengeProtoValide.id,
      challenge: challengeProtoValide,
      locale: 'fr',
      status: null,
      instruction: 'consigne challengeProtoValidee',
    });
    const localizedProtoValideNl = store.createRecord('localized-challenge', {
      id: 'challengeProtoValideeNl',
      challenge: challengeProtoValide,
      locale: 'nl',
      status: LocalizedChallenge.STATUSES.PLAY,
      instruction: 'Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie.',
    });

    // trad en pause
    const challengeDecliArchivee = store.createRecord('challenge', {
      id: 'challengeDecliArchivee',
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      alternativeVersion: 1,
      instruction: 'consigne challengeDecliArchivee',
      updatedAt: new Date('2020-01-05'),
      author: 'LUI',
      status: Challenge.STATUSES.ARCHIVE,
      locales: ['fr'],
      preview: 'api/urlto/challengeDecliArchivee',
    });
    const localizedDecliArchiveeFr = store.createRecord('localized-challenge', {
      id: challengeDecliArchivee.id,
      challenge: challengeDecliArchivee,
      locale: 'fr',
      status: null,
      instruction: 'consigne challengeDecliArchivee',
    });
    const localizedDecliArchiveeNl = store.createRecord('localized-challenge', {
      id: 'challengeDecliArchiveeNl',
      challenge: challengeDecliArchivee,
      locale: 'nl',
      status: LocalizedChallenge.STATUSES.PAUSE,
      instruction: 'consigne NL challengeDecliArchivee',
    });

    // primary deja nl
    const challengeDecliNl = store.createRecord('challenge', {
      id: 'challengeDecliNl',
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      alternativeVersion: 2,
      instruction: 'consigne challengeDecliNl',
      updatedAt: new Date('2020-01-05'),
      author: 'EUX',
      status: Challenge.STATUSES.VALIDE,
      locales: ['nl'],
      preview: 'api/urlto/challengeDecliNl',
    });
    const localizedDecliNl = store.createRecord('localized-challenge', {
      id: challengeDecliNl.id,
      challenge: challengeDecliNl,
      locale: 'nl',
      status: null,
      instruction: 'consigne challengeDecliNl',
    });

    // localized pas nl
    const challengeDecliProposee = store.createRecord('challenge', {
      id: 'challengeDecliProposee',
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      alternativeVersion: 3,
      instruction: 'consigne challengeDecliProposee',
      updatedAt: new Date('2020-01-05'),
      author: 'LOTR',
      status: Challenge.STATUSES.PROPOSE,
      locales: ['fr'],
      preview: 'api/urlto/challengeDecliProposee',
    });
    const localizedDecliProposeeFr = store.createRecord('localized-challenge', {
      id: challengeDecliProposee.id,
      challenge: challengeDecliProposee,
      locale: 'fr',
      instruction: 'consigne challengeDecliProposee',
      status: null,
    });
    const localizedDecliProposeeEs = store.createRecord('localized-challenge', {
      id: 'challengeDecliProposeeEs',
      challenge: challengeDecliProposee,
      locale: 'es',
      status: LocalizedChallenge.STATUSES.PAUSE,
    });

    // primary périmé

    const challengeDecliObsolete = store.createRecord('challenge', {
      id: 'challengeDecliObsolete',
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      alternativeVersion: 4,
      instruction: 'consigne challengeDecliObsolete',
      updatedAt: new Date('2020-01-05'),
      author: 'TOI',
      status: Challenge.STATUSES.PERIME,
      locales: ['fr'],
      preview: 'api/urlto/challengeDecliObsolete',
    });
    const localizedDecliObsoleteFr = store.createRecord('localized-challenge', {
      id: challengeDecliObsolete.id,
      challenge: challengeDecliObsolete,
      locale: 'fr',
      instruction: 'consigne challengeDecliObsolete',
      status: null,
    });
    const localizedDecliObsoleteNl = store.createRecord('localized-challenge', {
      id: `${challengeDecliObsolete.id}-nl`,
      challenge: challengeDecliObsolete,
      locale: 'nl',
      instruction: 'consigne NL challengeDecliObsolete',
      status: LocalizedChallenge.STATUSES.PAUSE,
    });

    const challenges = [
      challengeProtoValide,
      challengeDecliArchivee,
      challengeDecliNl,
      challengeDecliProposee,
      challengeDecliObsolete,
    ];
    const localizedChallenges = [
      localizedProtoValideFr,
      localizedProtoValideNl,
      localizedDecliArchiveeFr,
      localizedDecliArchiveeNl,
      localizedDecliNl,
      localizedDecliProposeeFr,
      localizedDecliProposeeEs,
      localizedDecliObsoleteFr,
      localizedDecliObsoleteNl,
    ];
    const locale = 'nl';

    screen = await render(<template>
<LocalizedChallengesProduction
  @skill={{skill}}
  @challenges={{challenges}}
  @localizedChallenges={{localizedChallenges}}
  @locale={{locale}} />
</template>);
  });

  module('list item', function() {
    test('should display all expected info for a given challenge', async function(assert) {
      // then
      const validatedChallenges = screen.queryAllByRole('row');
      const translationLink = screen.getByLabelText('traduction de l\'épreuve de version Proto');
      const prototype = validatedChallenges[1];

      assert.dom(prototype).includesText('Proto');
      assert.dom(prototype).includesText('Een super maxi lange instructie');
      assert.dom(prototype).includesText('25/12/2019');
      assert.dom(prototype).includesText('ELLE');
      assert.dom(prototype).includesText('validé');
      assert.dom(prototype).includesText('En prod');
      assert.ok(translationLink.href.endsWith('/api/challenges/challengeProtoValide/translations/nl'));
    });

    test('should display appropriate translation statuses for each challenge', async function(assert) {
      // then
      const validatedChallenges = screen.queryAllByRole('row');

      const prototype = validatedChallenges[1];
      assert.dom(prototype).includesText('Een super maxi lange instructie');
      assert.dom(prototype).includesText('validé');
      assert.dom(prototype).includesText('En prod');

      const archivedAndPausedNl = validatedChallenges[2];
      assert.dom(archivedAndPausedNl).includesText('consigne NL challengeDecliArchivee');
      assert.dom(archivedAndPausedNl).includesText('archivé');
      assert.dom(archivedAndPausedNl).includesText('En pause');

      const primaryAlreadyNl = validatedChallenges[3];
      assert.dom(primaryAlreadyNl).includesText('consigne challengeDecliNl');
      assert.dom(primaryAlreadyNl).includesText('validé');
      assert.dom(primaryAlreadyNl).includesText('Source dans la langue');

      const notTranslated = validatedChallenges[4];
      assert.dom(notTranslated).includesText('consigne challengeDecliProposee');
      assert.dom(notTranslated).includesText('proposé');
      assert.dom(notTranslated).includesText('Pas traduit');
    });
  });

  module('when displaying the list', function() {
    module('when box to display obsolete challenges not checked', function() {
      test('should display all but obsolete', async function(assert) {
        // then
        const validatedChallenges = screen.queryAllByText('validé');
        const obsoleteChallenges = screen.queryAllByText('périmé');
        const archivedChallenges = screen.queryAllByText('archivé');
        const proposedChallenges = screen.queryAllByText('proposé');

        assert.strictEqual(validatedChallenges.length, 2);
        assert.strictEqual(archivedChallenges.length, 1);
        assert.strictEqual(proposedChallenges.length, 1);
        assert.strictEqual(obsoleteChallenges.length, 0);
      });
    });
    module('when box to display obsolete challenges checked', function() {
      test('display all challenges', async function(assert) {
        // when
        await click(screen.getByLabelText('Afficher les épreuves périmées'));

        // then
        const validatedChallenges = screen.queryAllByText('validé');
        const obsoleteChallenges = screen.queryAllByText('périmé');
        const archivedChallenges = screen.queryAllByText('archivé');
        const proposedChallenges = screen.queryAllByText('proposé');

        assert.strictEqual(validatedChallenges.length, 2);
        assert.strictEqual(obsoleteChallenges.length, 1);
        assert.strictEqual(archivedChallenges.length, 1);
        assert.strictEqual(proposedChallenges.length, 1);
      });
    });
  });
});
