import { clickByText, visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Validate-Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let competence, tube, store, messageStub;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    class NotifyServiceStub extends Service {
      message() {}
      setTarget() {}
    }
    this.owner.register('service:notify', NotifyServiceStub);
    const notifyServiceStub = this.owner.lookup('service:notify');
    messageStub = sinon.stub(notifyServiceStub, 'message');

    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('skill', { id: 'recSkillWorkbench', name: '@workbench', code: null });

    tube = this.server.create('tube', { id: 'recTube1', name: 'monTube', rawSkillIds: [] });
    this.server.create('tube', { id: 'recTubeWorkbench', name: '@workbench', rawSkillIds: ['recSkillWorkbench'] });

    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recThemeWorkbench', name: 'workbench_1_1', rawSkillIds: ['recTubeWorkbench'] });

    competence = this.server.create('competence', { id: 'recCompetence1.1', code: '1', title: 'Titre compétence', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1', 'recThemeWorkbench'], rawTubeIds: ['recTube1', 'recTubeWorkbench'] });

    this.server.create('competence-overview', { id: `${competence.pixId}:challenges-production`, thematicOverviews: [] });
    this.server.create('competence-overview', { id: `${competence.pixId}:challenges-workbench`, thematicOverviews: [] });

    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    authenticateSession();
  });

  module('when have one prototype in a suggestedSkill', function(hooks) {
    let proposalPrototype, suggestedSkill, draftAlternativeChallenge, obsoleteAlternativeChallenge;
    hooks.beforeEach(function() {
      proposalPrototype = this.server.create('challenge', { id: 'recChallenge1', status: 'proposé', genealogy: 'Prototype 1', version: 1 });
      draftAlternativeChallenge = this.server.create('challenge', { id: 'recChallenge1-1', status: 'proposé', genealogy: 'Décliné 1', version: 1, alternativeVersion: 1 });
      obsoleteAlternativeChallenge = this.server.create('challenge', { id: 'recChallenge1-2', status: 'périmé', genealogy: 'Décliné 1', version: 1, alternativeVersion: 2 });

      suggestedSkill = this.server.create('skill', { id: 'recSkill1', status: 'suggested', challengeIds: ['recChallenge1', 'recChallenge1-1', 'recChallenge1-2'] });

      tube.update({
        rawSkillIds: ['recSkill1'],
      });
    });

    test('validate a prototype and draft alternatives should active the parent skill', async function(assert) {
      // when
      const screen = await visit(`/competence/${competence.id}/prototypes/${proposalPrototype.id}/alternatives?view=workbench`);

      await click(screen.getByRole('button', { name: 'Modifier le statut de l\'épreuve' }));
      await click(await screen.getByRole('button', { name: 'Valider' }));

      assert.ok(await screen.findByRole('heading', { name: 'Mise en production' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));

      assert.ok(await screen.findByRole('heading', { name: 'Message pour le changelog' }));
      await click(await screen.getByRole('button', { name: 'Enregistrer' }));

      assert.ok(await screen.findByRole('heading', { name: 'Mise en production des déclinaisons' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));

      // then
      const prototype = await store.peekRecord('challenge', proposalPrototype.id);
      const alternative1 = await store.peekRecord('challenge', draftAlternativeChallenge.id);
      const alternative2 = await store.peekRecord('challenge', obsoleteAlternativeChallenge.id);
      const skill = await store.peekRecord('skill', suggestedSkill.id);

      assert.ok(messageStub.calledThrice);
      assert.deepEqual(messageStub.args[0], ['Activation de l\'acquis name']);
      assert.deepEqual(messageStub.args[1], ['Alternative n°1 mise en production']);
      assert.deepEqual(messageStub.args[2], ['Mise en production réussie']);
      assert.strictEqual(prototype.status, 'validé');
      assert.strictEqual(alternative1.status, 'validé');
      assert.strictEqual(alternative2.status, 'périmé');
      assert.strictEqual(skill.status, 'actif');
    });

    test('should not validate alternative when we won\'t', async function(assert) {
      // when
      const screen = await visit(`/competence/${competence.id}/prototypes/${proposalPrototype.id}/alternatives?view=workbench`);

      await click(screen.getByRole('button', { name: 'Modifier le statut de l\'épreuve' }));
      await click(await screen.getByRole('button', { name: 'Valider' }));

      assert.ok(await screen.findByRole('heading', { name: 'Mise en production' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));

      assert.ok(await screen.findByRole('heading', { name: 'Message pour le changelog' }));
      await click(await screen.getByRole('button', { name: 'Enregistrer' }));

      assert.ok(await screen.findByRole('heading', { name: 'Mise en production des déclinaisons' }));
      await click(await screen.getByRole('button', { name: 'Annuler' }));

      // then
      const prototype = await store.peekRecord('challenge', proposalPrototype.id);
      const alternative1 = await store.peekRecord('challenge', draftAlternativeChallenge.id);
      const alternative2 = await store.peekRecord('challenge', obsoleteAlternativeChallenge.id);
      const skill = await store.peekRecord('skill', suggestedSkill.id);

      assert.ok(messageStub.calledThrice);
      assert.deepEqual(messageStub.args[0], ['Activation de l\'acquis name']);
      assert.deepEqual(messageStub.args[1], ['Mise en production des déclinaisons annulée']);
      assert.deepEqual(messageStub.args[2], ['Mise en production réussie']);
      assert.strictEqual(prototype.status, 'validé');
      assert.strictEqual(alternative1.status, 'proposé');
      assert.strictEqual(alternative2.status, 'périmé');
      assert.strictEqual(skill.status, 'actif');
    });
  });

  module('when have several prototypes in activeSkill', function(hooks) {
    let proposalPrototype, validatePrototype, skill;

    hooks.beforeEach(function() {
      validatePrototype = this.server.create('challenge', { id: 'recChallenge1', status: 'validé', genealogy: 'Prototype 1', version: 1 });
      proposalPrototype = this.server.create('challenge', { id: 'recChallenge2', status: 'proposé', instruction: 'Epreuve à valider', genealogy: 'Prototype 1', version: 2 });

      skill = this.server.create('skill', { id: 'recSkill1', status: 'actif', challengeIds: ['recChallenge1', 'recChallenge2'] });

      tube.update({
        rawSkillIds: ['recSkill1'],
      });
    });

    test('validate a new prototype version should archive the old validated prototype version ', async function(assert) {
      // when
      const screen = await visit(`competence/${competence.id}/prototypes/list/${tube.id}/${skill.id}?view=workbench`);

      await clickByText('Epreuve à valider');
      await click(screen.getByRole('button', { name: 'Modifier le statut de l\'épreuve' }));

      await click(await screen.getByRole('button', { name: 'Valider' }));
      assert.ok(await screen.findByRole('heading', { name: 'Mise en production' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));

      assert.ok(await screen.findByRole('heading', { name: 'Message pour le changelog' }));
      await click(await screen.getByRole('button', { name: 'Enregistrer' }));

      assert.ok(await screen.findByRole('heading', { name: 'Archivage du prototype précédent' }));
      await click(await screen.getByRole('button', { name: 'Oui' }));

      // then
      const challenge = await store.peekRecord('challenge', proposalPrototype.id);
      const oldChallenge = await store.peekRecord('challenge', validatePrototype.id);
      assert.ok(messageStub.calledWith('Mise en production réussie'));
      assert.strictEqual(oldChallenge.status, 'archivé');
      assert.strictEqual(challenge.status, 'validé');
      assert.strictEqual(skill.status, 'actif');
    });
  });

  module('when have several skills', function(hooks) {
    let actifSkill, validatedPrototype, suggestedSkill, proposalPrototype;

    hooks.beforeEach(function() {
      proposalPrototype = this.server.create('challenge', { id: 'recChallenge2', status: 'proposé', genealogy: 'Prototype 1', version: 1 });
      suggestedSkill = this.server.create('skill', { id: 'recSkill2', status: 'suggested', challengeIds: ['recChallenge2'], version: 2 });

      validatedPrototype = this.server.create('challenge', { id: 'recChallenge1', status: 'validé', genealogy: 'Prototype 1', version: 1 });
      actifSkill = this.server.create('skill', { id: 'recSkill1', status: 'actif', challengeIds: ['recChallenge1'], version: 1 });

      tube.update({
        rawSkillIds: [actifSkill.id, suggestedSkill.id],
      });
    });

    test('validate a new prototype version from a suggested skill should archive current active skill', async function(assert) {
      // when
      const screen = await visit(`/competence/${competence.id}/prototypes/${validatedPrototype.id}`);

      await click(screen.getByTitle('Afficher les différentes versions d\'épreuves'));
      await click(screen.getByText('name v.2'));

      await click(await screen.findByRole('cell', { name: 'proposé' }));
      await click(screen.getByRole('button', { name: 'Modifier le statut de l\'épreuve' }));
      await click(screen.getByRole('button', { name: 'Valider' }));

      assert.ok(await screen.findByRole('heading', { name: 'Mise en production' }));
      await click(screen.getByRole('button', { name: 'Oui' }));

      assert.ok(await screen.findByRole('heading', { name: 'Message pour le changelog' }));
      await click(screen.getByRole('button', { name: 'Enregistrer' }));

      assert.ok(await screen.findByRole('heading', { name: 'Archivage de la version précédente de l\'acquis' }));
      await click(screen.getByRole('button', { name: 'Oui' }));
      // then

      const newPrototype = await store.peekRecord('challenge', proposalPrototype.id);
      const newSkill = await store.peekRecord('skill', suggestedSkill.id);
      const oldPrototype = await store.peekRecord('challenge', validatedPrototype.id);
      const oldSkill = await store.peekRecord('skill', actifSkill.id);

      assert.ok(messageStub.calledTwice);
      assert.deepEqual(messageStub.args[0], ['Activation de l\'acquis name']);
      assert.deepEqual(messageStub.args[1], ['Mise en production réussie']);
      assert.strictEqual(newPrototype.status, 'validé');
      assert.strictEqual(oldPrototype.status, 'archivé');
      assert.strictEqual(newSkill.status, 'actif');
      assert.strictEqual(oldSkill.status, 'archivé');
    });
  });
});
