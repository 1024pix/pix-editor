import Service from '@ember/service';
import { click, find, findAll, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import { runTask } from 'ember-lifeline';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | Modify-Challenge-Illustration', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1' });
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

  test('adding illustration', async function(assert) {
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

    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => { }, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isNew));
  });

  test('replace illustration', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      uploadFile() { }
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageService = this.owner.lookup('service:storage');
    const illustrationA = new File([], 'challenge-illustrationA.png', { type: 'image/png' });
    const illustrationB = new File([], 'challenge-illustrationB.png', { type: 'image/png' });
    const uploadFileStub = sinon.stub(storageService, 'uploadFile');
    uploadFileStub.withArgs({ file: sinon.match({ file: illustrationA }) }).resolves({ url: 'data-illustrationA:,', filename: 'illustration-nameA' });
    uploadFileStub.withArgs({ file: sinon.match({ file: illustrationB }) }).resolves({ url: 'data-illustrationB:,', filename: 'illustration-nameB' });

    // when
    // adding illustrationA
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(find('[data-test-modify-challenge-button]'));
    await selectFiles('[data-test-file-input-illustration] input', illustrationA);
    await runTask(this, async () => { }, 400);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    // replace illustrationA with illustrationB
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-illustration-button]'));
    await selectFiles('[data-test-file-input-illustration] input', illustrationB);
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
    assert.strictEqual(attachments[0].url, 'data-illustrationB:,');
  });

  test('delete illustration', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      airtableId: 'airtableId2',
      illustration: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/CertificatGUL2020.png',
        'filename': 'Certificat GUL 2020.png',
        'size': 178629,
        'type': 'image/png',
      }],
      filesIds: ['recAttachment1'],
      skillId: 'recSkill2',
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge2' });
    class StorageServiceStub extends Service {
      uploadFile() { }
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-illustration-button]'));

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

  test('update illustration', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      airtableId: 'airtableId2',
      illustration: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/CertificatGUL2020.png',
        'filename': 'Certificat GUL 2020.png',
        'size': 178629,
        'type': 'image/png',
      }],
      filesIds: ['recAttachment1'],
      skillId: 'recSkill2',
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge2' });
    class StorageServiceStub extends Service {
      uploadFile() { }
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await click(find('[data-test-modify-challenge-button]'));
    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => { }, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');
    const challenge = await store.peekRecord('challenge', 'recChallenge2');
    const files = challenge.hasMany('files').value() ?? [];
    const newIllustration = files.find((file) => file.type === 'illustration');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isModified));
    assert.strictEqual(newIllustration.url, 'data:,');
  });

  test('delete and upload a new illustration', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      illustration: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/CertificatGUL2020.png',
        'filename': 'Certificat GUL 2020.png',
        'size': 178629,
        'type': 'image/png',
      }],
      filesIds: ['recAttachment1'],
      skillId: 'recSkill2',
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge2' });
    class StorageServiceStub extends Service {
      uploadFile() { }
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-file-input-illustration] button.file-remove'));
    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => { }, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');
    const challenge = await store.peekRecord('challenge', 'recChallenge2');
    const files = challenge.hasMany('files').value() ?? [];
    const newIllustration = files.find((file) => file.type === 'illustration');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isModified));
    assert.strictEqual(newIllustration.url, 'data:,');
  });

});

