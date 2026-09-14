import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import Challenge from '../../../../app/models/challenge';
import Skill from '../../../../app/models/skill';

module('Acceptance | Make prototype obsolete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store, pixToastSendSuccess, competence, prototype, alternative, skill;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    class PixToastNotificationsStub extends Service {
      sendSuccess() {}
    }
    this.owner.register('service:notifications', PixToastNotificationsStub);
    const notificationsStub = this.owner.lookup('service:notifications');
    pixToastSendSuccess = sinon.stub(notificationsStub, 'sendSuccess');

    authenticateSession();

    prototype = this.server.create('challenge', {
      id: 'challengeId1',
      accessibility1: 'RAS',
      accessibility2: 'OK',
      responsive: 'Tablette',
      spoil: 'Non Sp',
      requireGafamWebsiteAccess: false,
      isIncompatibleIpadCertif: false,
      deafAndHardOfHearing: 'KO',
      isAwarenessChallenge: false,
      toRephrase: false,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      status: Challenge.STATUSES.VALIDE,
      instruction:
        "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
      geography: 'FR',
      version: 1,
    });

    alternative = this.server.create('challenge', {
      id: 'challengeId1-1',
      accessibility1: 'RAS',
      accessibility2: 'OK',
      responsive: 'Tablette',
      spoil: 'Non Sp',
      requireGafamWebsiteAccess: false,
      isIncompatibleIpadCertif: false,
      deafAndHardOfHearing: 'KO',
      isAwarenessChallenge: false,
      toRephrase: false,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      status: Challenge.STATUSES.VALIDE,
      instruction:
        "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
      geography: 'FR',
      version: 1,
      alternativeVersion: 1,
    });

    skill = this.server.create('skill', {
      id: 'skillId1',
      level: 2,
      name: '@trululu2',
      challengeIds: [prototype.id, alternative.id],
      status: Skill.STATUSES.ACTIF,
    });

    const tube = this.server.create('tube', { id: 'recTube1', name: '@trululu', rawSkillIds: [skill.id] });
    const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: [tube.id] });
    competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      code: '1',
      title: 'titre compétence',
      pixId: 'pixId recCompetence1.1',
      rawThemeIds: [thematic.id],
      rawTubeIds: [tube.id],
    });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [
        {
          id: thematic.id,
          name: thematic.name,
          tubeOverviews: [
            {
              id: tube.id,
              name: tube.name,
              skillOverviews: [
                {
                  id: skill.id,
                  name: skill.name,
                  prototypeId: prototype.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 0,
                  validatedChallengesCount: 2,
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
  });

  module('When skill has no other prototype', function () {
    test('it should make skill and alternative obsolete', async function (assert) {
      // when
      const screen = await visit(`competence/${competence.id}/prototypes/${prototype.id}?view=production`);

      await click(screen.getByRole('button', { name: "Modifier le statut de l'épreuve" }));
      await click(await screen.getByRole('button', { name: 'Rendre obsolète' }));
      assert.ok(await screen.findByRole('heading', { name: 'Rendre obsolète' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));
      await click(await screen.getByRole('button', { name: 'Enregistrer' }));

      // then
      const updatedSkill = await store.peekRecord('skill', skill.id);
      const updatedAlternative = await store.peekRecord('challenge', alternative.id);
      const updatedPrototype = await store.peekRecord('challenge', prototype.id);

      assert.ok(pixToastSendSuccess.calledTwice);
      assert.deepEqual(pixToastSendSuccess.args[0], ['Déclinaison n°1 périmée']);
      assert.deepEqual(pixToastSendSuccess.args[1], ['Épreuve périmée']);
      assert.strictEqual(updatedPrototype.status, 'périmé');
      assert.strictEqual(updatedAlternative.status, 'périmé');
      assert.strictEqual(updatedSkill.status, 'périmé');
    });
  });

  module('When skill has an other proposed prototype', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('challenge', {
        id: 'challengeId2',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'KO',
        isAwarenessChallenge: false,
        toRephrase: false,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        status: Challenge.STATUSES.PROPOSE,
        instruction:
          "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        geography: 'FR',
        version: 2,
        skillId: skill.id,
      });
    });

    test('it should make alternative obsolete and deactivate skill', async function (assert) {
      // when
      const screen = await visit(`competence/${competence.id}/prototypes/${prototype.id}?view=production`);

      await click(screen.getByRole('button', { name: "Modifier le statut de l'épreuve" }));
      await click(await screen.getByRole('button', { name: 'Rendre obsolète' }));
      assert.ok(await screen.findByRole('heading', { name: 'Rendre obsolète' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));
      await click(await screen.getByRole('button', { name: 'Enregistrer' }));

      // then
      const updatedSkill = await store.peekRecord('skill', skill.id);
      const updatedAlternative = await store.peekRecord('challenge', alternative.id);
      const updatedPrototype = await store.peekRecord('challenge', prototype.id);

      assert.ok(pixToastSendSuccess.calledTwice);
      assert.deepEqual(pixToastSendSuccess.args[0], ['Déclinaison n°1 périmée']);
      assert.deepEqual(pixToastSendSuccess.args[1], ['Épreuve périmée']);
      assert.strictEqual(updatedPrototype.status, 'périmé');
      assert.strictEqual(updatedAlternative.status, 'périmé');
      assert.strictEqual(updatedSkill.status, 'en construction');
    });
  });

  module('When skill has an other archived prototype', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('challenge', {
        id: 'challengeId2',
        accessibility1: 'RAS',
        accessibility2: 'OK',
        responsive: 'Tablette',
        spoil: 'Non Sp',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'KO',
        isAwarenessChallenge: false,
        toRephrase: false,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        status: Challenge.STATUSES.ARCHIVE,
        instruction:
          "Cliquer sur instructions pour aller sur ma page principale depuis la liste des épreuves de l'acquis",
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        geography: 'FR',
        version: 2,
        skillId: skill.id,
      });
    });

    test('it should make alternative obsolete and archive skill', async function (assert) {
      // when
      const screen = await visit(`competence/${competence.id}/prototypes/${prototype.id}?view=production`);

      await click(screen.getByRole('button', { name: "Modifier le statut de l'épreuve" }));
      await click(await screen.getByRole('button', { name: 'Rendre obsolète' }));
      assert.ok(await screen.findByRole('heading', { name: 'Rendre obsolète' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));
      await click(await screen.getByRole('button', { name: 'Enregistrer' }));

      // then
      const updatedSkill = await store.peekRecord('skill', skill.id);
      const updatedAlternative = await store.peekRecord('challenge', alternative.id);
      const updatedPrototype = await store.peekRecord('challenge', prototype.id);

      assert.ok(pixToastSendSuccess.calledTwice);
      assert.deepEqual(pixToastSendSuccess.args[0], ['Déclinaison n°1 périmée']);
      assert.deepEqual(pixToastSendSuccess.args[1], ['Épreuve périmée']);
      assert.strictEqual(updatedPrototype.status, 'périmé');
      assert.strictEqual(updatedAlternative.status, 'périmé');
      assert.strictEqual(updatedSkill.status, 'archivé');
    });
  });
});
