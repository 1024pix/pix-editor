import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Acceptance | competence-management/single', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store, originalWindowConfirm;

  hooks.beforeEach(function () {
    // given
    originalWindowConfirm = window.confirm;
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'persistantPixIdRecCompetence', title: 'Titre' });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix+', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  hooks.afterEach(function () {
    window.confirm = originalWindowConfirm;
  });

  test('it should edit a competence', async function (assert) {
    // given
    const newCompetenceTitle = 'Nouveau titre';

    // when
    const screen = await visit('/competence-management/recCompetence1.1');
    await click(await screen.findByRole('button', { name: 'Modifier' }));
    await fillByLabel('Titre :', newCompetenceTitle);
    await click(screen.getByRole('button', { name: 'Enregistrer' }));

    // then
    const competence = await store.peekRecord('competence', 'recCompetence1.1');
    assert.dom(screen.getByText('Compétence mise à jour')).exists();
    assert.strictEqual(competence.title, 'Nouveau titre');
  });

  test('it should cancel edit', async function (assert) {
    // given
    const newCompetenceTitle = 'Nouveau titre';

    // when
    const screen = await visit('/competence-management/recCompetence1.1');
    await click(await screen.findByRole('button', { name: 'Modifier' }));
    await fillByLabel('Titre :', newCompetenceTitle);
    await click(screen.getByRole('button', { name: 'Annuler' }));

    // then
    const competence = await store.peekRecord('competence', 'recCompetence1.1');
    assert.dom(screen.getByText('Modification annulée')).exists();
    assert.strictEqual(competence.title, 'Titre');
  });

  test('it should prevent transition on edition', async function (assert) {
    // given
    const confirmStub = sinon.stub(window, 'confirm');
    confirmStub.returns(false);

    // when
    const screen = await visit('/competence-management/recCompetence1.1');
    await click(await screen.findByRole('button', { name: 'Modifier' }));
    await click(screen.getByRole('button', { name: 'Afficher/cacher la barre latérale' }));
    await click(await screen.findByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Code Titre' }));

    // then
    assert.strictEqual(currentURL(), '/competence-management/recCompetence1.1');
  });
});
