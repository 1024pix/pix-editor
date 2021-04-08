import { module, test } from 'qunit';
import { visit, findAll, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { selectFiles } from 'ember-file-upload/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import sinon from 'sinon';
import { mockAuthService } from '../mock-auth';

module('Acceptance | Controller | Create alternative challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;
  let challenge;
  let skill;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    challenge = this.server.create('challenge', { id: 'recChallenge1' });
    skill = this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
  });

  test('create a challenge alternative', async function(assert) {
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
    await click(find('.alternatives'));
    await click(find('[data-test-new-alternative-action]'));
    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);
    await click(find('[data-test-save-challenge-button]'));

    const store = this.owner.lookup('service:store');

    // then
    const attachments = await store.peekAll('attachment');
    assert.dom('[data-test-main-message]').hasText('Déclinaison numéro 1 enregistrée');
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every(record => !record.isNew));
  });

  test('create a challenge alternative clone the attachments', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      cloneFile() {}
    }
    const attachment = this.server.create('attachment', { url: 'data:1,', challenge });
    challenge.update({ filesIds: [attachment.id] });

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'cloneFile').resolves('data:2,');

    // when
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell]')[0]);
    await click(find('.alternatives'));
    await click(find('[data-test-new-alternative-action]'));
    await click(find('[data-test-save-challenge-button]'));

    const store = this.owner.lookup('service:store');

    // then
    const clonedAttachment = await store.peekRecord('attachment', '2');
    assert.dom('[data-test-main-message]').hasText('Déclinaison numéro 1 enregistrée');
    assert.ok(storageServiceStub.cloneFile.calledOnce);
    assert.deepEqual(storageServiceStub.cloneFile.args[0], ['data:1,']);
    assert.notOk(clonedAttachment.isNew);
    assert.equal(clonedAttachment.url, 'data:2,');
  });

  test('create a challenge alternative don\'t clone deleted attachments', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      cloneFile() {}
    }
    const challenge2 = this.server.create('challenge', { id: 'recChallenge2', attachments: [{ url: 'data:,', filename: 'test.ods' }], filesIds: ['recAttachment1'] });
    this.server.create('attachment', { id: 'recAttachment1', type: 'attachment', url: 'data:,', filename: 'test.ods', challenge: challenge2 });
    skill.update({ challengeIds: ['recChallenge2'] });

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'cloneFile');

    // when
    await visit('/competence/recCompetence1.1/prototypes/recChallenge2');
    await click(find('.alternatives'));

    await click(find('[data-test-new-alternative-action]'));
    await click(find('[data-test-save-challenge-button]'));

    await click(findAll('[data-test-modify-challenge-button]')[1]);
    await click(find('[data-test-delete-attachment-button]'));
    await click(find('[data-test-save-challenge-button]'));
    await click(find('[data-test-save-changelog-button]'));

    // then
    assert.dom('[data-test-main-message]').hasText('Déclinaison numéro 1 enregistrée');
    assert.equal(storageServiceStub.cloneFile.callCount, 1);
  });
});
