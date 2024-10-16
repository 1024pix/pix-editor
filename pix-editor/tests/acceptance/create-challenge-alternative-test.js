import Service from '@ember/service';
import { click, find, findAll, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Controller | Create alternative challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let challenge;
  let skill;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    challenge = this.server.create('challenge', { id: 'recChallenge1' });
    skill = this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('create a challenge alternative', async function(assert) {
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
    assert.ok(attachments.every((record) => !record.isNew));
  });

  test('create a challenge alternative clone the attachments', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      cloneFile() { }
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
    await click(findAll('[data-test-skill-cell-link]')[0]);
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
    assert.strictEqual(clonedAttachment.url, 'data:2,');
  });

  test('create a challenge alternative don\'t clone deleted attachments', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      cloneFile() { }
    }
    const challenge2 = this.server.create('challenge', { id: 'recChallenge2', filesIds: ['recAttachment1'] });
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
    await click(find('[data-test-confirm-log-approve]'));

    // then
    assert.dom('[data-test-main-message]').hasText('Déclinaison numéro 1 enregistrée');
    assert.strictEqual(storageServiceStub.cloneFile.callCount, 1);
  });
});
