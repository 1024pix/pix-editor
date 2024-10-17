import { clickByText, visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, find } from '@ember/test-helpers';
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

    this.server.create('competence', { id: 'recCompetence1.1', code: '1', title: 'Titre compétence', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1', 'recThemeWorkbench'], rawTubeIds: ['recTube1', 'recTubeWorkbench'] });
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
    const screen = await visit('/');
    await clickByText('1. Information et données');
    await clickByText('1 Titre compétence');
    await clickByText('Atelier');
    await clickByText('Nouveau prototype');
    await selectFiles('[data-test-file-input-illustration] input', illustrationFile);
    await selectFiles('[data-test-file-input-attachment] input', attachmentFile);
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await clickByText('Épreuve de sensibilisation');
    await clickByText('Accès GAFAM requis');
    await clickByText('Formulation à revoir');
    await clickByText('Incompatible iPad certif');
    await clickByText('Sourds et malentendants');
    await click(await screen.findByRole('option', { name: 'RAS' }));
    await delay(100);
    await clickByText('Non voyant');
    await click(await screen.findByRole('option', { name: 'OK' }));
    await delay(100);
    await clickByText('Daltonien');
    await click(await screen.findByRole('option', { name: 'KO' }));
    await delay(100);
    await clickByText('Spoil');
    await click(await screen.findByRole('option', { name: 'Facilement Sp' }));
    await clickByText('Responsive');
    await click(await screen.findByRole('option', { name: 'Non' }));
    await click(find('[data-test-save-challenge-button]'));

    // then
    const store = this.owner.lookup('service:store');
    const attachments = store.peekAll('attachment').slice();
    assert.dom('[data-test-main-message]').hasText('Prototype enregistré');
    assert.ok(uploadFileStub.calledTwice);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments[0].url, 'data_illustration:,');
    assert.strictEqual(attachments[1].url, 'data_attachment:,');
    assert.dom(await find('[data-test-save-challenge-button]')).doesNotExist();
    assert.strictEqual((await screen.getByLabelText('Sourds et malentendants')).childNodes[3].textContent, 'RAS');
    assert.strictEqual((await screen.getByLabelText('Non voyant')).childNodes[3].textContent, 'OK');
    assert.strictEqual((await screen.getByLabelText('Daltonien')).childNodes[3].textContent, 'KO');
    assert.strictEqual((await screen.getByLabelText('Spoil')).childNodes[3].textContent, 'Facilement Sp');
    assert.true(screen.getByRole('checkbox', { name: 'Épreuve de sensibilisation' }).checked);
    assert.true(screen.getByRole('checkbox', { name: 'Accès GAFAM requis' }).checked);
    assert.true(screen.getByRole('checkbox', { name: 'Formulation à revoir' }).checked);
    assert.true(screen.getByRole('checkbox', { name: 'Incompatible iPad certif' }).checked);
    assert.strictEqual((await screen.getByLabelText('Responsive')).childNodes[3].textContent, 'Non');
  });
});

