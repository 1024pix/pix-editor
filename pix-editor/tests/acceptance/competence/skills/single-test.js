import { module, test } from 'qunit';
import { currentURL, visit, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | single', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let skill1, competence1, tube1;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const challenge1 = this.server.create('challenge', { id: 'recChallenge1', status: 'proposé' });
    const challenge2 = this.server.create('challenge', { id: 'recChallenge2', status: 'proposé' });
    skill1 = this.server.create('skill', { id: 'skillId1', challengeIds: [challenge1.id, challenge2.id], level:1 });
    tube1 = this.server.create('tube', { id: 'recTube1', rawSkillIds: [skill1.id] });
    const theme1 = this.server.create('theme', { id: 'recTheme1', rawTubeIds: [tube1.id] });
    competence1 = this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: [theme1.id], rawTubeIds: [tube1.id] });
    const area1 = this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: [competence1.id] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: [area1.id] });
    return authenticateSession();
  });

  test('close single', async function(assert) {
    await visit(`/competence/${competence1.id}/skills/new/${tube1.id}/0?leftMaximized=true&view=workbench`);
    await click(find('.icon.window.close'));

    assert.equal(currentURL(), `/competence/${competence1.id}/skills?view=workbench`);
  });

  module('#duplicateToLocation', function() {
    test('it should duplicate a skill and his challenges to new location', async function(assert) {
      // given
      const SKILL_LEVEL_CHOOSE = 4;
      const store = this.owner.lookup('service:store');

      // when
      await visit(`/competence/${competence1.id}/skills/${skill1.id}?leftMaximized=true&view=workbench`);
      await click(find('[data-test-duplicate-skill-action]'));
      await click(find('[data-test-select-level] .ember-basic-dropdown-trigger'));
      await click(findAll('.ember-power-select-options li')[SKILL_LEVEL_CHOOSE - 1]);
      await click(find('[data-test-move-action]'));
      await click(find('[data-test-save-changelog-button]'));

      const tube = await store.peekRecord('tube', 'recTube1');
      const newSkill = tube.rawSkills.find(skill => skill.level === SKILL_LEVEL_CHOOSE);
      // then
      assert.ok(newSkill);
      assert.equal(newSkill.challenges.length, 2);
      assert.equal(currentURL(), `/competence/${competence1.id}/skills/${newSkill.id}?leftMaximized=true&view=workbench`);
    });
  });
});
