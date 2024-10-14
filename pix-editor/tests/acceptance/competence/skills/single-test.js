import { clickByText, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, find, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | skill | single', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let skill1, competence1, tube1;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const challenge1 = this.server.create('challenge', { id: 'recChallenge1', status: 'proposé' });
    const challenge2 = this.server.create('challenge', { id: 'recChallenge2', status: 'proposé' });
    skill1 = this.server.create('skill', { id: 'skillId1', challengeIds: [challenge1.id, challenge2.id], level: 1 });
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

    assert.strictEqual(currentURL(), `/competence/${competence1.id}/skills?view=workbench`);
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
      const newSkill = tube.rawSkillsArray.find((skill) => skill.level === SKILL_LEVEL_CHOOSE);
      await newSkill.challenges;

      // then
      assert.ok(newSkill);
      assert.strictEqual(newSkill.challenges.length, 2);
      assert.strictEqual(currentURL(), `/competence/${competence1.id}/skills/${newSkill.id}?leftMaximized=true&view=workbench`);
    });
  });

  module('#Modify skill', function() {
    test('it should modify skill and proto', async function(assert) {
      // given
      const challengeProto = this.server.create('challenge', {
        id: 'recChallengeProto',
        status: 'validé',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        deafAndHardOfHearing: 'KO',
        isIncompatibleIpadCertif: true,
        toRephrase: true,
        requireGafamWebsiteAccess: true,
        isAwarenessChallenge: true,
      });
      skill1.update({ challengeIds: [...skill1.challengeIds, challengeProto.id] });

      // when
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      const screen = await visit(`/competence/${competence1.id}/skills/${skill1.id}`);
      await clickByText('Modifier');
      await clickByText('Épreuve de sensibilisation');
      await clickByText('Accès GAFAM requis');
      await clickByText('Formulation à revoir');
      await clickByText('Incompatible iPad certif');
      await clickByText('Sourds et malentendants');
      await click(await screen.findByRole('option', { name: 'RAS' }));
      await delay(100);
      await clickByText('Non voyant');
      await click(await screen.findByRole('option', { name: 'OK' }));
      await delay(100);
      await clickByText('Daltonien');
      await click(await screen.findByRole('option', { name: 'KO' }));
      await delay(100);
      await clickByText('Spoil');
      await click(await screen.findByRole('option', { name: 'Facilement Sp' }));
      await clickByText('Responsive');
      await click(await screen.findByRole('option', { name: 'Non' }));

      await click(find('[data-test-save-skill-button]'));
      await clickByText('Valider');

      // then
      assert.strictEqual((await screen.getByLabelText('Sourds et malentendants')).childNodes[3].textContent, 'RAS');
      assert.strictEqual((await screen.getByLabelText('Non voyant')).childNodes[3].textContent, 'OK');
      assert.strictEqual((await screen.getByLabelText('Daltonien')).childNodes[3].textContent, 'KO');
      assert.strictEqual((await screen.getByLabelText('Spoil')).childNodes[3].textContent, 'Facilement Sp');
      assert.false(screen.getByRole('checkbox', { name: 'Épreuve de sensibilisation' }).checked);
      assert.false(screen.getByRole('checkbox', { name: 'Accès GAFAM requis' }).checked);
      assert.false(screen.getByRole('checkbox', { name: 'Formulation à revoir' }).checked);
      assert.false(screen.getByRole('checkbox', { name: 'Incompatible iPad certif' }).checked);
      assert.strictEqual((await screen.getByLabelText('Responsive')).childNodes[3].textContent, 'Non');
      assert.dom(await find('[data-test-save-skill-button]')).doesNotExist();
    });
  });
});
