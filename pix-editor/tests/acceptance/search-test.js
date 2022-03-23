import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockAuthService } from '../mock-auth';

module('Acceptance | Search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1', airtableId: 'REC_RECHERCHE1' });
    this.server.create('challenge', { id: 'challengeChallenge1', airtableId: 'REC_RECHERCHE2' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1', 'challengeChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawTubeIds: ['recTube1'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
  });

  test('search a challenge by rec id', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1?leftMaximized=false&view=production';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '  recChallenge1  ');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.equal(currentURL(), expectedUrl);
  });

  test('search a challenge by challenge id', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/challengeChallenge1?leftMaximized=false&view=production';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '  challengeChallenge1  ');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.equal(currentURL(), expectedUrl);
  });

  test('search a challenge by text', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1?leftMaximized=false&view=production';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', 'test');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.equal(currentURL(), expectedUrl);
  });
});
