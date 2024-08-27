import { click, currentURL, fillIn, find, visit, waitUntil } from '@ember/test-helpers';
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

    this.server.create('challenge', { id: 'recChallenge1', instruction: 'test', airtableId: 'REC_RECHERCHE1' });
    this.server.create('challenge', { id: 'challengeChallenge1', airtableId: 'REC_RECHERCHE2' });
    this.server.create('localized-challenge', { id: 'challengeChallenge1', challengeId: 'challengeChallenge1' });
    this.server.create('localized-challenge', { id: 'challengeLocalizedChallenge1', challengeId: 'challengeChallenge1' });
    this.server.create('localized-challenge', { id: 'recChallenge1', challengeId: 'recChallenge1' });
    this.server.create('skill', { id: 'recSkill1', name: '@skill1', challengeIds: ['recChallenge1', 'challengeChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'pixId recCompetence1.1',
      rawTubeIds: ['recTube1'],
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
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1';
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
    const expectedUrl = '/competence/recCompetence1.1/prototypes/challengeChallenge1';
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
    const expectedUrl = '/competence/recCompetence1.1/prototypes/challengeChallenge1/localized/challengeLocalizedChallenge1';
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
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1';
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
    const expectedUrl = '/competence/recCompetence1.1/skills/recSkill1';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '@skill1');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.strictEqual(currentURL(), expectedUrl);
  });
});
