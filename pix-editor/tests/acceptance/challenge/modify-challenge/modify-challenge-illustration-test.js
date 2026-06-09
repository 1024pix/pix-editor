import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, find, findAll } from '@ember/test-helpers';
import { selectFiles } from 'ember-file-upload/test-support';
import { runTask } from 'ember-lifeline';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Acceptance | Modify-Challenge-Illustration', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    const prototype = this.server.create('challenge', { id: 'recChallenge1' });
    const skill = this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    const tube = this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    const thematic = this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    const competence = this.server.create('competence', {
      id: 'recCompetence1.1',
      pixId: 'pixId recCompetence1.1',
      rawThemeIds: ['recTheme1'],
      rawTubeIds: ['recTube1'],
    });
    this.server.create('competence-overview', {
      id: `${competence.pixId}:challenges-production`,
      thematicOverviews: [
        {
          id: thematic.id,
          name: thematic.name,
          tubeOverviews: [
            {
              id: tube.id,
              name: tube.name,
              skillOverviews: [
                {
                  id: skill.id,
                  name: skill.name,
                  prototypeId: prototype.id,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 1,
                  validatedChallengesCount: 0,
                },
                null,
                null,
                null,
                null,
                null,
                null,
              ],
            },
          ],
        },
      ],
    });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('adding illustration', async function (assert) {
    // given
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit('/');
    await click(await screen.findByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Code Title' }));
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(find('[data-test-modify-challenge-button]'));

    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => {}, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isNew));
  });

  test('replace illustration', async function (assert) {
    // given
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageService = this.owner.lookup('service:storage');
    const illustrationA = new File([], 'challenge-illustrationA.png', { type: 'image/png' });
    const illustrationB = new File([], 'challenge-illustrationB.png', { type: 'image/png' });
    const uploadFileStub = sinon.stub(storageService, 'uploadFile');
    uploadFileStub
      .withArgs({ file: sinon.match({ file: illustrationA }) })
      .resolves({ url: 'data-illustrationA:,', filename: 'illustration-nameA' });
    uploadFileStub
      .withArgs({ file: sinon.match({ file: illustrationB }) })
      .resolves({ url: 'data-illustrationB:,', filename: 'illustration-nameB' });

    // when
    // adding illustrationA
    const screen = await visit('/');
    await click(await screen.findByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Code Title' }));
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(find('[data-test-modify-challenge-button]'));
    await selectFiles('[data-test-file-input-illustration] input', illustrationA);
    await runTask(this, async () => {}, 400);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    // replace illustrationA with illustrationB
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-illustration-button]'));
    await selectFiles('[data-test-file-input-illustration] input', illustrationB);
    await runTask(this, async () => {}, 400);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = store.peekAll('attachment').slice();

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.ok(uploadFileStub.calledTwice);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments.length, 1);
    assert.strictEqual(attachments[0].url, 'data-illustrationB:,');
  });

  test('delete illustration', async function (assert) {
    // given
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge1' });
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit('/competence/recCompetence1.1/prototypes/recChallenge1');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-delete-illustration-button]'));

    await runTask(this, async () => {}, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.strictEqual(attachments.length, 0);
    assert.ok(attachments.every((record) => !record.isDeleted));
  });

  test('update illustration', async function (assert) {
    // given
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge1' });
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit('/competence/recCompetence1.1/prototypes/recChallenge1');
    await click(find('[data-test-modify-challenge-button]'));
    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => {}, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');
    const challenge = await store.peekRecord('challenge', 'recChallenge1');
    const challengeAttachments = challenge.hasMany('attachments').value() ?? [];
    const newIllustration = challengeAttachments.find(
      (challengeAttachment) => challengeAttachment.type === 'illustration',
    );

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isModified));
    assert.strictEqual(newIllustration.url, 'data:,');
  });

  test('delete and upload a new illustration', async function (assert) {
    // given
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'recChallenge1' });
    class StorageServiceStub extends Service {
      uploadFile() {}
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit('/competence/recCompetence1.1/prototypes/recChallenge1');
    await click(find('[data-test-modify-challenge-button]'));
    await click(find('[data-test-file-input-illustration] button.file-remove'));
    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);

    await runTask(this, async () => {}, 200);
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-confirm-log-approve]'));

    const store = this.owner.lookup('service:store');
    const attachments = await store.peekAll('attachment');
    const challenge = await store.peekRecord('challenge', 'recChallenge1');
    const challengeAttachments = challenge.hasMany('attachments').value() ?? [];
    const newIllustration = challengeAttachments.find(
      (challengeAttachment) => challengeAttachment.type === 'illustration',
    );

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isModified));
    assert.strictEqual(newIllustration.url, 'data:,');
  });
});
