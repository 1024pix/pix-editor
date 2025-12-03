import { clickByText, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | v2 | Localized-framework', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    window.localStorage.setItem('v2', 'true');

    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const prototype1 = this.server.create('challenge', {
      id: 'recChallenge1',
      airtableId: 'airtableId1',
      embedURL: 'https://mon-site.fr/my-link.html?lang=fr',
      genealogy: 'Prototype 1',
      version: 1,
    });
    this.server.create('localized-challenge', { id: 'recChallenge1', challengeId: 'recChallenge1', locale: 'fr' });
    this.server.create('localized-challenge', {
      id: 'recChallenge1NL',
      challengeId: 'recChallenge1',
      locale: 'nl',
      defaultEmbedURL: 'https://mon-site.fr/my-link.html?lang=nl',
    });

    const prototype2 = this.server.create('challenge', {
      id: 'recChallenge2',
      airtableId: 'airtableId2',
      embedURL: 'https://mon-site.fr/my-link.html?lang=fr',
      genealogy: 'Prototype 1',
      version: 1,
    });
    this.server.create('localized-challenge', { id: 'recChallenge2', challengeId: 'recChallenge2', locale: 'fr' });
    this.server.create('localized-challenge', {
      id: 'recChallenge2NL',
      challengeId: 'recChallenge2',
      locale: 'nl',
      defaultEmbedURL: 'https://mon-site.fr/my-link.html?lang=nl',
    });

    const prototype3 = this.server.create('challenge', {
      id: 'recChallenge3',
      airtableId: 'airtableId3',
      embedURL: 'https://mon-site.fr/my-link.html?lang=fr',
      genealogy: 'Prototype 1',
      version: 1,
    });
    this.server.create('localized-challenge', { id: 'recChallenge3', challengeId: 'recChallenge3', locale: 'fr' });
    this.server.create('localized-challenge', {
      id: 'recChallenge3NL',
      challengeId: 'recChallenge3',
      locale: 'nl',
      defaultEmbedURL: 'https://mon-site.fr/my-link.html?lang=nl',
    });

    const skill1 = this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'], level: 1 });
    const skill2 = this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge2'], level: 2 });
    const skill3 = this.server.create('skill', { id: 'recSkill3', challengeIds: ['recChallenge3'], level: 3 });

    const tube = this.server.create('tube', {
      id: 'recTube1',
      rawSkillIds: ['recSkill1', 'recSkill2', 'recSkill3'],
      name: '@tubeName',
    });
    const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    const competence = this.server.create('competence', {
      id: 'competence1-1',
      pixId: 'pixId-competence1.1',
      rawThemeIds: ['recTheme1'],
      rawTubeIds: ['recTube1'],
    });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['competence1-1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });

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
                  id: skill1.id,
                  name: skill1.name,
                  prototypeId: prototype1.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 1,
                },
                {
                  id: skill2.id,
                  name: skill2.name,
                  prototypeId: prototype2.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 1,
                },
                {
                  id: skill3.id,
                  name: skill3.name,
                  prototypeId: prototype3.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 1,
                },
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
      id: `${competence.pixId}:challenges-production:nl`,
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
                  id: skill1.id,
                  name: skill1.name,
                  prototypeId: prototype1.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 1,
                },
                {
                  id: skill2.id,
                  name: skill2.name,
                  prototypeId: prototype2.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 1,
                },
                {
                  id: skill3.id,
                  name: skill3.name,
                  prototypeId: prototype3.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 1,
                },
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

    return authenticateSession();
  });

  test('should navigate to localized framework editor', async function (assert) {
    // when
    const screen = await visit('/v2/competences/competence1-1/challenges-production?locale=nl');
    await click(await screen.findByRole('link', { name: 'Cadre de traduction' }));

    // then
    assert.strictEqual(currentURL(), '/v2/competences/competence1-1/localized-framework?locale=nl');
  });

  test('it should create localized framework tubes', async function (assert) {
    // given
    const screen = await visit('/v2/competences/competence1-1/localized-framework?locale=nl');

    const localizedFrameworkTubesBeforeSave = await store.peekAll('localized-framework-tube');
    assert.strictEqual(localizedFrameworkTubesBeforeSave.length, 0);

    await fillIn(screen.getByLabelText('Modifier le niveau max du tube @tubeName'), 5);
    await clickByText('Enregistrer');

    const localizedFrameworkTubes = await store.peekAll('localized-framework-tube');
    const createdLocalizedFrameworkTube = localizedFrameworkTubes[0];

    assert.strictEqual(localizedFrameworkTubes.length, 1);
    assert.strictEqual(createdLocalizedFrameworkTube.maxLevel, 5);
    assert.strictEqual(createdLocalizedFrameworkTube.locale, 'nl');
    assert.strictEqual(createdLocalizedFrameworkTube.tubeId, 'recTube1');
    assert.strictEqual(currentURL(), '/v2/competences/competence1-1/challenges-production?locale=nl');
  });

  test('it should update localized framework tubes', async function (assert) {
    // given
    this.server.create('localized-framework-tube', { id: 'lft-1', maxLevel: 2, tubeId: 'recTube1', locale: 'nl' });
    const screen = await visit('/v2/competences/competence1-1/localized-framework?locale=nl');

    await fillIn(screen.getByLabelText('Modifier le niveau max du tube @tubeName'), 5);
    await clickByText('Enregistrer');

    const localizedFrameworkTube = await store.peekRecord('localized-framework-tube', 'lft-1');

    assert.strictEqual(localizedFrameworkTube.maxLevel, 5);
    assert.strictEqual(currentURL(), '/v2/competences/competence1-1/challenges-production?locale=nl');
  });

  test('it should redirect to challenges-production when user choose source language', async function (assert) {
    // given
    this.server.create('localized-framework-tube', { id: 'lft-1', maxLevel: 2, tubeId: 'recTube1', locale: 'nl' });
    const screen = await visit('/v2/competences/competence1-1/localized-framework?locale=nl');

    await click(screen.getByRole('button', { name: 'Choix de la langue' }));
    await clickByText('Langue source');

    assert.strictEqual(currentURL(), '/v2/competences/competence1-1/challenges-production');
  });

  test('user can exit without saving modifications', async function (assert) {
    // given
    this.server.create('localized-framework-tube', { id: 'lft-1', maxLevel: 2, tubeId: 'recTube1', locale: 'nl' });
    const screen = await visit('/v2/competences/competence1-1/localized-framework?locale=nl');

    await fillIn(screen.getByLabelText('Modifier le niveau max du tube @tubeName'), 5);
    await click(screen.getByRole('button', { name: 'Annuler' }));

    const localizedFrameworkTube = await store.peekRecord('localized-framework-tube', 'lft-1');

    assert.strictEqual(localizedFrameworkTube.maxLevel, 2);
    assert.strictEqual(currentURL(), '/v2/competences/competence1-1/challenges-production?locale=nl');
  });

  test('it should redirect to overview V1 when user click on versionToggle', async function (assert) {
    // given
    this.server.create('localized-framework-tube', { id: 'lft-1', maxLevel: 2, tubeId: 'recTube1', locale: 'nl' });
    const screen = await visit('/v2/competences/competence1-1/localized-framework?locale=nl');

    await fillIn(screen.getByLabelText('Modifier le niveau max du tube @tubeName'), 5);

    await clickByText('V1');

    assert.strictEqual(currentURL(), '/competence/competence1-1/prototypes?languageFilter=nl&view=production');
  });
});
