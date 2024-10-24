import Service from '@ember/service';
import { click, find, findAll, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import { runTask } from 'ember-lifeline';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | Modify-Challenge-Attachment', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1', airtableId: 'airtableId1' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: [] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recTheme2', name: 'theme2', rawTubeIds: ['recTube2'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawThemeIds: ['recTheme2'], rawTubeIds: ['recTube2'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
    return authenticateSession();
  });

  test('adding attachments', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      uploadFile() { }
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(find('[data-test-modify-challenge-button]'));

    const file = new File([], 'challenge-attachment.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-attachment] input', file);

    await runTask(this, async () => { }, 400);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments.length, 1);
  });

  test('replace attachment', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      uploadFile() { }
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageService = this.owner.lookup('service:storage');
    const attachmentA = new File([], 'challenge-attachmentA.png', { type: 'image/png' });
    const attachmentB = new File([], 'challenge-attachmentB.png', { type: 'image/png' });
    const uploadFileStub = sinon.stub(storageService, 'uploadFile');
    uploadFileStub.withArgs({ file: sinon.match({ file: attachmentA }), filename: 'challenge-attachmentA.png', isAttachment: true }).resolves({ url: 'data-attachmentA:,', filename: 'attachment-nameA' });
    uploadFileStub.withArgs({ file: sinon.match({ file: attachmentB }), filename: 'challenge-attachmentB.png', isAttachment: true }).resolves({ url: 'data-attachmentB:,', filename: 'attachment-nameB' });

    // when
    // adding attachmentA
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(find('[data-test-modify-challenge-button]'));
    await selectFiles('[data-test-file-input-attachment] input', attachmentA);
    await runTask(this, async () => { }, 400);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    // replace attachmentA with attachmentB
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-attachment-button]'));
    await selectFiles('[data-test-file-input-attachment] input', attachmentB);
    await runTask(this, async () => { }, 400);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = store.peekAll('attachment').slice();

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(uploadFileStub.calledTwice);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments.length, 1);
    assert.strictEqual(attachments[0].url, 'data-attachmentB:,');
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
        'type': 'image/png',
      }],
      filesIds: ['recAttachment1'],
      skillId: 'recSkill2',
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'attachment', challengeId: 'recChallenge2', filename: 'attachment.png' });

    // when
    await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-attachment-button]'));

    await runTask(this, async () => { }, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.strictEqual(attachments.length, 0);
    assert.ok(attachments.every((record) => !record.isDeleted));
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
        'type': 'image/png',
      }],
      filesIds: ['recAttachment1'],
      skillId: 'recSkill2',
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'attachment', challengeId: 'recChallenge2', filename: 'attachment.png' });

    // when
    await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-attachment-button]'));

    await runTask(this, async () => { }, 200);
    await click(find('[data-test-cancel-challenge-button]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Modification annulée');
    assert.strictEqual(attachments.length, 1);
    assert.ok(attachments.every((record) => !record.isDeleted));
  });
});

