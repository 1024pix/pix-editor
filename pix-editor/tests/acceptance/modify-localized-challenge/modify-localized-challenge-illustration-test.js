import { module, test } from 'qunit';
import sinon from 'sinon';
import { visit, clickByText, within } from '@1024pix/ember-testing-library';
import { findAll, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { runTask } from 'ember-lifeline';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import Service from '@ember/service';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | Modify-Localized-Challenge-Illustration', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1' });
    this.server.create('localizedChallenge', { id: 'recChallenge1', challengeId: 'recChallenge1', locale: 'fr' });
    this.server.create('localizedChallenge', { id: 'recChallenge1NL', challengeId: 'recChallenge1', locale: 'nl' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: [] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recTheme2', name: 'theme2', rawTubeIds: ['recTube2'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds:['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawThemeIds:['recTheme2'], rawTubeIds: ['recTube2'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
    return authenticateSession();
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
    const screen = await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await clickByText('Version nl');
    await clickByText('Modifier');

    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => {}, 200);
    const saveButton = await screen.findByRole('button', { name: 'Enregistrer' });
    await click(saveButton);

    const showImageButton = await screen.findByRole('presentation');
    await click(showImageButton);

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');
    const popIn = await screen.findByTestId('display-illustration-pop-in');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every(record => !record.isNew));
    assert.strictEqual(attachments.length, 1);
    assert.dom(await within(popIn).findByRole('img')).hasAttribute('src', 'data:,');
  });

  test('delete illustration', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      airtableId: 'airtableId2',
      skillId: 'recSkill2',
    });
    this.server.create('localizedChallenge', {
      id: 'recChallenge2NL',
      challengeId: 'recChallenge2',
      illustration: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/CertificatGUL2020.png',
        'filename': 'Certificat GUL 2020.png',
        'size': 178629,
        'type': 'image/png'
      }],
      filesIds: ['recAttachment1'],
      locale: 'nl'
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge2', localizedChallengeId: 'recChallenge2NL' });
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await clickByText('Version nl');
    await clickByText('Modifier');
    await click(find('[data-test-delete-illustration-button]'));

    await runTask(this, async () => {}, 200);
    const saveButton = await screen.findByRole('button', { name: 'Enregistrer' });
    await click(saveButton);

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.strictEqual(attachments.length, 0);
    assert.ok(attachments.every(record => !record.isDeleted));
  });

  test('update illustration', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      airtableId: 'airtableId2',
      skillId: 'recSkill2',
    });
    this.server.create('localizedChallenge', {
      id: 'recChallenge2NL',
      challengeId: 'recChallenge2',
      illustration: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/CertificatGUL2020.png',
        'filename': 'Certificat GUL 2020.png',
        'size': 178629,
        'type': 'image/png'
      }],
      filesIds: ['recAttachment1'],
      locale: 'nl'
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge2', localizedChallengeId: 'recChallenge2NL' });
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await clickByText('Version nl');
    await clickByText('Modifier');

    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => {}, 200);
    const saveButton = await screen.findByRole('button', { name: 'Enregistrer' });
    await click(saveButton);

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');
    const localizedChallenge = await store.peekRecord('localized-challenge', 'recChallenge2NL');
    await localizedChallenge.files;
    const newIllustration  = localizedChallenge.files.findBy('type', 'illustration');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every(record => !record.isModified));
    assert.strictEqual(newIllustration.url, 'data:,');
  });

  test('delete and upload a new illustration', async function(assert) {
    // given
    this.server.create('challenge', {
      id: 'recChallenge2',
      airtableId: 'airtableId2',
      skillId: 'recSkill2',
    });
    this.server.create('localizedChallenge', {
      id: 'recChallenge2NL',
      challengeId: 'recChallenge2',
      illustration: [{
        'id': 'attd74YR8ga7IOfWp',
        'url': 'https://dl.airtable.com/.attachments/b60304a44214d5b6f94d63df59d3516a/d1f1b65b/CertificatGUL2020.png',
        'filename': 'Certificat GUL 2020.png',
        'size': 178629,
        'type': 'image/png'
      }],
      filesIds: ['recAttachment1'],
      locale: 'nl'
    });
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge2', localizedChallengeId: 'recChallenge2NL' });

    class StorageServiceStub extends Service {
      uploadFile() {}
    }
    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit('/competence/recCompetence2.1/prototypes/recChallenge2');
    await clickByText('Version nl');
    await clickByText('Modifier');

    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => {}, 200);
    const saveButton = await screen.findByRole('button', { name: 'Enregistrer' });
    await click(saveButton);

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');
    const localizedChallenge = await store.peekRecord('localized-challenge', 'recChallenge2NL');
    await localizedChallenge.files;
    const newIllustration = localizedChallenge.files.findBy('type', 'illustration');

    // then
    assert.dom('[data-test-main-message]').hasText('Épreuve mise à jour');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every(record => !record.isModified));
    assert.strictEqual(newIllustration.url, 'data:,');
  });

});

