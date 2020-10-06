import { module, test } from 'qunit';
import { visit, findAll, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Modify-Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    localStorage.setItem('pix-api-key', apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawTubeIds: ['recTube2'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
  });

  test('visiting /', async function(assert) {
    // when
    await visit('/');
    await click(findAll('.title.AccordionToggle')[0]);
    await click(findAll('.item')[0]);
    await click(findAll('.skill-cell')[0]);
    await click(findAll('.challenge-menu > .button')[1]);
    await click(findAll('.challenge-menu > .button')[0]);
    await click(find('.positive.button'));
    // then
    assert.equal(find('.message.positive').textContent.trim(), 'Épreuve mise à jour');
  });
});

