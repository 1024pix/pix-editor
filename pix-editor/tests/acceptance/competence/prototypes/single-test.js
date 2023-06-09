import { module, test } from 'qunit';
import { visit, click, findAll, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | Controller | Get Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1', updatedAt: '2021-10-04T14:00:00Z' });
    this.server.create('challenge', { id: 'recChallenge2', status: 'proposé', updatedAt: '2021-10-04T14:00:00Z', genealogy: 'Prototype 1' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1', 'recChallenge2'], level: 1 });
    this.server.create('skill', { id: 'recSkill2', status: 'en construction', challengeIds: [], level: 2, name:'@skill2' });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1', 'recSkill2'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('it should display the challenge', async function(assert) {
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);

    assert.dom('time').hasAttribute('datetime','2021-10-04T14:00:00.000Z');
  });

  test('it should change prototype location', async function (assert) {
    //when
    await visit('/competence/recCompetence1.1/prototypes/recChallenge2?leftMaximized=false&view=workbench');
    await click(find('[data-test-move-button]'));
    await click(find('[data-test-skill-list] .ember-basic-dropdown-trigger'));
    await click(findAll('.skill-list')[2]);
    await click(find('[data-test-move-action]'));
    await click(find('[data-test-save-changelog-button]'));
    const store = this.owner.lookup('service:store');

    //then
    const challenge = await store.peekRecord('challenge', 'recChallenge2');
    assert.dom('[data-test-main-message]').hasText('Changement d\'acquis effectué pour le prototype');
    assert.equal(challenge.skill.get('id'), 'recSkill2');
  });
});
