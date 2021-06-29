import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Unit | Controller | competence/prototypes/single', function (hooks) {
  setupTest(hooks);
  let controller, messageStub, startStub, stopStub;

  hooks.beforeEach(function () {
    //given
    controller = this.owner.lookup('controller:competence/prototypes/single');

    startStub = sinon.stub();
    stopStub = sinon.stub();
    class LoaderService extends Service {
      start = startStub;
      stop = stopStub;
    }
    this.owner.register('service:loader', LoaderService);

    class ConfirmService extends Service {
      ask = sinon.stub().resolves()
    }
    this.owner.register('service:confirm', ConfirmService);
    messageStub = sinon.stub();
    controller._message = messageStub;
  });

  module('It should save challenge', function(hooks) {
    let saveCheckStub, handleIllustrationStub, handleAttachmentStub, saveChallengeStub, saveAttachmentsStub, handleChangelogStub,
      challenge;

    hooks.beforeEach(function () {

      challenge = {
        id: 'rec123456'
      };
      controller.model = challenge;

      saveCheckStub = sinon.stub().resolves(challenge);
      controller._saveCheck = saveCheckStub;

      handleIllustrationStub = sinon.stub().resolves(challenge);
      controller._handleIllustration = handleIllustrationStub;

      handleAttachmentStub = sinon.stub().resolves(challenge);
      controller._handleAttachments = handleAttachmentStub;

      saveChallengeStub = sinon.stub().resolves(challenge);
      controller._saveChallenge = saveChallengeStub;

      saveAttachmentsStub = sinon.stub().resolves(challenge);
      controller._saveAttachments = saveAttachmentsStub;

      handleChangelogStub = sinon.stub().resolves(challenge);
      controller._handleChangelog = handleChangelogStub;

      controller.wasMaximized = true;
    });

    test('it should call handler with appropriate args', async function(assert) {
      // given
      const changelog = 'some changelog';

      // when
      await controller._saveChallengeCallback(changelog);

      // then
      assert.ok(startStub.calledOnce);
      assert.ok(saveCheckStub.calledWith(challenge));
      assert.ok(handleIllustrationStub.calledWith(challenge));
      assert.ok(handleAttachmentStub.calledWith(challenge));
      assert.ok(saveChallengeStub.calledWith(challenge));
      assert.ok(saveAttachmentsStub.calledWith(challenge));
      assert.ok(handleChangelogStub.calledWith(challenge, changelog));
      assert.ok(messageStub.calledWith('Épreuve mise à jour'));
      assert.ok(stopStub.calledOnce);

    });

    test('it should reinitialize edition',  async function(assert) {
      // given
      controller.edition = true;
      controller.displayAlternativeInstructionsField = true;
      controller.displaySolutionToDisplayField = true;

      // when
      await controller._saveChallengeCallback();

      // then
      assert.notOk(controller.displayAlternativeInstructionsField);
      assert.notOk(controller.displaySolutionToDisplayField);
      assert.notOk(controller.edition);
    });

    test('it should catch error if saving is wrong', async function(assert) {
      // given
      const errorMessageStub = sinon.stub();
      controller._errorMessage = errorMessageStub;

      const wrongSaveCheckStub = sinon.stub().rejects();
      controller._saveCheck = wrongSaveCheckStub;
      // when
      await controller._saveChallengeCallback();

      // then
      assert.ok(wrongSaveCheckStub.calledOnce);
      assert.ok(errorMessageStub.calledWith('Erreur lors de la mise à jour'));
    });
  });

  module('on prototype validation', function (hooks) {
    let prototype1_1, prototype2_1, prototype2_2, challenge1_1, challenge2_1, challenge2_2, skill1, skill2, tube;

    hooks.beforeEach(function () {
      const saveStub = sinon.stub().resolves({});
      const store = this.owner.lookup('service:store');

      prototype1_1 = store.createRecord('challenge', {
        id: 'rec_proto1_1',
        pixId: 'pix_proto1_1',
        genealogy: 'Prototype 1',
        status: 'proposé',
        save: saveStub
      });
      challenge1_1 = store.createRecord('challenge', {
        id: 'rec_challenge1_1',
        pixId: 'pix_challenge1_1',
        status: 'proposé',
        save: saveStub
      });
      prototype2_1 = store.createRecord('challenge', {
        id: 'rec_proto2_1',
        pixId: 'pix_proto2_1',
        status: 'validé',
        genealogy: 'Prototype 1',
        save: saveStub
      });
      challenge2_1 = store.createRecord('challenge', {
        id: 'rec_challenge2_1',
        pixId: 'pix_challenge2_1',
        status: 'validé',
        save: saveStub
      });
      prototype2_2 = store.createRecord('challenge', {
        id: 'rec_proto2_2',
        pixId: 'pix_proto2_2',
        status: 'proposé',
        genealogy: 'Prototype 1',
        save: saveStub
      });
      challenge2_2 = store.createRecord('challenge', {
        id: 'rec_challenge2_2',
        pixId: 'pix_challenge2_2',
        status: 'proposé',
        save: saveStub
      });
      skill1 = store.createRecord('skill', {
        id: 'rec_skill1',
        pixId: 'pix_skill1',
        status: 'en construction',
        level:1,
        challenges: [prototype1_1, challenge1_1],
        save: saveStub
      });
      skill2 = store.createRecord('skill', {
        id: 'rec_skill2',
        pixId: 'pix_skill2',
        status: 'actif',
        level:1,
        challenges: [prototype2_1, challenge2_1, prototype2_2, challenge2_2],
        save: saveStub
      });
      tube = run(() => {
        return store.createRecord('tube', {
          id: 'rec_tube',
          skills: [skill1, skill2]
        });
      });
      tube.skills.forEach(skill=>{
        skill.tube = tube;
      });
    });

    test('it should archive previous active prototype and alternatives or delete draft alternative', async function (assert) {
      //when
      await controller._archivePreviousPrototype(prototype2_2);

      //then
      assert.equal(prototype2_1.status, 'archivé');
      assert.equal(challenge2_1.status, 'archivé');
      assert.equal(challenge2_2.status, 'périmé');
    });

    test('it should archive the actual validated skill and is associated validated challenges or delete draft challenges if is an other version', async function (assert) {
      //when
      await controller._archiveOtherActiveSkillVersion(prototype1_1);

      //then
      assert.equal(skill2.status, 'archivé');
      assert.equal(prototype2_1.status, 'archivé');
      assert.equal(challenge2_1.status, 'archivé');
      assert.equal(prototype2_2.status, 'périmé');
      assert.equal(challenge2_2.status, 'périmé');
    });

    test('it should validate skill', async function (assert) {
      //given
      prototype1_1.validate();

      //when
      await controller._checkSkillsValidation(prototype1_1);

      //then
      assert.equal(skill1.status, 'actif');
    });

    test('it should validate alternatives', async function (assert) {
      //given
      prototype1_1.validate();

      //when
      await controller._validateAlternatives(prototype1_1);

      //then
      assert.equal(challenge1_1.status, 'validé');
    });
  });

  test('it should cancel edition', async function(assert) {
    // given
    controller.edition = true;
    controller.displayAlternativeInstructionsField = true;
    controller.displaySolutionToDisplayField = true;
    controller.wasMaximized = true;
    const rollbackAttributesStub = sinon.stub();
    const challenge = EmberObject.create({
      id: 'recChallenge',
      files: [],
      rollbackAttributes: rollbackAttributesStub
    });
    controller.model = challenge;

    // when
    await controller.cancelEdit();

    // then
    assert.notOk(controller.displayAlternativeInstructionsField);
    assert.notOk(controller.displaySolutionToDisplayField);
    assert.notOk(controller.edition);
    assert.ok(rollbackAttributesStub.calledOnce);
    assert.ok(messageStub.calledWith('Modification annulée'));
  });

  module('_handleIllustration', function(hooks) {
    let challenge;
    let storageServiceStub;
    let storeServiceStub;
    let loaderServiceStub;
    let controller;

    hooks.beforeEach(function() {
      challenge = EmberObject.create({
        id: 'recChallenge',
        illustration: {
          filename: 'attachment-name',
          size: 123,
          mimeType: 'image/png',
          type: 'illustration',
          isNew: true,
        }
      });

      storageServiceStub = {
        uploadFile: sinon.stub().resolves({
          url: 'data:,',
          filename: 'attachment-name',
          size: 123,
          type: 'image/png'
        })
      };

      storeServiceStub = { createRecord: sinon.stub().returns({ save() {} }) };

      loaderServiceStub = { start: sinon.stub() };

      controller = this.owner.lookup('controller:competence/prototypes/single');
      controller.storage = storageServiceStub;
      controller.loader = loaderServiceStub;
      controller.store = storeServiceStub;
    });

    test('it uploads file', async function(assert) {
      // given
      const expectedIllustration = {
        url: 'data:,',
        filename: 'attachment-name',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        isNew: true,
      };

      // when
      await controller._handleIllustration(challenge);

      // then
      assert.ok(storageServiceStub.uploadFile.calledOnce);
      assert.ok(loaderServiceStub.start.calledWith('Envoi de l\'illustration...'));
      assert.deepEqual(challenge.illustration, expectedIllustration);
    });
  });

  module('_saveAttachments', function(hooks) {
    let challenge;
    let storeServiceStub;
    let controller;

    hooks.beforeEach(function() {
      challenge = EmberObject.create({
        id: 'recChallenge',
        files: [
          { save: sinon.stub().resolves() }
        ]
      });

      controller = this.owner.lookup('controller:competence/prototypes/single');
      controller.store = storeServiceStub;
    });

    test('it saves attachments', async function(assert) {
      // when
      await controller._saveAttachments(challenge);

      // then
      assert.ok(challenge.files[0].save.calledWith());
    });

  });

  module('_handleAttachments', function(hooks) {
    let challenge;
    let storageServiceStub;
    let storeServiceStub;
    let loaderServiceStub;
    let controller;

    hooks.beforeEach(function() {

      storeServiceStub = { createRecord: sinon.stub().returns({ save() {} }) };

      loaderServiceStub = { start: sinon.stub() };

      controller = this.owner.lookup('controller:competence/prototypes/single');
      controller.loader = loaderServiceStub;
      controller.store = storeServiceStub;

    });

    test('it uploads one file', async function(assert) {
      // given
      const attachmentBaseName = 'attachment-base-name';
      challenge = EmberObject.create({
        id: 'recChallenge',
        attachmentBaseName,
        baseNameUpdated: sinon.stub().returns(false),
        attachments: [{
          filename: `${attachmentBaseName}.pdf`,
          file: {
            name: `${attachmentBaseName}.pdf`,
            filePath: '',
            size: 123,
            type: 'application/pdf',
          },
          isNew: true,
        },
        ],
        files:[]
      });

      storageServiceStub = {
        uploadFile: sinon.stub().resolves({
          url: 'data:,',
          filename: challenge.attachmentBaseName + '.pdf',
        })
      };
      controller.storage = storageServiceStub;

      const expectedAttachment = [{
        file: {
          filePath: '',
          name: 'attachment-base-name.pdf',
          size: 123,
          type: 'application/pdf'
        },
        filename: 'attachment-base-name.pdf',
        isNew: true,
        url: 'data:,'
      }];

      // when
      await controller._handleAttachments(challenge);

      // then
      assert.ok(storageServiceStub.uploadFile.calledOnce);
      assert.ok(loaderServiceStub.start.calledWith('Gestion des pièces jointes...'));
      assert.deepEqual(challenge.attachments, expectedAttachment);
    });

    test('it uploads two files', async function(assert) {
      // given
      const attachmentBaseName = 'attachment-base-name';
      challenge = EmberObject.create({
        id: 'recChallenge',
        attachmentBaseName,
        baseNameUpdated: sinon.stub().returns(true),
        attachments: [{
          filename: `${attachmentBaseName}.doc`,
          file: {
            name: `${attachmentBaseName}.doc`,
            size: 123,
            type: 'application/msword',
          },
          isNew: true,
        }, {
          filename: `${attachmentBaseName}.pdf`,
          file: {
            name: `${attachmentBaseName}.pdf`,
            size: 123,
            type: 'application/pdf',
          },
          isNew: true,
        }],
        files:[]
      });

      const uploadFileStub = sinon.stub();
      uploadFileStub.onFirstCall().resolves({
        url: 'data:,',
      });
      uploadFileStub.onSecondCall().resolves({
        url: 'data:,',
      });
      storageServiceStub = {
        uploadFile: uploadFileStub,
        renameFile: sinon.stub(),
      };
      controller.storage = storageServiceStub;

      const expectedAttachements = [{
        filename: `${attachmentBaseName}.doc`,
        url: 'data:,',
        file: {
          name: `${attachmentBaseName}.doc`,
          size: 123,
          type: 'application/msword',
        },
        isNew: true,
      }, {
        filename: `${attachmentBaseName}.pdf`,
        url: 'data:,',
        file: {
          name: `${attachmentBaseName}.pdf`,
          size: 123,
          type: 'application/pdf',
        },
        isNew: true,
      }];

      // when
      const newChallenge = await controller._handleAttachments(challenge);

      // then
      assert.ok(storageServiceStub.uploadFile.calledTwice);
      assert.ok(loaderServiceStub.start.calledWith('Gestion des pièces jointes...'));
      assert.deepEqual(newChallenge.attachments, expectedAttachements);
    });

    test('it renames attachments', async function (assert) {
      const attachmentBaseName = 'attachment-base-name';
      challenge = EmberObject.create({
        id: 'recChallenge',
        attachmentBaseName: 'updated-base-name',
        baseNameUpdated: () => true,
        files: [{
          filename: attachmentBaseName + '.pdf',
          url: 'data:,',
          size: 123,
          mimeType: 'application/pdf',
          type: 'attachment',
        }, {
          filename: attachmentBaseName + '.png',
          url: 'data:,',
          size: 456,
          mimeType: 'image/png',
          type: 'illustration',
        }]
      });

      challenge.files.forEach((file) => file.challenge = challenge);
      challenge.attachments = challenge.files.filter(file => file.type === 'attachment');
      storageServiceStub = {
        renameFile: sinon.stub().resolves(),
      };
      controller.storage = storageServiceStub;

      const expectedPdfAttachement = {
        filename: 'updated-base-name.pdf',
        url: 'data:,',
        size: 123,
        mimeType: 'application/pdf',
        type: 'attachment',
        challenge
      };
      const expectedIllustration = {
        filename: 'attachment-base-name.png',
        url: 'data:,',
        size: 456,
        mimeType: 'image/png',
        type: 'illustration',
        challenge
      };

      // when
      await controller._handleAttachments(challenge);

      // then
      assert.deepEqual(challenge.files, [expectedPdfAttachement, expectedIllustration]);
      assert.true(storageServiceStub.renameFile.calledOnce);
    });
  });
});
