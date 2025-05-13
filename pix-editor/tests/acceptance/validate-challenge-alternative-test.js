import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Validate Alternative Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let competence, store, validatedPrototype, proposedPrototype, proposedAlternative1, proposedAlternative2;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');

    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    validatedPrototype = this.server.create('challenge', { id: 'recChallenge1', status: 'validé', genealogy: 'Prototype 1', version: 1 });
    proposedAlternative1 = this.server.create('challenge', { id: 'recChallenge3', status: 'proposé', genealogy: 'Décliné 1', version: 1, instruction: 'Déclinaison' });

    proposedPrototype = this.server.create('challenge', { id: 'recChallenge2', status: 'proposé', genealogy: 'Prototype 1', version: 1 });
    proposedAlternative2 = this.server.create('challenge', { id: 'recChallenge4', status: 'proposé', genealogy: 'Décliné 1', version: 1, instruction: 'Déclinaison' });

    this.server.create('skill', { id: 'recSkill1', status: 'actif', challengeIds: ['recChallenge1', 'recChallenge3'], version: 1 });
    this.server.create('skill', { id: 'recSkill2', status: 'suggested', challengeIds: ['recChallenge2', 'recChallenge4'], version: 2 });

    this.server.create('tube', { id: 'recTube1', name: 'monTube', rawSkillIds: ['recSkill1', 'recSkill2'] });

    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });

    competence = this.server.create('competence', { id: 'recCompetence1.1', code: '1', title: 'Titre compétence', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1'], rawTubeIds: ['recTube1'] });

    this.server.create('competence-overview', { id: `${competence.pixId}:challenges-production`, thematicOverviews: [] });
    this.server.create('competence-overview', { id: `${competence.pixId}:challenges-workbench`, thematicOverviews: [] });

    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    authenticateSession();
  });

  test('validate an alternative challenge', async function(assert) {
    // when
    const screen = await visit(`/competence/${competence.id}/prototypes/${validatedPrototype.id}`);
    await click(screen.getByRole('button', { name: 'Déclinaisons >>' }));
    await click(await screen.findByRole('cell', { name: 'Déclinaison' }));

    await click(await screen.findByRole('cell', { name: 'proposé' }));
    await click(await screen.findByRole('button', { name: 'Modifier le statut de la déclinaison' }));
    await click(screen.getByRole('button', { name: 'Valider' }));

    assert.ok(await screen.findByRole('heading', { name: 'Mise en production' }));
    await click(screen.getByRole('button', { name: 'Oui' }));

    assert.ok(await screen.findByRole('heading', { name: 'Message pour le changelog' }));
    await click(screen.getByRole('button', { name: 'Enregistrer' }));

    const newAlternative = await store.peekRecord('challenge', proposedAlternative1.id);
    assert.strictEqual(newAlternative.status, 'validé');

    assert.ok(await screen.findByText('Mise en production réussie'));
  });

  module('when prototype is proposed', function() {
    test('validate an alternative challenge', async function(assert) {
      // when
      const screen = await visit(`/competence/${competence.id}/prototypes/${proposedPrototype.id}`);
      await click(screen.getByRole('button', { name: 'Déclinaisons >>' }));
      await click(await screen.findByRole('cell', { name: 'Déclinaison' }));

      await click(await screen.findByRole('cell', { name: 'proposé' }));
      await click(await screen.findByRole('button', { name: 'Modifier le statut de la déclinaison' }));
      await click(screen.getByRole('button', { name: 'Valider' }));

      assert.ok(await screen.findByRole('heading', { name: 'Mise en production' }));
      await click(screen.getByRole('button', { name: 'Oui' }));

      assert.ok(await screen.findByRole('heading', { name: 'Message pour le changelog' }));
      await click(screen.getByRole('button', { name: 'Enregistrer' }));

      const newAlternative = await store.peekRecord('challenge', proposedAlternative2.id);
      assert.strictEqual(newAlternative.status, 'proposé');

      assert.ok(await screen.findByText('Le prototype correspondant n\'est pas validé'));
      assert.ok(await screen.findByText('Erreur lors de la mise en production'));
    });
  });
});
