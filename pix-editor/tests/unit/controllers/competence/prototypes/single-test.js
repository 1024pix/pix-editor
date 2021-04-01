import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Unit | Controller | competence/prototypes/single', function (hooks) {
  setupTest(hooks);
  let controller, messageStub;

  hooks.beforeEach(function () {
    //given
    controller = this.owner.lookup('controller:competence/prototypes/single');

    class ConfirmService extends Service {
      ask = sinon.stub().resolves()
    }
    this.owner.register('service:confirm', ConfirmService);
    messageStub = sinon.stub();
    controller._message = messageStub;
  });

  module('It should save challenge', function(hooks) {
    let saveCheckStub, handleIllustrationStub, handleAttachmentStub, saveChallengeStub, saveAttachmentsStub, handleChangelogStub,
      startStub, stopStub, challenge;

    hooks.beforeEach(function () {
      startStub = sinon.stub();
      stopStub = sinon.stub();
      class LoaderService extends Service {
        start = startStub;
        stop = stopStub;
      }
      this.owner.register('service:loader', LoaderService);

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
        alternativeText: 'alt-illustration',
        illustration: [{
          file: {
            name: 'attachment-name',
            size: 123,
            type: 'image/png'
          }
        }],
        files: []
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
        filename: 'attachment-name'
      };

      // when
      await controller._handleIllustration(challenge);

      // then
      assert.ok(storageServiceStub.uploadFile.calledOnce);
      assert.ok(loaderServiceStub.start.calledWith('Envoi de l\'illustration...'));
      assert.deepEqual(challenge.illustration, [expectedIllustration]);
    });

    test('it creates attachment', async function(assert) {
      // given
      const expectedAttachement = {
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        alt: 'alt-illustration',
        challenge
      };
      const record = { save: sinon.stub().resolves() };
      storeServiceStub.createRecord.returns(record);

      // when
      await controller._handleIllustration(challenge);

      // then
      assert.ok(storeServiceStub.createRecord.calledWith('attachment', expectedAttachement));
      assert.ok(record.save.notCalled);
    });

    test('it updates the attachment', async function(assert) {
      // given
      challenge.files = [{
        id: 'rec_123',
        filename: 'old-attachment-name',
        url: 'data:,',
        size: 654,
        mimeType: 'image/jpeg',
        type: 'illustration',
        alt: 'former-alt-illustration',
      }, {
        id: 'rec_456',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'attachment',
        alt: 'alt-attachment',
      }];

      const expectedNewFile = {
        id: 'rec_123',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        alt: 'alt-illustration',
      };

      // when
      await controller._handleIllustration(challenge);

      // then
      assert.deepEqual(challenge.files[0], expectedNewFile);
    });

    test('it updates the alternative text of illustration', async function(assert) {
      // given
      challenge.files = [{
        id: 'rec_123',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        alt: 'former-alt-illustration',
      }, {
        id: 'rec_456',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'attachment',
        alt: 'alt-attachment',
      }];
      challenge.alternativeText = 'new-alt-illustration';
      challenge.illustration = [];

      const expectedNewFile = {
        id: 'rec_123',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        alt: 'new-alt-illustration',
      };

      // when
      await controller._handleIllustration(challenge);

      // then
      assert.deepEqual(challenge.files[0], expectedNewFile);
    });

    test('it removes the alternative text of illustration', async function(assert) {
      // given
      challenge.files = [{
        id: 'rec_123',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        alt: 'former-alt-illustration',
      }, {
        id: 'rec_456',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'attachment',
        alt: 'alt-attachment',
      }];
      challenge.alternativeText = '';
      challenge.illustration = [];

      const expectedNewFile = {
        id: 'rec_123',
        filename: 'attachment-name',
        url: 'data:,',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        alt: '',
      };

      // when
      await controller._handleIllustration(challenge);

      // then
      assert.deepEqual(challenge.files[0], expectedNewFile);
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
        baseNameUpdated: sinon.stub().returns(true),
        attachments: [{
          file: {
            name: attachmentBaseName + '.pdf',
            filePath: '',
            baseNameUpdated: true,
            size: 123,
            type: 'application/pdf'
          },
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

      const expectedAttachement = [{
        url: 'data:,',
        filename: 'attachment-base-name.pdf',
      }];

      // when
      await controller._handleAttachments(challenge);

      // then
      assert.ok(storageServiceStub.uploadFile.calledOnce);
      assert.ok(loaderServiceStub.start.calledWith('Gestion des pièces jointes...'));
      assert.deepEqual(challenge.attachments, expectedAttachement);
    });

    test('it uploads two files', async function(assert) {
      // given
      const attachmentBaseName = 'attachment-base-name';
      challenge = EmberObject.create({
        id: 'recChallenge',
        attachmentBaseName,
        baseNameUpdated: sinon.stub().returns(true),
        attachments: [{
          file: {
            name: attachmentBaseName + '.doc',
            size: 123,
            type: 'application/msword',
          },
        }, {
          file: {
            name: attachmentBaseName + '.pdf',
            size: 123,
            type: 'application/pdf',
          },
        }],
        files:[]
      });

      const uploadFileStub = sinon.stub();
      uploadFileStub.onFirstCall().resolves({
        url: 'data:,',
        filename: challenge.attachmentBaseName + '.doc',
        size: 123,
        type: 'application/msdoc'
      });
      uploadFileStub.onSecondCall().resolves({
        url: 'data:,',
        filename: challenge.attachmentBaseName + '.pdf',
        size: 456,
        type: 'application/pdf'
      });
      storageServiceStub = {
        uploadFile: uploadFileStub
      };
      controller.storage = storageServiceStub;

      const expectedAttachements = [{
        url: 'data:,',
        filename: 'attachment-base-name.doc',
      }, {
        url: 'data:,',
        filename: 'attachment-base-name.pdf',
      }];

      // when
      const newChallenge = await controller._handleAttachments(challenge);

      // then
      assert.ok(storageServiceStub.uploadFile.calledTwice);
      assert.ok(loaderServiceStub.start.calledWith('Gestion des pièces jointes...'));
      assert.deepEqual(newChallenge.attachments, expectedAttachements);
    });

    test('it creates attachments', async function (assert) {
      const attachmentBaseName = 'attachment-base-name';
      challenge = EmberObject.create({
        id: 'recChallenge',
        attachmentBaseName,
        baseNameUpdated: () => false,
        attachments: [{
          file: {
            name: attachmentBaseName + '.pdf',
            size: 123,
            type: 'application/pdf',
          },
        }, {
          file: {
            name: attachmentBaseName + '.doc',
            size: 456,
            type: 'application/msdoc',
          },
        }],
        files: []
      });

      const uploadFileStub = sinon.stub();
      uploadFileStub.onFirstCall().resolves({
        filename: challenge.attachmentBaseName + '.pdf',
        url: 'data:,',
        size: 123,
        type: 'application/pdf'
      });
      uploadFileStub.onSecondCall().resolves({
        filename: challenge.attachmentBaseName + '.doc',
        url: 'data:,',
        size: 456,
        type: 'application/msdoc'
      });

      storageServiceStub = {
        uploadFile: uploadFileStub
      };
      controller.storage = storageServiceStub;

      const expectedPdfAttachement = {
        filename: 'attachment-base-name.pdf',
        url: 'data:,',
        size: 123,
        mimeType: 'application/pdf',
        type: 'attachment',
        challenge
      };
      const expectedDocAttachement = {
        filename: 'attachment-base-name.doc',
        url: 'data:,',
        size: 456,
        mimeType: 'application/msdoc',
        type: 'attachment',
        challenge
      };

      const record = { save: sinon.stub().resolves() };
      storeServiceStub.createRecord.returns(record);

      // when
      await controller._handleAttachments(challenge);

      // then
      assert.ok(storeServiceStub.createRecord.calledWith('attachment', expectedPdfAttachement));
      assert.ok(storeServiceStub.createRecord.calledWith('attachment', expectedDocAttachement));
    });

    test('it renames attachments', async function (assert) {
      const attachmentBaseName = 'attachment-base-name';
      challenge = EmberObject.create({
        id: 'recChallenge',
        attachmentBaseName: 'updated-base-name',
        baseNameUpdated: () => true,
        attachments: [{
          filename: attachmentBaseName + '.pdf',
          size: 123,
          type: 'application/pdf',
        }, {
          filename: attachmentBaseName + '.doc',
          size: 456,
          type: 'application/msdoc',
        }],
        files: [{
          filename: attachmentBaseName + '.pdf',
          url: 'data:,',
          size: 123,
          mimeType: 'application/pdf',
          type: 'attachment',
        }, {
          filename: attachmentBaseName + '.doc',
          url: 'data:,',
          size: 456,
          mimeType: 'application/msdoc',
          type: 'illustration',
        }]
      });

      challenge.files.forEach((file) => file.challenge = challenge);

      const expectedPdfAttachement = {
        filename: 'updated-base-name.pdf',
        url: 'data:,',
        size: 123,
        mimeType: 'application/pdf',
        type: 'attachment',
        challenge
      };
      const expectedIllustration = {
        filename: 'attachment-base-name.doc',
        url: 'data:,',
        size: 456,
        mimeType: 'application/msdoc',
        type: 'illustration',
        challenge
      };

      // when
      await controller._handleAttachments(challenge);

      // then
      assert.deepEqual(challenge.files, [expectedPdfAttachement, expectedIllustration]);
    });

  });
});
