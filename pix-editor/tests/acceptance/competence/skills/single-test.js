import { clickByText, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { waitForSelectToBeClosed } from '../../../helpers/wait-for-select-to-be-closed';
import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | skill | single', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let skill1, competence1, tube1, originalWindowConfirm;

  hooks.beforeEach(function() {
    originalWindowConfirm = window.confirm;

    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const challenge1 = this.server.create('challenge', { id: 'recChallenge1', status: 'proposé', version: 1 });
    const challenge2 = this.server.create('challenge', { id: 'recChallenge2', status: 'proposé', version: 2 });
    skill1 = this.server.create('skill', { id: 'skillId1', name: '@monAcquisÀMoi', challengeIds: [challenge1.id, challenge2.id], level: 1 });
    tube1 = this.server.create('tube', { id: 'recTube1', name: '@tube', rawSkillIds: [skill1.id] });
    const theme1 = this.server.create('theme', { id: 'recTheme1', rawTubeIds: [tube1.id] });
    competence1 = this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: [theme1.id], rawTubeIds: [tube1.id] });
    this.server.create('competence-overview', {
      id: `${competence1.pixId}:challenges-workbench`,
      thematicOverviews: [
        {
          id: theme1.id,
          name: theme1.name,
          tubeOverviews: [
            {
              id: tube1.id,
              name: tube1.name,
              skillOverviews: [
                {
                  id: skill1.id,
                  name: skill1.name,
                  prototypeId: challenge2.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 2,
                  validatedChallengesCount: 0,
                },
                null,
                null,
                null,
                null,
                null,
                null,
              ],
            },
          ],
        },
      ],
    });
    const area1 = this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: [competence1.id] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: [area1.id] });
    return authenticateSession();
  });

  hooks.afterEach(function() {
    window.confirm = originalWindowConfirm;
  });

  test('close single', async function(assert) {
    const confirmStub = sinon.stub(window, 'confirm');
    confirmStub.returns(true);

    await visit(`/competence/${competence1.id}/skills/new/${tube1.id}/0?leftMaximized=true&view=workbench`);
    await click(find('.icon.window.close'));

    assert.strictEqual(currentURL(), `/competence/${competence1.id}/skills?view=workbench`);
  });

  module('#createSkill', function() {
    test('it should create a new skill', async function(assert) {
      // given
      const screen = await visit(`/competence/${competence1.id}/skills?view=workbench`);
      const store = this.owner.lookup('service:store');
      const skillDescription = 'Nouvelle description de skill';

      // when
      await screen.getByRole('link', { name: `ajouter un acquis de niveau 2 pour le sujet ${tube1.name}` }).click();
      const descriptionInput = await screen.findByLabelText('Description');
      await fillIn(descriptionInput, skillDescription);

      const i18nButton = await screen.getByRole('button', { name: 'Internationalisation' });
      await i18nButton.click();

      const frOption = await screen.findByRole('option', { name: 'France' });
      await frOption.click();

      const saveButton = await screen.getByRole('button', { name: 'Enregistrer l\'acquis @tube2' });
      await saveButton.click();

      // then
      const tube = await store.peekRecord('tube', 'recTube1');
      const newSkill = tube.rawSkillsArray.find((skill) => skill.description === skillDescription);

      assert.ok(newSkill);
      assert.strictEqual(currentURL(), `/competence/${competence1.id}/skills/new/recTube1/2?leftMaximized=true&view=workbench`);
    });

    test('it should create a new skill version', async function(assert) {
      // given
      const screen = await visit(`/competence/${competence1.id}/skills?view=workbench`);
      const store = this.owner.lookup('service:store');
      const skillDescription = 'Nouvelle description de ma nouvelle version du skill';

      // when
      await screen.getByRole('link', { name: '@monAcquisÀMoi 1' }).click();
      const newVersionButton = await screen.findByRole('button', { name: 'Nouvelle Version' });
      await newVersionButton.click();
      const descriptionInput = await screen.findByLabelText('Description');
      await fillIn(descriptionInput, skillDescription);

      const saveButton = await screen.getByRole('button', { name: 'Enregistrer l\'acquis @tube1' });
      await saveButton.click();

      // then
      const tube = await store.peekRecord('tube', 'recTube1');
      const newSkillVersion = tube.rawSkillsArray.find((skill) => skill.description === skillDescription && skill.level === 1);

      assert.ok(newSkillVersion);
      assert.strictEqual(currentURL(), `/competence/${competence1.id}/skills/new/recTube1/1?leftMaximized=true&view=workbench`);
    });
  });

  module('#duplicateToLocation', function() {
    test('it should duplicate a skill and his challenges to new location', async function(assert) {
      // given
      const SKILL_LEVEL_CHOOSE = 4;
      const store = this.owner.lookup('service:store');

      // when
      const screen = await visit(`/competence/${competence1.id}/skills/${skill1.id}?leftMaximized=true&view=workbench`);
      await click(screen.getByRole('button', { name: 'Dupliquer vers' }));
      await click(screen.getByLabelText('Niveau'));
      await click(await screen.findByRole('option', { name: SKILL_LEVEL_CHOOSE }));
      await click(screen.getByRole('button', { name: 'Dupliquer' }));
      await click(await screen.findByRole('button', { name: 'Enregistrer' }));

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
      const skillDescription = 'Nouvelle description';
      // when

      const screen = await visit(`/competence/${competence1.id}/skills/${skill1.id}`);
      await clickByText('Modifier');
      const descriptionInput = await screen.findByLabelText('Description');
      await fillIn(descriptionInput, skillDescription);
      await clickByText('Épreuve de sensibilisation');
      await clickByText('Accès GAFAM requis');
      await clickByText('Formulation à revoir');
      await clickByText('Incompatible iPad certif');
      await clickByText('Sourds et malentendants');
      await click(await screen.findByRole('option', { name: 'RAS' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Non voyant');
      await click(await screen.findByRole('option', { name: 'OK' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Daltonien');
      await click(await screen.findByRole('option', { name: 'KO' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Spoil');
      await click(await screen.findByRole('option', { name: 'Facilement Sp' }));
      await waitForSelectToBeClosed(screen);
      await clickByText('Responsive');
      await click(await screen.findByRole('option', { name: 'Non' }));
      await waitForSelectToBeClosed(screen);
      const saveButton = screen.getByRole('button', { name: 'Enregistrer l\'acquis @monAcquisÀMoi' });
      await click(saveButton);
      await clickByText('Valider');
      // then
      assert.strictEqual(screen.getByLabelText('Sourds et malentendants').childNodes[3].textContent, 'RAS');
      assert.strictEqual(screen.getByLabelText('Non voyant').childNodes[3].textContent, 'OK');
      assert.strictEqual(screen.getByLabelText('Daltonien').childNodes[3].textContent, 'KO');
      assert.strictEqual(screen.getByLabelText('Spoil').childNodes[3].textContent, 'Facilement Sp');
      assert.false(screen.getByRole('checkbox', { name: 'Épreuve de sensibilisation' }).checked);
      assert.false(screen.getByRole('checkbox', { name: 'Accès GAFAM requis' }).checked);
      assert.false(screen.getByRole('checkbox', { name: 'Formulation à revoir' }).checked);
      assert.false(screen.getByRole('checkbox', { name: 'Incompatible iPad certif' }).checked);

      assert.strictEqual(screen.getByLabelText('Responsive').childNodes[3].textContent, 'Non');
      assert.strictEqual(screen.getByLabelText('Description').value, skillDescription);
      assert.dom(screen.queryByRole('button', { name: 'Enregistrer l\'acquis @monAcquisÀMoi' })).doesNotExist();
    });
  });
});
