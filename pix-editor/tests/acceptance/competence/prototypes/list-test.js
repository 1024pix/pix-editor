import { module, test } from 'qunit';
import { visit, currentURL, find, findAll, click, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { later } from '@ember/runloop';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockAuthService } from '../../../mock-auth';

const competenceId1 = 'recCompetence1_1';
const tubeId1 = 'recTube1';
const skillName = '@skill2';
const skillId1 = 'recSkill1';
const skillPixId1 = 'pixSkill1';
const skillId2 = 'recSkill2';
const skillPixId2 = 'pixSkill2';
const deadSkillId = 'recDeadSkill';
const deadSkillPixId = 'pixDeadSkill';
const challengeId2 = 'recChallenge2';

module('Acceptance | competence/prototypes/list', function () {
  module('visiting /competence/:competence_id/prototypes/list/:tube_id/:skill_id', async function (hooks) {

    setupApplicationTest(hooks);
    setupMirage(hooks);
    let apiKey;

    hooks.beforeEach(async function () {
      //given
      this.server.create('config', 'default');
      apiKey = 'valid-api-key';
      mockAuthService.call(this, apiKey);
      this.server.create('user', { apiKey, trigram: 'ABC' });

      this.server.create('challenge', { id: 'recChallenge1', instructions: 'instructionsChallenge1' });
      this.server.create('challenge', { id: challengeId2, instructions: 'instructionsChallenge2' });
      this.server.create('challenge', { id: 'recChallenge3' });
      this.server.create('skill', { id: skillId1, pixId: skillPixId1, name: skillName, version: 3, createdAt: '2020-12-11T13:38:35.000Z', challengeIds: ['recChallenge1'] });
      this.server.create('skill', { id: deadSkillId, pixId: deadSkillPixId, name: skillName, version: 1, status: 'périmé', challengeIds: ['recChallenge1'] });
      this.server.create('skill', { id: skillId2, pixId: skillPixId2, name: skillName, version: 2, createdAt: '2018-12-11T13:38:35.000Z', status: 'en construction', challengeIds: [challengeId2] });
      this.server.create('skill', { id: 'recSkill3', challengeIds: ['recChallenge3'] });
      this.server.create('tube', { id: tubeId1, rawSkillIds: [skillId1, skillId2, deadSkillId] });
      this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill3'] });
      this.server.create('theme', { id: 'recTheme1', rawTubeIds: [tubeId1] });
      this.server.create('theme', { id: 'recTheme2', rawTubeIds: ['recTube2'] });
      this.server.create('competence', { id: competenceId1, pixId: 'pixId recCompetence1.1', rawTubeIds: [tubeId1], rawThemeIds: ['recTheme1'] });
      this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawTubeIds: ['recTube2'], rawThemeIds: ['recTheme2'] });
      this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: [competenceId1] });
      this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });

      // when
      await visit(`/competence/${competenceId1}/prototypes/list/${tubeId1}/${skillId1}`);
    });

    test('it should display a list of prototype of `skill1`', function (assert) {
      // then
      assert.dom('[data-test-skill-tab].active').hasText(`${skillName} v.3`);
      assert.dom('[data-test-prototype-list] tbody tr').exists({ count:1 });
      assert.dom('[data-test-prototype-list]').includesText('instructionsChallenge1');
    });

    test('it should display a list of skill tab sorted by date', function (assert) {
      //given
      const expectedResult = [`${skillName} v.3`, `${skillName} v.2`, `${skillName} v.1`];

      // then
      const tabs = this.element.querySelectorAll('[data-test-skill-tab]');
      assert.equal(tabs.length, expectedResult.length);
      tabs.forEach((tab, index)=>{
        assert.dom(tab).hasText(expectedResult[index]);
      });
    });

    test('it should display a list of prototype of selected skill', async function (assert) {
      //when
      await click(findAll('[data-test-skill-tab]')[1]);
      await waitUntil(function() {
        return find('[data-test-prototype-list]').textContent.includes('instructionsChallenge2');
      }, { timeout: 1000 });

      // then
      assert.dom('[data-test-skill-tab].active').hasText(`${skillName} v.2`);
      assert.dom('[data-test-prototype-list] tbody tr').exists({ count:1 });
      assert.dom('[data-test-prototype-list]').includesText('instructionsChallenge2');
    });

    test('it should call prototype/new with good query params', async function (assert) {
      //given
      const expectedResult = `/competence/recCompetence1_1/prototypes/new?from=${challengeId2}`;

      //when
      await click(findAll('[data-test-skill-tab]')[1]);
      await click(find('[data-test-new-prototype-action]'));
      // Ugly hack to wait for ToastUI to be ready
      // otherwise test is flacky and fails with error message
      // Attempted to access the computed <pixeditor@component:tui-editor::ember393>.options on a destroyed object, which is not allowed
      await later(this, async () => {}, 100);

      //then
      assert.equal(currentURL().indexOf(expectedResult), 0);
    });
  });
});
