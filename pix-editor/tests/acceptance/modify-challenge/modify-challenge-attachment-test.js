import { module, test } from 'qunit';
import sinon from 'sinon';
import { visit, findAll, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { later } from '@ember/runloop';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import Service from '@ember/service';
import { mockAuthService } from '../../mock-auth';

module('Acceptance | Modify-Challenge-Attachment', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1', airtableId: 'airtableId1' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recTheme2', name: 'theme2', rawTubeIds: ['recTube2'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds:['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawThemeIds:['recTheme2'], rawTubeIds: ['recTube2'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
  });

  test('adding attachments', async function(assert) {
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
    await selectFiles('[data-test-file-input-attachment] input', file);

    await later(this, async () => {}, 400);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-save-changelog-button]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every(record => !record.isNew));
    assert.equal(attachments.length, 1);
  });

  test('delete attachment', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      airtableId: 'airtableId2',
      attachments: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/attachment.png',
        'filename': 'attachment.png',
        'size': 178629,
        'type': 'image/png'
      }],
      filesIds: ['recAttachment1'],
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'attachment', challengeId: 'recChallenge2', filename: 'attachment.png' });

    // when
    await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-attachment-button]'));

    await later(this, async () => {}, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-save-changelog-button]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.equal(attachments.length, 0);
    assert.ok(attachments.every(record => !record.isDeleted));
  });

  test('cancel adding an attachment', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      attachments: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/attachment.png',
        'filename': 'attachment.png',
        'size': 178629,
        'type': 'image/png'
      }],
      filesIds: ['recAttachment1'],
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'attachment', challengeId: 'recChallenge2', filename: 'attachment.png' });

    // when
    await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-attachment-button]'));

    await later(this, async () => {}, 200);
    await click(find('[data-test-cancel-challenge-button]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Modification annulée');
    assert.equal(attachments.length, 1);
    assert.ok(attachments.every(record => !record.isDeleted));
  });
});

