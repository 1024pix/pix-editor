import { clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { waitForSelectToBeClosed } from 'pixeditor/tests/helpers/wait-for-select-to-be-closed';
import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | Modify-Localized-Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const prototype = this.server.create('challenge', { id: 'recChallenge1' });
    this.server.create('localizedChallenge', { id: 'recChallenge1', challengeId: 'recChallenge1', locale: 'fr' });
    this.server.create('localizedChallenge', {
      id: 'recChallenge1NL',
      challengeId: 'recChallenge1',
      locale: 'nl',
      geography: 'NL',
    });
    const skill = this.server.create('skill', { id: 'recSkill1', name: '@trululu2', challengeIds: ['recChallenge1'] });
    const tube = this.server.create('tube', { id: 'recTube1', name: '@trululu', rawSkillIds: ['recSkill1'] });
    const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    const competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      title: 'ma competence',
      pixId: 'pixId recCompetence1.1',
      rawThemeIds: ['recTheme1'],
      rawTubeIds: ['recTube1'],
    });
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [
        {
          id: thematic.id,
          name: thematic.name,
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

  test('should modify attributes in localized challenge', async function (assert) {
    // when
    const store = this.owner.lookup('service:store');

    const screen = await visit('/');
    await click(await screen.findByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Code ma competence' }));
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await clickByText('Version nl');

    assert.dom('[data-test-localized-challenge-urls-to-consult]').doesNotExist();

    await clickByText('Modifier');
    await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
    await fillByLabel(
      "URLs externes nécessaires à la résolution de l'épreuve",
      'https://mon-url.com\n mon-autre-url.com',
    );
    await clickByText('Géographie');
    await click(await screen.findByRole('option', { name: 'Japon' }));
    await waitForSelectToBeClosed(screen);

    // then
    const challenge = await store.peekRecord('localized-challenge', 'recChallenge1NL');

    assert.dom('[data-test-invalid-urls-to-consult]').hasText('URLs invalides : mon-autre-url.com');
    assert.deepEqual(challenge.urlsToConsult, ['https://mon-url.com']);
    assert.deepEqual(challenge.geography, 'JP');

    const saveButton = await screen.findByRole('button', { name: 'Enregistrer' });
    await click(saveButton);

    assert.dom('[data-test-invalid-urls-to-consult]').doesNotExist();
  });
});
