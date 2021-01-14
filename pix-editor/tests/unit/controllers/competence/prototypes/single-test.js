import { module, test, setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Unit | Controller | competence/prototypes/single', function (hooks) {
  setupTest(hooks);
  let controller, store, prototype1_1, prototype2_1, prototype2_2, challenge1_1, challenge2_1, challenge2_2, skill1, skill2, tube;
  hooks.beforeEach(function () {
    //given
    controller = this.owner.lookup('controller:competence/prototypes/single');
    store = this.owner.lookup('service:store');

    const confirmServiceStub = Service.extend({
      ask: sinon.stub().resolves()
    });
    this.owner.unregister('service:confirm');
    this.owner.register('service:confirm', confirmServiceStub);
    controller._message = sinon.stub();

    const saveStub = sinon.stub().resolves({});

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
  module('on prototype validation', function () {
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

  module('_handleIllustration', function(hooks) {
    let challenge;
    let storageServiceStub;
    let storeServiceStub;
    let loaderServiceStub;
    let controller;
    let expectedIllustration;

    hooks.beforeEach(function() {
      challenge = EmberObject.create({
        id: 'recChallenge',
        illustration: [{
          file: {
            name: 'attachment-name',
            size: 123,
            type: 'image/png'
          }
        }]
      });
      expectedIllustration = { url: 'data:,', filename: 'attachment-name' };

      storageServiceStub = {
        uploadFile: sinon.stub().resolves(expectedIllustration)
      };

      storeServiceStub = { createRecord: sinon.stub().returns({ save() {} }) };

      loaderServiceStub = { start: sinon.stub() };

      controller = this.owner.lookup('controller:competence/prototypes/single');
      controller.storage = storageServiceStub;
      controller.loader = loaderServiceStub;
      controller.store = storeServiceStub;
    });

    test('it uploads file', async function(assert) {
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

  });
});
