import { clickByName, clickByText, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Acceptance | competence-management/new', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store, originalWindowConfirm;

  hooks.beforeEach(function () {
    // given
    originalWindowConfirm = window.confirm;
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'pixIdRecCompetence1.1',
      title: 'Titre',
      source: 'Pix+',
    });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix+', areaIds: ['recArea1'] });
    this.server.create('framework', { id: 'recFramework0', name: 'Pix' });

    return authenticateSession();
  });

  hooks.afterEach(function () {
    window.confirm = originalWindowConfirm;
  });

  test('it should create a new competence', async function (assert) {
    // given
    const newCompetenceTitle = 'Nouveau titre';

    // when
    const screen = await visit('/');
    await clickByName('Sélectionner un référentiel');
    await clickByText('Pix+');
    await click(screen.getByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Ajouter une compétence' }));
    await fillIn('[data-test-competence-title-input] input', newCompetenceTitle);
    await click(find('[data-test-save-button]'));

    // then
    const area = await store.peekRecord('area', 'recArea1');
    const newCompetence = area.competencesArray.find((competence) => competence.title === newCompetenceTitle);
    assert.ok(newCompetence);
    assert.dom(screen.getByText('Compétence créée')).exists();
    assert.strictEqual(currentURL(), `/competence/${newCompetence.id}/skills?view=workbench`);
  });

  test('it should cancel creation', async function (assert) {
    // when
    const screen = await visit('/competence-management/new/recArea1');
    await click(find('[data-test-cancel-button]'));

    // then
    assert.dom(screen.getByText('Création de la compétence annulée')).exists();
    assert.strictEqual(currentURL(), '/');
  });

  test('it should prevent transition', async function (assert) {
    // given
    const confirmStub = sinon.stub(window, 'confirm');
    confirmStub.returns(false);

    // when
    const screen = await visit('/competence-management/new/recArea1');
    await click(screen.getByRole('button', { name: 'Afficher/cacher la barre latérale' }));
    await click(await screen.findByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Code Titre' }));

    // then
    assert.strictEqual(currentURL(), '/competence-management/new/recArea1');
  });
});
