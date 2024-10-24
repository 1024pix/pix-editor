import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Unit | Controller | competence/prototypes/single', function(hooks) {
  setupIntlRenderingTest(hooks);
  let controller, messageStub, startStub, stopStub, errorStub;

  hooks.beforeEach(function() {
    //given
    controller = this.owner.lookup('controller:authenticated.competence/prototypes/single');

    startStub = sinon.stub();
    stopStub = sinon.stub();
    class LoaderService extends Service {
      start = startStub;
      stop = stopStub;
    }
    this.owner.register('service:loader', LoaderService);

    errorStub = sinon.stub();
    class NotifyService extends Service {
      error = errorStub;
    }
    this.owner.register('service:notify', NotifyService);

    class ConfirmService extends Service {
      ask = sinon.stub().resolves();
    }
    this.owner.register('service:confirm', ConfirmService);
    messageStub = sinon.stub();
    controller._message = messageStub;
  });

  module('#prototype actions', function(hooks) {
    let proposalPrototype1_1,
      validatePrototype2_1,
      proposalPrototype2_2,
      proposalChallenge1_1,
      validateChallenge2_1,
      proposalChallenge2_2,
      skill1,
      skill2,
      tube;

    hooks.beforeEach(function() {
      const saveStub = sinon.stub().resolves({});
      const store = this.owner.lookup('service:store');

      proposalPrototype1_1 = store.createRecord('challenge', {
        id: 'rec_proto1_1',
        pixId: 'pix_proto1_1',
        genealogy: 'Prototype 1',
        version: 1,
        status: 'proposé',
        save: saveStub,
      });
      proposalChallenge1_1 = store.createRecord('challenge', {
        id: 'rec_challenge1_1',
        pixId: 'pix_challenge1_1',
        status: 'proposé',
        version: 1,
        alternativeVersion: 1,
        save: saveStub,
      });
      validatePrototype2_1 = store.createRecord('challenge', {
        id: 'rec_proto2_1',
        pixId: 'pix_proto2_1',
        status: 'validé',
        version: 1,
        genealogy: 'Prototype 1',
        save: saveStub,
      });
      validateChallenge2_1 = store.createRecord('challenge', {
        id: 'rec_challenge2_1',
        pixId: 'pix_challenge2_1',
        status: 'validé',
        version: 1,
        save: saveStub,
      });
      proposalPrototype2_2 = store.createRecord('challenge', {
        id: 'rec_proto2_2',
        pixId: 'pix_proto2_2',
        status: 'proposé',
        version: 2,
        genealogy: 'Prototype 1',
        save: saveStub,
      });
      proposalChallenge2_2 = store.createRecord('challenge', {
        id: 'rec_challenge2_2',
        pixId: 'pix_challenge2_2',
        version: 2,
        status: 'proposé',
        save: saveStub,
      });
      skill1 = store.createRecord('skill', {
        id: 'rec_skill1',
        pixId: 'pix_skill1',
        status: 'en construction',
        level: 1,
        challenges: [proposalPrototype1_1, proposalChallenge1_1],
        save: saveStub,
      });
      skill2 = store.createRecord('skill', {
        id: 'rec_skill2',
        pixId: 'pix_skill2',
        status: 'actif',
        level: 1,
        challenges: [validatePrototype2_1, validateChallenge2_1, proposalPrototype2_2, proposalChallenge2_2],
        save: saveStub,
      });
      tube = store.createRecord('tube', {
        id: 'rec_tube',
        skills: [skill1, skill2],
      });
      tube.skills.forEach((skill)=>{
        skill.tube = tube;
      });
    });

    module('on prototype validation', function() {
      test('it should archive previous active prototype and alternatives or delete draft alternative', async function(assert) {
        //given
        proposalChallenge2_2.version = 1;

        //when
        await controller._archivePreviousPrototype(proposalPrototype2_2);

        //then
        assert.strictEqual(validatePrototype2_1.status, 'archivé');
        assert.strictEqual(validateChallenge2_1.status, 'archivé');
        assert.strictEqual(proposalChallenge2_2.status, 'périmé');
      });

      test('it should archive the actual validated skill and is associated validated challenges or delete draft challenges if is an other version', async function(assert) {
        //when
        await controller._archiveOtherActiveSkillVersion(proposalPrototype1_1);

        //then
        assert.strictEqual(skill2.status, 'archivé');
        assert.strictEqual(validatePrototype2_1.status, 'archivé');
        assert.strictEqual(validateChallenge2_1.status, 'archivé');
        assert.strictEqual(proposalPrototype2_2.status, 'périmé');
        assert.strictEqual(proposalChallenge2_2.status, 'périmé');
      });

      test('it should validate skill', async function(assert) {
        //given
        proposalPrototype1_1.validate();

        //when
        await controller._checkSkillValidation(proposalPrototype1_1);

        //then
        assert.strictEqual(skill1.status, 'actif');
      });

      test('it should validate alternatives', async function(assert) {
        //given
        proposalPrototype1_1.validate();

        //when
        await controller._validateAlternatives(proposalPrototype1_1);

        //then
        assert.strictEqual(proposalChallenge1_1.status, 'validé');
      });
    });

    module('on prototype archive', function() {
      test('it should deactivate the current active skill if there is proposal prototype', async function(assert) {
        // when
        await controller._archiveOrDeactivateSkill(validatePrototype2_1);

        // then
        assert.strictEqual(skill2.status, 'en construction');
      });
      test('it should archive the current active skill if there is no proposal prototype', async function(assert) {
        // given
        proposalPrototype2_2.archive();

        // when
        await controller._archiveOrDeactivateSkill(validatePrototype2_1);

        // then
        assert.strictEqual(skill2.status, 'archivé');
      });
      test('it should not change the skill status if is not a production prototype', async function(assert) {
        // when
        await controller._archiveOrDeactivateSkill(proposalPrototype2_2);

        // then
        assert.strictEqual(skill2.status, 'actif');
        assert.strictEqual(skill1.status, 'en construction');
      });
      test('it should archive alternatives', async function(assert) {
        // when
        await controller._archiveAlternatives(validatePrototype2_1);

        // then
        assert.strictEqual(validateChallenge2_1.status, 'archivé');
      });
    });

    module('on prototype obsolete', function() {
      test('it should obsolete alternative', async function(assert) {
        // when
        await controller._obsoleteAlternatives(validatePrototype2_1);

        // then
        assert.strictEqual(validateChallenge2_1.status, 'périmé');
      });
      test('it should deactivate the current active skill if there is proposal prototype', async function(assert) {
        // when
        await controller._obsoleteArchiveOrDeactivateSkill(validatePrototype2_1);

        // then
        assert.strictEqual(skill2.status, 'en construction');
      });
      test('it should archive the current active skill if there is archive prototype', async function(assert) {
        // given
        await proposalPrototype2_2.archive();

        // when
        await controller._obsoleteArchiveOrDeactivateSkill(validatePrototype2_1);

        // then
        assert.strictEqual(skill2.status, 'archivé');
      });
      test('it should delete the current active skill if there is no archive or proposal prototype', async function(assert) {
        // given
        await proposalPrototype2_2.obsolete();

        // when
        await controller._obsoleteArchiveOrDeactivateSkill(validatePrototype2_1);

        // then
        assert.strictEqual(skill2.status, 'périmé');
      });
      test('it should not change the skill status if is not a production prototype', async function(assert) {
        // when
        await controller._obsoleteArchiveOrDeactivateSkill(proposalPrototype2_2);

        // then
        assert.strictEqual(skill2.status, 'actif');
        assert.strictEqual(skill1.status, 'en construction');
      });
    });

    module('#setSkill', function() {
      test('it should display an error message if have no skill', async function(assert) {
        // when
        await controller.setSkill();

        // then
        assert.ok(errorStub.calledWith('Aucun acquis sélectionné'));
      });

      test('it should set a new skill for prototype and is alternative with proper version', async function(assert) {
        // when
        await controller._setSkill(proposalPrototype1_1, skill2);

        // then
        assert.ok(messageStub.calledTwice);
        assert.ok(messageStub.getCalls()[0].calledWith('Changement d\'acquis effectué pour la déclinaison n°1'));
        assert.ok(messageStub.getCalls()[1].calledWith('Changement d\'acquis effectué pour le prototype'));
        assert.strictEqual(proposalChallenge1_1.skill.get('id'), skill2.id);
        assert.strictEqual(proposalChallenge1_1.skill.get('id'), skill2.id);
        assert.strictEqual(proposalChallenge1_1.version, 3);
        assert.strictEqual(proposalChallenge1_1.version, 3);
      });
    });
  });

  test('it should cancel edition', async function(assert) {
    // given
    controller.edition = true;
    controller.wasMaximized = true;
    controller.displayAlternativeInstructionsField = true;
    controller.displaySolutionToDisplayField = true;
    controller.displayUrlsToConsultField = true;
    controller.urlsToConsult = 'http:://other-test.com';
    const rollbackAttributesStub = sinon.stub();
    controller.model = EmberObject.create({
      id: 'recChallenge',
      files: [],
      urlsToConsult: ['http:://test.com'],
      rollbackAttributes: rollbackAttributesStub,
    });

    // when
    await controller.cancelEdit();

    // then
    assert.notOk(controller.displayAlternativeInstructionsField);
    assert.notOk(controller.displaySolutionToDisplayField);
    assert.notOk(controller.displayUrlsToConsultField);
    assert.strictEqual(controller.urlsToConsult, 'http:://test.com');
    assert.notOk(controller.edition);
    assert.ok(rollbackAttributesStub.calledOnce);
    assert.ok(messageStub.calledWith('Modification annulée'));
  });

  module('#removeIllustration', function() {
    test('it should remove illustration', async function(assert) {
      // given
      const deleteRecordStub = sinon.stub();
      const challenge = {
        id: 'recchallenge_1',
        name: 'challenge',
        files: [],
        illustration: {
          id: 'illustration_id',
          filename: 'file_name',
          size: 123,
          mimeType: 'image/png',
          type: 'illustration',
          deleteRecord: deleteRecordStub,
          alt: 'alternative text',
        },
      };
      controller.model = challenge;

      // when
      await controller.removeIllustration();

      // then
      assert.ok(deleteRecordStub.calledOnce);
      assert.strictEqual(controller.deletedFiles.length, 1);
    });
  });

  module('#removeAttachment', function() {
    test('it should remove the attachment', async function(assert) {
      // given
      const deleteRecordStub = sinon.stub();
      const challenge = {
        id: 'recchallenge_1',
        name: 'challenge',
        files: [],
        attachments: [
          {
            id: 'attachment_id',
            filename: 'file_name.pdf',
            size: 123,
            mimeType: 'application/pdf',
            type: 'attachment',
            deleteRecord: deleteRecordStub,
          },
        ],

      };
      controller.model = challenge;

      // when
      await controller.removeAttachment({
        filename: 'file_name.pdf',
      });

      // then
      assert.ok(deleteRecordStub.calledOnce);
      assert.strictEqual(controller.deletedFiles.length, 1);
    });
  });

  module('#UrlsToConsult', function() {
    test('it should reset urlToConsult when urlToConsultField is closed', function(assert) {
      // given
      controller.displayUrlsToConsultField = true;
      controller.urlsToConsult = 'http:://other-test.com';
      controller.invalidUrlsToConsult = 'wrong-test.com';
      controller.model = EmberObject.create({
        id: 'recChallenge',
        files: [],
        urlsToConsult: ['http:://test.com'],
      });

      // when
      controller.setDisplayUrlsToConsultField(false);

      // then
      assert.notOk(controller.displayUrlsToConsultField);
      assert.strictEqual(controller.model.urlsToConsult, null);
      assert.notOk(controller.urlsToConsult);
      assert.notOk(controller.invalidUrlsToConsult);
    });
  });

  module('_saveCheck', function(hooks) {
    let challenge;

    hooks.beforeEach(function() {
      challenge = EmberObject.create({
        id: 'recChallenge',
      });
    });

    test('it returns the challenge when there is no errors', function(assert) {
      assert.ok(controller._saveCheck(challenge));
    });

    test('rejects when autoReply is true and there is no embed url', function(assert) {
      challenge.autoReply = true;
      challenge.embedURL = '';
      assert.notOk(controller._saveCheck(challenge));
      assert.ok(errorStub.calledOnce);
    });

    test('accept any solution on a QCROC', function(assert) {
      challenge.type = 'QROC';
      challenge.solution = `- test
- 'hola
`;
      assert.ok(controller._saveCheck(challenge));
      assert.notOk(errorStub.calledOnce);
    });

    ['QROCM-ind', 'QROCM-dep'].forEach((type) => {
      test('rejects when solution is not a valid YAML on a ' + type, function(assert) {
        challenge.type = type;
        challenge.solution = `- test
- 'hola
`;
        assert.notOk(controller._saveCheck(challenge));
        assert.ok(errorStub.calledOnce);
      });
    });
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
        },
      });

      storageServiceStub = {
        uploadFile: sinon.stub().resolves({
          url: 'data:,',
          filename: 'attachment-name',
          size: 123,
          type: 'image/png',
        }),
      };

      storeServiceStub = { createRecord: sinon.stub().returns({ save() {} }) };

      loaderServiceStub = { start: sinon.stub() };

      controller = this.owner.lookup('controller:authenticated.competence/prototypes/single');
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

  module('_handleAttachments', function(hooks) {
    let challenge;
    let storageServiceStub;
    let storeServiceStub;
    let loaderServiceStub;
    let controller;

    hooks.beforeEach(function() {

      storeServiceStub = { createRecord: sinon.stub().returns({ save() {} }) };

      loaderServiceStub = { start: sinon.stub() };

      controller = this.owner.lookup('controller:authenticated.competence/prototypes/single');
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
        files: [],
      });

      storageServiceStub = {
        uploadFile: sinon.stub().resolves({
          url: 'data:,',
          filename: challenge.attachmentBaseName + '.pdf',
        }),
      };
      controller.storage = storageServiceStub;

      const expectedAttachment = [{
        file: {
          filePath: '',
          name: 'attachment-base-name.pdf',
          size: 123,
          type: 'application/pdf',
        },
        filename: 'attachment-base-name.pdf',
        isNew: true,
        url: 'data:,',
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
        files: [],
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

    test('it renames attachments', async function(assert) {
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
        }],
      });

      challenge.files.forEach((file) => file.challenge = challenge);
      challenge.attachments = challenge.files.filter((file) => file.type === 'attachment');
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
        challenge,
      };
      const expectedIllustration = {
        filename: 'attachment-base-name.png',
        url: 'data:,',
        size: 456,
        mimeType: 'image/png',
        type: 'illustration',
        challenge,
      };

      // when
      await controller._handleAttachments(challenge);

      // then
      assert.deepEqual(challenge.files, [expectedPdfAttachement, expectedIllustration]);
      assert.true(storageServiceStub.renameFile.calledOnce);
    });
  });
});
