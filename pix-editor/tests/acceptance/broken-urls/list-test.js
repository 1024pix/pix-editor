import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Broken URLs | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let localizedChallenge, skill, skill2, competence, tutorial;

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const challenge = this.server.create('challenge', { id: 'recChallenge1', status: 'validé', version: 1 });
    const challenge2 = this.server.create('challenge', { id: 'recChallenge2', status: 'validé', version: 1 });
    this.server.create('localized-challenge', {
      id: challenge.id,
      challengeId: challenge.id,
      locale: 'fr',
      instruction: 'primary localized',
    });
    localizedChallenge = this.server.create('localized-challenge', {
      id: `${challenge.id}-nl`,
      challengeId: challenge.id,
      locale: 'nl',
      instruction: 'localized NL',
    });
    skill = this.server.create('skill', {
      id: 'skillId1',
      name: '@lancerDeCouteau',
      challengeIds: [challenge.id],
      status: 'actif',
      level: 1,
      description: "Visible dans les détails de l'acquis",
    });
    skill2 = this.server.create('skill', {
      id: 'skillId2',
      name: '@jongleAvecDesHaches',
      challengeIds: [challenge2.id],
      status: 'actif',
      level: 1,
      description: "Visible dans les détails de l'acquis",
    });
    tutorial = this.server.create('tutorial', { id: 'tutorialId3', title: 'Comment jongler avec des haches' });
    const tube = this.server.create('tube', { id: 'recTube1', name: '@tube', rawSkillIds: [skill.id] });
    const theme = this.server.create('theme', { id: 'recTheme1', rawTubeIds: [tube.id] });
    competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'recCompetence1.1',
      rawThemeIds: [theme.id],
      rawTubeIds: [tube.id],
    });
    this.server.create('competence-overview', {
      id: `${competence.id}:challenges-production`,
      thematicOverviews: [
        {
          id: theme.id,
          name: theme.name,
          tubeOverviews: [
            {
              id: tube.id,
              name: tube.name,
              skillOverviews: [
                {
                  id: skill.id,
                  name: skill.name,
                  prototypeId: challenge.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 0,
                },
                null,
                null,
                null,
                null,
                null,
                null,
              ],
            },
          ],
        },
      ],
    });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: [competence.id],
    });

    this.server.create('broken-url', {
      id: 1,
      url: 'http://pipeau-la-grenouille.fr',
      errorMessage: 'Not found',
      statusCode: 404,
      skillIds: [skill.id],
      tutorialIds: [tutorial.id],
      frameworks: ['recFramework1', 'recFramework2'],
    });
    this.server.create('broken-url', {
      id: 2,
      url: 'http://chocolat-fromage.org',
      errorMessage: 'Non',
      statusCode: 406,
      localizedChallengeIds: [localizedChallenge.id],
      frameworks: ['recFramework1'],
    });
    this.server.create('broken-url', {
      id: 3,
      url: 'http://cerise.com',
      errorMessage: 'Pas là',
      statusCode: 408,
      skillIds: [skill2.id],
      frameworks: ['recFramework1'],
    });

    return authenticateSession();
  });

  test('should display tutorial broken urls when accessing list', async function (assert) {
    // when
    const screen = await visit('/broken-urls/tutorials');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Liste des URLs cassées' })).exists();
    assert.strictEqual(screen.getAllByRole('row').length, 3);
    assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
    assert.dom(screen.getByText('http://cerise.com')).exists();
    assert.dom(screen.queryByText('http://chocolat-fromage.org')).doesNotExist();
  });

  test('should switch between tutorials and challenges pages', async function (assert) {
    // when
    const screen = await visit('/broken-urls/tutorials');
    await click(screen.getByRole('link', { name: 'Épreuves' }));

    // then
    assert.strictEqual(currentURL(), '/broken-urls/challenges');
  });

  test('should redirect to skill when clicking skill name', async function (assert) {
    // when
    const screen = await visit('/broken-urls/tutorials');
    const skillLink = screen.getAllByRole('link', { name: skill.name });
    await click(skillLink[0]);

    // then
    assert.strictEqual(currentURL(), `/competence/${competence.id}/skills/${skill.id}?view=production`);
  });

  test('should redirect to challenge when clicking challenge id', async function (assert) {
    // when
    const screen = await visit('/broken-urls/challenges');
    const challengeLink = screen.getByRole('link', { name: localizedChallenge.id });
    await click(challengeLink);

    // then
    assert.strictEqual(
      currentURL(),
      `/competence/${competence.id}/prototypes/${localizedChallenge.challengeId}/localized/${localizedChallenge.id}?view=production`,
    );
  });

  module('filters', function () {
    test('should filter list by url', async function (assert) {
      // when
      const screen = await visit('/broken-urls/challenges');
      await fillByLabel('URL à remplir', 'test');

      // then
      assert.dom(screen.queryByText('http://pipeau-la-grenouille.fr')).doesNotExist();
      assert.dom(screen.queryByText('http://chocolat-fromage.org')).doesNotExist();
    });

    test('should filter list by status code', async function (assert) {
      // when
      const screen = await visit('/broken-urls/challenges');
      await screen.getByRole('button', { name: "Filtrer par statut d'erreur" }).click();
      await screen.findByRole('listbox');
      await screen.getByRole('option', { name: '406' }).click();

      // then
      assert.dom(screen.getByText('http://chocolat-fromage.org')).exists();
      assert.dom(screen.queryByText('http://pipeau-la-grenouille.fr')).doesNotExist();
    });

    test('should filter list by tutorial', async function (assert) {
      // when
      const screen = await visit('/broken-urls/tutorials');
      await click(screen.getByRole('button', { name: 'Filtrer par tutoriel' }));
      await screen.findByRole('menu');
      await click(screen.getByRole('checkbox', { name: tutorial.title }));

      // then
      assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
      assert.dom(screen.queryByText('http://cerise.com')).doesNotExist();
    });

    test('should filter list by skill', async function (assert) {
      // when
      const screen = await visit('/broken-urls/tutorials');
      await click(screen.getByRole('button', { name: 'Filtrer par acquis' }));
      await screen.findByRole('menu');
      await click(screen.getByRole('checkbox', { name: skill.name }));

      // then
      assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
      assert.dom(screen.queryByText('http://cerise.com')).doesNotExist();
    });

    test('should filter list by framework', async function (assert) {
      // when
      const screen = await visit('/broken-urls/tutorials');
      await click(screen.getByRole('button', { name: 'Filtrer par référentiel' }));
      await screen.findByRole('menu');
      await click(screen.getByRole('checkbox', { name: 'recFramework2' }));

      // then
      assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
      assert.dom(screen.queryByText('http://chocolat-fromage.org')).doesNotExist();
      assert.dom(screen.queryByText('http://cerise.com')).doesNotExist();
    });
  });
});
