import { module, test } from 'qunit';
import { click, currentURL, fillIn, find, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import sinon from 'sinon';
import { clickByName } from '@1024pix/ember-testing-library';

module('Acceptance | competence-management/single', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store, originalWindowConfirm;

  hooks.beforeEach(function() {
    // given
    originalWindowConfirm = window.confirm;
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixIdRecCompetence1.1', title: 'Titre' });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix+', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  hooks.afterEach(function () {
    window.confirm = originalWindowConfirm;
  });

  test('it should edit a competence', async function(assert) {
    // given
    const newCompetenceTitle = 'Nouveau titre';

    // when
    await visit('/competence-management/recCompetence1.1');
    await click(find('[data-test-edit-button]'));
    await fillIn('[data-test-competence-title-input] input', newCompetenceTitle);
    await click(find('[data-test-save-button]'));

    // then
    const competence = await store.peekRecord('competence', 'recCompetence1.1');
    assert.dom('[data-test-main-message]').hasText('Compétence mise à jour');
    assert.equal(competence.title, 'Nouveau titre');
  });

  test('it should cancel edit', async function(assert) {
    // given
    const newCompetenceTitle = 'Nouveau titre';

    // when
    await visit('/competence-management/recCompetence1.1');
    await click(find('[data-test-edit-button]'));
    await fillIn('[data-test-competence-title-input] input', newCompetenceTitle);
    await click(find('[data-test-cancel-button]'));

    // then
    const competence = await store.peekRecord('competence', 'recCompetence1.1');
    assert.dom('[data-test-main-message]').hasText('Modification annulée');
    assert.equal(competence.title, 'Titre');
  });

  test('it should prevent transition on edition', async function(assert) {
    // given
    const confirmStub = sinon.stub(window, 'confirm');
    confirmStub.returns(false);

    // when
    await visit('/competence-management/recCompetence1.1');
    await click(find('[data-test-edit-button]'));
    await clickByName('Basculer le menu');
    await click(find('[data-test-area-item]'));
    await click(find('[data-test-competence-item]'));

    // then
    assert.equal(currentURL(), '/competence-management/recCompetence1.1');
  });
});
