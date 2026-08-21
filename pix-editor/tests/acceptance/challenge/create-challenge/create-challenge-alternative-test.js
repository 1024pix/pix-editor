import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, find, findAll } from '@ember/test-helpers';
import { selectFiles } from 'ember-file-upload/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Acceptance | Controller | Create alternative challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let challenge;
  let skill;

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    challenge = this.server.create('challenge', { id: 'recChallenge1' });
    skill = this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
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
                  prototypeId: challenge.id,
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

  test('create a challenge alternative', async function (assert) {
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
    await click(screen.getByRole('button', { name: 'Déclinaisons >>' }));
    await click(find('[data-test-new-alternative-action]'));
    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    await selectFiles('[data-test-file-input-illustration] input', file);
    await click(find('[data-test-save-challenge-button]'));

    const store = this.owner.lookup('service:store');

    // then
    const attachments = await store.peekAll('attachment');
    assert.dom(screen.getByText('Déclinaison numéro 1 enregistrée')).exists();
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isNew));
  });

  test('create a challenge alternative clone the attachments', async function (assert) {
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
    const screen = await visit('/');
    await click(await screen.findByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: 'Code Title' }));
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(screen.getByRole('button', { name: 'Déclinaisons >>' }));
    await click(find('[data-test-new-alternative-action]'));
    await click(find('[data-test-save-challenge-button]'));

    const store = this.owner.lookup('service:store');

    // then
    const clonedAttachment = await store.peekRecord('attachment', '2');
    assert.dom(screen.getByText('Déclinaison numéro 1 enregistrée')).exists();
    assert.ok(storageServiceStub.cloneFile.calledOnce);
    assert.deepEqual(storageServiceStub.cloneFile.args[0], ['data:1,']);
    assert.notOk(clonedAttachment.isNew);
    assert.strictEqual(clonedAttachment.url, 'data:2,');
  });

  test("create a challenge alternative don't clone deleted attachments", async function (assert) {
    // given
    class StorageServiceStub extends Service {
      cloneFile() {}
    }
    const challenge2 = this.server.create('challenge', { id: 'recChallenge2', filesIds: ['recAttachment1'] });
    this.server.create('attachment', {
      id: 'recAttachment1',
      type: 'attachment',
      url: 'data:,',
      filename: 'test.ods',
      challenge: challenge2,
    });
    skill.update({ challengeIds: ['recChallenge2'] });

    this.owner.register('service:storage', StorageServiceStub);
    const storageServiceStub = this.owner.lookup('service:storage');
    sinon.stub(storageServiceStub, 'cloneFile');

    // when
    const screen = await visit('/competence/recCompetence1.1/prototypes/recChallenge2');
    await click(screen.getByRole('button', { name: 'Déclinaisons >>' }));

    await click(find('[data-test-new-alternative-action]'));
    await click(find('[data-test-save-challenge-button]'));

    await click(findAll('[data-test-modify-challenge-button]')[1]);
    await click(screen.getByRole('button', { name: /Supprimer le fichier/ }));
    await click(find('[data-test-save-challenge-button]'));
    await screen.findByRole('dialog');
    await click(screen.getByRole('button', { name: /Valider/ }));

    // then
    assert.dom(screen.getByText('Déclinaison numéro 1 enregistrée')).exists();
    assert.strictEqual(storageServiceStub.cloneFile.callCount, 1);
  });
});
