import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Broken URLs | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let localizedChallenge, skill, competence;

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const challenge = this.server.create('challenge', { id: 'recChallenge1', status: 'validé', version: 1 });
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
      name: '@monAcquisÀMoi1',
      challengeIds: [challenge.id],
      status: 'actif',
      level: 1,
      description: "Visible dans les détails de l'acquis",
    });
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
    const area = this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: [competence.id],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: [area.id] });

    this.server.create('broken-url', {
      id: 1,
      url: 'http://pipeau-la-grenouille.fr',
      errorMessage: 'Not found',
      statusCode: 404,
      skillIds: [skill.id],
    });
    this.server.create('broken-url', {
      id: 2,
      url: 'http://chocolat-fromage.org',
      errorMessage: 'Non',
      statusCode: 406,
      localizedChallengeIds: [localizedChallenge.id],
    });

    return authenticateSession();
  });

  test('should display tutorial broken urls when accessing list', async function (assert) {
    // when
    const screen = await visit('/broken-urls');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Liste des URLs cassées' })).exists();
    assert.strictEqual(screen.getAllByRole('row').length, 2);
    assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
    assert.dom(screen.queryByText('http://chocolat-fromage.org')).doesNotExist();
    assert.strictEqual(currentURL(), '/broken-urls/tutorials');
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
    const skillLink = screen.getByRole('link', { name: skill.name });
    await click(skillLink);

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
});
