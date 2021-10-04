import { module, test } from 'qunit';
import { visit, click, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockAuthService } from '../../../mock-auth';

module('Acceptance | Controller | Get Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1', updatedAt: '2021-10-04T14:00:00Z' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
  });

  test('it should display the challenge', async function(assert) {
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell]')[0]);

    assert.dom('time').hasAttribute('datetime','2021-10-04T14:00:00.000Z');
  });
});
