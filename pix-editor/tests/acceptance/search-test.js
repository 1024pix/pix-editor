import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    localStorage.setItem('pix-api-key', apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1', pixId: 'REC_RECHERCHE' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkillWorkbench', name: '@workbench', challengeIds: ['recChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('tube', { id: 'recTubeWorkbench', name: '@workbench', rawSkillIds: ['recSkillWorkbench'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawTubeIds: ['recTube1', 'recTubeWorkbench'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawTubeIds: ['recTube2'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
  });

  test('search a challenge by rec id', async function(assert) {
    // given
    const expectedUrl = '/competence/recCompetence1.1/prototypes/recChallenge1';
    // when
    await visit('/');
    await click(find('[data-test-sidebar-search] .ember-basic-dropdown-trigger'));
    await fillIn('[data-test-sidebar-search] input', '  recPixChallenge1  ');
    await waitUntil(function() {
      return find('[data-test-sidebar-search] li');
    }, { timeout: 1000 });
    await click(find('[data-test-sidebar-search] li'));

    // then
    assert.equal(currentURL(), expectedUrl);
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
    assert.equal(currentURL(), expectedUrl);
  });
});
