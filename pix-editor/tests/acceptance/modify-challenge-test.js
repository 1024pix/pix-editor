import { module, test } from 'qunit';
import sinon from 'sinon';
import { visit, findAll, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { later } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { selectFiles } from 'ember-file-upload/test-support';
import Service from '@ember/service';

module('Acceptance | Modify-Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    localStorage.setItem('pix-api-key', apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawTubeIds: ['recTube2'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
  });

  test('visiting /', async function(assert) {
    // when
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell]')[0]);
    await click(find('[data-test-modify-challenge-button]'));
    // Ugly hack to wait for ToastUI to be ready
    // otherwise test is flacky and fails with error message
    // Attempted to access the computed <pixeditor@component:tui-editor::ember393>.options on a destroyed object, which is not allowed
    await later(this, async () => {}, 100);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-save-changelog-button]'));

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
  });

  test('adding illustration', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell]')[0]);
    await click(find('[data-test-modify-challenge-button]'));

    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await later(this, async () => {}, 100);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-save-changelog-button]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every(record => !record.isNew));
  });
});

