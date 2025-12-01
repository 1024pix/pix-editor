import { clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Search', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const prototype = this.server.create('challenge', {
      id: 'recChallenge1',
      instruction: 'test',
      airtableId: 'REC_RECHERCHE1',
    });
    this.server.create('challenge', { id: 'challengeChallenge1', airtableId: 'REC_RECHERCHE2' });
    this.server.create('localized-challenge', { id: 'challengeChallenge1', challengeId: 'challengeChallenge1' });
    this.server.create('localized-challenge', {
      id: 'challengeLocalizedChallenge1',
      challengeId: 'challengeChallenge1',
    });
    this.server.create('localized-challenge', { id: 'recChallenge1', challengeId: 'recChallenge1' });
    this.server.create('skill', {
      id: 'recSkill2',
      name: '@skill1',
      challengeIds: [],
      status: 'archivé',
      version: 2,
      pixId: 'skill2',
    });
    const skill = this.server.create('skill', {
      id: 'recSkill1',
      name: '@skill1',
      challengeIds: ['recChallenge1', 'challengeChallenge1'],
      pixId: 'skill1',
      version: 1,
    });
    const tube = this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill2', 'recSkill1'] });
    const competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'pixId recCompetence1.1',
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
                  proposedChallengesCount: 1,
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
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('search a challenge by rec id', async function (assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', '  recChallenge1  ');
    await click(await screen.findByRole('option', { name: 'recChallenge1' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a challenge by challenge id', async function (assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/challengeChallenge1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', '  challengeChallenge1  ');
    await click(await screen.findByRole('option', { name: 'challengeChallenge1' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a challenge by localized challenge id', async function (assert) {
    // given
    const expectedUrl =
      '/competence/recCompetence1.1/prototypes/challengeChallenge1/localized/challengeLocalizedChallenge1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', '  challengeLocalizedChallenge1  ');
    await click(await screen.findByRole('option', { name: 'challengeLocalizedChallenge1' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a challenge by text', async function (assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', 'test');
    await click(await screen.findByRole('option', { name: 'test' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a skill by name - starting with @', async function (assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/skills/recSkill1?view=production';

    // when
    const screen = await visit('/');
    await clickByText('Rechercher un acquis ou une épreuve...');
    await fillByLabel('Rechercher...', '@skill1');
    await click(await screen.findByRole('option', { name: '🟢 @skill1 v1' }));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });
});
