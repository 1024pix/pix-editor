import { clickByText, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import LocalizedChallengesProduction from 'pix-editor/components/challenges-production/localized-challenges-production';
import Challenge from 'pix-editor/models/challenge';
import LocalizedChallenge from 'pix-editor/models/localized-challenge';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | challenges-production | localized-challenges-production', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen, store, skill, challengeLocalesNl, challengeLocalesFr, challengeLocalesEs, competence;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    skill = store.createRecord('skill', {
      id: 'skillAId',
      name: '@skillA1',
      version: 3,
    });

    competence = store.createRecord('competence', {
      id: 'competenceAId',
      code: '1.1',
      source: 'Pix',
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
      instruction:
        'Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie, Een super maxi lange instructie.',
    });
    const challengeLocaleProtoValideFr = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId1',
      locale: 'fr',
      localizedChallenge: localizedProtoValideFr,
      challenge: challengeProtoValide,
    });
    const challengeLocaleProtoValideeNl = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId2',
      locale: 'nl',
      localizedChallenge: localizedProtoValideNl,
      challenge: challengeProtoValide,
    });
    const challengeLocaleProtoValideeEs = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId21',
      locale: 'es',
      challenge: challengeProtoValide,
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
    const challengeLocaleDecliArchiveeFr = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId3',
      locale: 'fr',
      localizedChallenge: localizedDecliArchiveeFr,
      challenge: challengeDecliArchivee,
    });
    const challengeLocaleDecliArchiveeNl = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId4',
      locale: 'nl',
      localizedChallenge: localizedDecliArchiveeNl,
      challenge: challengeDecliArchivee,
    });
    const challengeLocaleDecliArchiveeEs = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId41',
      locale: 'es',
      challenge: challengeDecliArchivee,
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
    const challengeLocaleDecliNl = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId5',
      locale: 'nl',
      localizedChallenge: localizedDecliNl,
      challenge: challengeDecliNl,
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
    const challengeLocaleDecliProposeeFr = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId6',
      locale: 'fr',
      localizedChallenge: localizedDecliProposeeFr,
      challenge: challengeDecliProposee,
    });
    const challengeLocaleDecliProposeeEs = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId7',
      locale: 'es',
      localizedChallenge: localizedDecliProposeeEs,
      challenge: challengeDecliProposee,
    });
    const challengeLocaleDecliProposeeNl = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId71',
      locale: 'nl',
      challenge: challengeDecliProposee,
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
    const challengeLocaleDecliObsoleteFr = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId8',
      locale: 'fr',
      localizedChallenge: localizedDecliObsoleteFr,
      challenge: challengeDecliObsolete,
    });
    const challengeLocaleDecliObsoleteNl = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId9',
      locale: 'nl',
      localizedChallenge: localizedDecliObsoleteNl,
      challenge: challengeDecliObsolete,
    });
    const challengeLocaleDecliObsoleteEs = store.createRecord('challenge-locale', {
      id: 'challengeLocaleId91',
      locale: 'es',
      challenge: challengeDecliObsolete,
    });

    challengeLocalesNl = [
      challengeLocaleProtoValideeNl,
      challengeLocaleDecliArchiveeNl,
      challengeLocaleDecliNl,
      challengeLocaleDecliProposeeNl,
      challengeLocaleDecliObsoleteNl,
    ];

    challengeLocalesFr = [
      challengeLocaleProtoValideFr,
      challengeLocaleDecliArchiveeFr,
      challengeLocaleDecliProposeeFr,
      challengeLocaleDecliObsoleteFr,
    ];

    challengeLocalesEs = [
      challengeLocaleProtoValideeEs,
      challengeLocaleDecliArchiveeEs,
      challengeLocaleDecliProposeeEs,
      challengeLocaleDecliObsoleteEs,
    ];
  });

  module('list item', function (hooks) {
    hooks.beforeEach(async () => {
      screen = await render(
        <template>
          <LocalizedChallengesProduction
            @skill={{skill}}
            @challengeLocales={{challengeLocalesNl}}
            @competence={{competence}}
          />
        </template>,
      );
    });

    test('should display all expected info for a given challenge', async function (assert) {
      // then
      const validatedChallenges = screen.queryAllByRole('row');
      const prototype = validatedChallenges[1];
      assert.dom(prototype).includesText('Proto');
      assert.dom(prototype).includesText('Een super maxi lange instructie');
      assert.dom(prototype).includesText('25/12/2019');
      assert.dom(prototype).includesText('ELLE');
      assert.dom(prototype).includesText('validé');
      assert.dom(prototype).includesText('En prod');
    });
    module('it should display actions', function () {
      test('when have translation for current locale', async function (assert) {
        // when
        await clickByText("ouvrir option pour l'épreuve challengeProtoValide");

        // then
        assert.dom(screen.getByRole('list', { name: 'source' })).exists();
        assert.dom(screen.getByRole('list', { name: 'traduction' })).exists();
        const primaryPreview = screen.getByRole('link', { name: "Prévisualiser l'épreuve challengeProtoValide" });
        const localizedPreview = screen.getByRole('link', { name: "Prévisualiser l'épreuve challengeProtoValideeNl" });
        const localizedTranslationLink = screen.getByRole('link', { name: "traduction de l'épreuve de version 1" });
        assert.ok(primaryPreview.href.endsWith('api/urlto/challengeProtoValide'));
        assert.ok(localizedPreview.href.endsWith('api/urlto/challengeProtoValide?locale=nl'));
        assert.ok(
          localizedTranslationLink.href.endsWith(
            'api/challenges/challengeDecliArchivee/translations/nl/framework-name/Pix/area-code/1',
          ),
        );
        assert
          .dom(screen.getByRole('button', { name: "Copier le lien de l'épreuve challengeProtoValideeNl" }))
          .exists();
      });

      test('when primary is in current locale', async function (assert) {
        // when
        await clickByText("ouvrir option pour l'épreuve challengeDecliNl");

        // then
        assert.dom(screen.getByRole('list', { name: 'source' })).exists();
        assert.dom(screen.queryByRole('list', { name: 'traduction' })).doesNotExist();
      });

      test('when have not translation for current locale', async function (assert) {
        // when
        await clickByText("ouvrir option pour l'épreuve challengeDecliProposee");

        // then
        assert.dom(screen.getByRole('list', { name: 'source' })).exists();
        assert.dom(screen.queryByRole('list', { name: 'traduction' })).doesNotExist();
      });
    });

    test('should display appropriate translation statuses for each challenge', async function (assert) {
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

  module('when displaying the list', function () {
    test('it should display only challenge who has selected locale or fr', async function (assert) {
      // given

      // when
      screen = await render(
        <template>
          <LocalizedChallengesProduction
            @skill={{skill}}
            @challengeLocales={{challengeLocalesEs}}
            @competence={{competence}}
          />
        </template>,
      );

      // then
      const challengesList = screen.queryAllByRole('row');
      const challengeListWithoutThead = challengesList.slice(1);
      assert.strictEqual(challengeListWithoutThead.length, 3);
    });

    module('when locale is not in phrase', function () {
      test('when locale is not in phrase', async function (assert) {
        // given

        // when
        screen = await render(
          <template>
            <LocalizedChallengesProduction
              @skill={{skill}}
              @challengeLocales={{challengeLocalesFr}}
              @competence={{competence}}
            />
          </template>,
        );

        // then
        const phraseLinks = screen.queryAllByRole('link', { name: /traduction de l'épreuve de version/ });

        assert.strictEqual(phraseLinks.length, 0);
      });
    });

    module('when box to display obsolete challenges not checked', function () {
      test('should display all but obsolete', async function (assert) {
        // when
        screen = await render(
          <template>
            <LocalizedChallengesProduction
              @skill={{skill}}
              @challengeLocales={{challengeLocalesNl}}
              @competence={{competence}}
            />
          </template>,
        );

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
    module('when box to display obsolete challenges checked', function () {
      test('display all challenges', async function (assert) {
        // when
        screen = await render(
          <template>
            <LocalizedChallengesProduction
              @skill={{skill}}
              @challengeLocales={{challengeLocalesNl}}
              @competence={{competence}}
            />
          </template>,
        );

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
