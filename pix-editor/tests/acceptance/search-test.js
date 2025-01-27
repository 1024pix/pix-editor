import { clickByText, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, find, waitUntil } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const prototype = this.server.create('challenge', { id: 'recChallenge1', instruction: 'test', airtableId: 'REC_RECHERCHE1' });
    this.server.create('challenge', { id: 'challengeChallenge1', airtableId: 'REC_RECHERCHE2' });
    this.server.create('localized-challenge', { id: 'challengeChallenge1', challengeId: 'challengeChallenge1' });
    this.server.create('localized-challenge', { id: 'challengeLocalizedChallenge1', challengeId: 'challengeChallenge1' });
    this.server.create('localized-challenge', { id: 'recChallenge1', challengeId: 'recChallenge1' });
    this.server.create('skill', { id: 'recSkill2', name: '@skill1', challengeIds: [], status: 'archivé', version: 2 });
    const skill = this.server.create('skill', { id: 'recSkill1', name: '@skill1', challengeIds: ['recChallenge1', 'challengeChallenge1'] });
    const tube = this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill2', 'recSkill1' ] });
    const competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'pixId recCompetence1.1',
      rawTubeIds: ['recTube1'],
    });
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [{
        id: 'pas de thématique',
        name: 'on m\'a oublié :(',
        tubeOverviews: [{
          id: tube.id,
          name: tube.name,
          skillOverviews: [{
            id: skill.id,
            name: skill.name,
            prototypeId: prototype.id,
            isPrototypeDeclinable: true,
            proposedChallengesCount: 1,
            validatedChallengesCount: 0,
          }, null, null, null, null, null, null],
        }],
      }],
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

  test('search a challenge by rec id', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1?view=production';

    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '  recChallenge1  ');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));
    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a challenge by challenge id', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/challengeChallenge1?view=production';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '  challengeChallenge1  ');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a challenge by localized challenge id', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/challengeChallenge1/localized/challengeLocalizedChallenge1?view=production';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '  challengeLocalizedChallenge1  ');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });

    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a challenge by text', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1?view=production';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', 'test');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });

  test('search a skill by name - starting with @', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/skills/recSkill1?view=production';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '@skill1');

    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await clickByText('@skill1 v1');

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });
});
