import Service from '@ember/service';
import { click, find, findAll, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Create-Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1' });
    this.server.create('challenge', { id: 'recChallenge2' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
    this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge2'] });
    this.server.create('skill', { id: 'recSkillWorkbench', name: '@workbench', code: null });

    this.server.create('tube', { id: 'recTube1', name: 'monTube', rawSkillIds: ['recSkill1'] });
    this.server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
    this.server.create('tube', { id: 'recTubeWorkbench', name: '@workbench', rawSkillIds: ['recSkillWorkbench'] });

    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('theme', { id: 'recTheme2', name: 'monTheme2', rawTubeIds: ['recTube2'] });
    this.server.create('theme', { id: 'recThemeWorkbench', name: 'workbench_1_1', rawSkillIds: ['recTubeWorkbench'] });

    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1', 'recThemeWorkbench'], rawTubeIds: ['recTube1', 'recTubeWorkbench'] });
    this.server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawThemeIds: ['recTheme2'], rawTubeIds: ['recTube2'] });

    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
    return authenticateSession();
  });

  test('creating a new challenge', async function(assert) {
    // given
    class StorageServiceStub extends Service {
      uploadFile() { }
    }

    this.owner.register('service:storage', StorageServiceStub);
    const storageService = this.owner.lookup('service:storage');
    const illustrationFile = new File([], 'challenge-illustration.png', { type: 'image/png' });
    const attachmentFile = new File([], 'challenge-attachment.csv', { type: 'text/csv' });
    const uploadFileStub = sinon.stub(storageService, 'uploadFile');
    uploadFileStub.withArgs({ file: sinon.match({ file: illustrationFile }) })
      .resolves({ url: 'data_illustration:,', filename: 'illustration-name' });
    uploadFileStub.withArgs({ file: sinon.match({ file: attachmentFile }), filename: 'challenge-attachment.csv', isAttachment: true })
      .resolves({ url: 'data_attachment:,', filename: 'attachment-name' });

    // when
    await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(find('.workbench'));
    await click(find('[data-test-create-new-challenge]'));
    await selectFiles('[data-test-file-input-illustration] input', illustrationFile);
    await selectFiles('[data-test-file-input-attachment] input', attachmentFile);
    await click(find('[data-test-save-challenge-button]'));

    // then
    const store = this.owner.lookup('service:store');
    const attachments = store.peekAll('attachment').slice();
    assert.dom('[data-test-main-message]').hasText('Prototype enregistré');
    assert.ok(uploadFileStub.calledTwice);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments[0].url, 'data_illustration:,');
    assert.strictEqual(attachments[1].url, 'data_attachment:,');
  });
});

