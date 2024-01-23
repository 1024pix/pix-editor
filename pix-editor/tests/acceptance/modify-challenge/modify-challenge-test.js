import { module, test } from 'qunit';
import { visit, findAll, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { runTask } from 'ember-lifeline';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | Modify-Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1' });
    this.server.create('challenge', { id: 'recChallenge2' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge2'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recTheme2', name: 'theme2', rawTubeIds: ['recTube2'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds:['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawThemeIds:['recTheme2'], rawTubeIds: ['recTube2'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
    return authenticateSession();
  });

  test('visiting /', async function(assert) {
    // when
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(find('[data-test-modify-challenge-button]'));
    // Ugly hack to wait for ToastUI to be ready
    // otherwise test is flacky and fails with error message
    // Attempted to access the computed <pixeditor@component:tui-editor::ember393>.options on a destroyed object, which is not allowed
    await runTask(this, async () => {}, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
  });

});

