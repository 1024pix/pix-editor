import { module, test } from 'qunit';
import { currentURL, visit, fillIn, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockAuthService } from '../../mock-auth';
import sinon from 'sinon';

module('Acceptance | competence-management/single', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey, store, originalWindowConfirm;

  hooks.beforeEach(function() {
    // given
    originalWindowConfirm = window.confirm;
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixIdRecCompetence1.1', title: 'Titre' , source: 'Pix+' });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix+', areaIds: ['recArea1'] });
    this.server.create('framework', { id: 'recFramework0', name: 'Pix' });

  });

  hooks.afterEach(function () {
    window.confirm = originalWindowConfirm;
  });

  test('it should create a new competence', async function(assert) {
    // given
    const newCompetenceTitle = 'Nouveau titre';

    // when
    await visit('/');
    await click(findAll('.ember-basic-dropdown-trigger')[1]);
    await click(find('.ember-power-select-option'));
    await click(find('[data-test-area-item]'));
    await click(find('[data-test-add-competence]'));
    await fillIn('[data-test-competence-title-input] input', newCompetenceTitle);
    await click(find('[data-test-save-button]'));

    // then
    const area = await store.peekRecord('area', 'recArea1');
    const newCompetence = area.competences.find(competence => competence.title === newCompetenceTitle);
    const workbenchTheme = newCompetence.rawThemes.find(theme => theme.name === 'workbench_Pix+_1_2');
    const workbenchTube = workbenchTheme.rawTubes.find(tube => tube.name === '@workbench');
    const workbenchSkill = workbenchTube.rawSkills.find(skill => skill.name === '@workbench');
    assert.ok(newCompetence);
    assert.ok(workbenchTheme);
    assert.ok(workbenchTube);
    assert.ok(workbenchSkill);
    assert.dom(findAll('[data-test-main-message]')[0]).hasText('Compétence créée');
    assert.dom(findAll('[data-test-main-message]')[1]).hasText('Atelier créé');
    assert.equal(currentURL(), `/competence/${newCompetence.id}/skills?leftMaximized=false&view=workbench`);
  });

  test('it should cancel creation', async function(assert) {
    // when
    await visit('/competence-management/new/recArea1');
    await click(find('[data-test-cancel-button]'));

    // then
    assert.dom('[data-test-main-message]').hasText('Création de la compétence annulée');
    assert.equal(currentURL(), '/');
  });

  test('it should prevent transition', async function(assert) {
    // given
    const confirmStub = sinon.stub(window, 'confirm');
    confirmStub.returns(false);

    // when
    await visit('/competence-management/new/recArea1');
    await click(find('.bars.icon'));
    await click(find('[data-test-area-item]'));
    await click(find('[data-test-competence-item]'));

    // then
    assert.equal(currentURL(), '/competence-management/new/recArea1');
  });
});
