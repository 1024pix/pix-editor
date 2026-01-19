import { clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Search', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const prototype = this.server.create('challenge', {
      id: 'recChallenge1',
      instruction: 'test',
      airtableId: 'recChallenge1',
    });
    this.server.create('challenge', {
      id: 'challengeChallenge1',
      airtableId: 'challengeChallenge1',
      locales: ['fr'],
    });
    this.server.create('localized-challenge', { id: 'challengeChallenge1', challengeId: 'challengeChallenge1' });
    this.server.create('localized-challenge', {
      id: 'challengeLocalizedChallenge1',
      challengeId: 'challengeChallenge1',
      locale: 'en',
    });
    this.server.create('challenge-locale', {
      locale: 'en',
      challengeId: 'challengeChallenge1',
      localizedChallengeId: 'challengeLocalizedChallenge1',
    });
    this.server.create('localized-challenge', { id: 'recChallenge1', challengeId: 'recChallenge1' });
    this.server.create('skill', {
      id: 'recSkill2',
      name: '@skill1',
      challengeIds: [],
      status: 'archivé',
      version: 2,
      pixId: 'recSkill2',
    });
    const skill = this.server.create('skill', {
      id: 'recSkill1',
      name: '@skill1',
      challengeIds: ['recChallenge1', 'challengeChallenge1'],
      challengesProductionIds: ['recChallenge1', 'challengeChallenge1'],
      pixId: 'recSkill1',
      version: 1,
    });
    const tube = this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill2', 'recSkill1'] });
    const competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'recCompetence1.1',
      rawTubeIds: ['recTube1'],
    });
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [
        {
          id: 'pas de thématique',
          name: "on m'a oublié :(",
          tubeOverviews: [
            {
              id: tube.id,
              name: tube.name,
              skillOverviews: [
                {
                  id: skill.id,
                  name: skill.name,
                  prototypeId: prototype.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 0,
                  validatedChallengesCount: 1,
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
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production:en`,
      thematicOverviews: [
        {
          id: 'pas de thématique',
          name: "on m'a oublié :(",
          tubeOverviews: [
            {
              id: tube.id,
              name: tube.name,
              skillOverviews: [
                {
                  id: skill.id,
                  name: skill.name,
                  prototypeId: prototype.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 0,
                  validatedChallengesCount: 1,
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
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('search a challenge', async function (assert) {
    // given
    this.server.create('search-result', {
      id: 'recChallenge1',
      title: 'Le challenge avec l’ID recChallenge1',
      type: 'challenge',
      status: 'validé',
      locale: 'fr',
      'is-primary': true,
    });
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', '  recChallenge1  ');
    await click(await screen.findByRole('option', { name: '🟢 Le challenge avec l’ID recChallenge1' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a localized challenge', async function (assert) {
    // given
    this.server.create('search-result', {
      id: 'challengeLocalizedChallenge1',
      title: 'The challenge with ID challengeLocalizedChallenge1',
      type: 'challenge',
      status: 'proposé',
      locale: 'en',
      'is-primary': false,
    });
    const expectedUrl =
      '/competence/recCompetence1.1/prototypes/challengeChallenge1/localized/challengeLocalizedChallenge1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', '  challengeLocalizedChallenge1  ');
    await click(await screen.findByRole('option', { name: '🔵 The challenge with ID challengeLocalizedChallenge1' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a skill', async function (assert) {
    // given
    this.server.create('search-result', {
      id: 'recSkill1',
      title: '@skill1',
      type: 'skill',
      status: 'actif',
      version: 1,
    });
    const expectedUrl = '/competence/recCompetence1.1/skills/recSkill1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', '@skill1');
    await click(await screen.findByRole('option', { name: '🟢 @skill1 v1' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  module('when v2 is enabled', function (hooks) {
    hooks.beforeEach(function () {
      window.localStorage.setItem('v2', 'true');
    });

    test('search a challenge', async function (assert) {
      // given
      this.server.create('search-result', {
        id: 'recChallenge1',
        title: 'Le challenge avec test dans la consigne',
        type: 'challenge',
        status: 'périmé',
        locale: 'fr',
        'is-primary': true,
      });
      const expectedUrl =
        '/v2/competences/recCompetence1.1/challenges-production/skills/recSkill1/challenges/recChallenge1';

      // when
      const screen = await visit('/');
      await clickByText('Rechercher un acquis ou une épreuve...');
      await fillByLabel('Rechercher...', 'test');
      await click(await screen.findByRole('option', { name: '🔴 Le challenge avec test dans la consigne' }));

      // then
      assert.strictEqual(currentURL(), expectedUrl);
    });

    test('search a localized challenge', async function (assert) {
      // given
      this.server.create('search-result', {
        id: 'challengeLocalizedChallenge1',
        title: 'The challenge with ID challengeLocalizedChallenge1',
        type: 'challenge',
        status: 'validé',
        locale: 'en',
        'is-primary': false,
      });
      const expectedUrl =
        '/v2/competences/recCompetence1.1/challenges-production/skills/recSkill1/localized-challenges/challengeLocalizedChallenge1?locale=en';

      // when
      const screen = await visit('/');
      await clickByText('Rechercher un acquis ou une épreuve...');
      await fillByLabel('Rechercher...', '  challengeLocalizedChallenge1  ');
      await click(await screen.findByRole('option', { name: '🟢 The challenge with ID challengeLocalizedChallenge1' }));

      // then
      assert.strictEqual(currentURL(), expectedUrl);
    });
  });
});
