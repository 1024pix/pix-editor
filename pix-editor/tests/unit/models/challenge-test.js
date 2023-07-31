import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Model | challenge', function(hooks) {
  setupTest(hooks);
  let store, idGeneratorStub, alternative, prototype;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    class ConfigService extends Service {
      constructor() {
        super(...arguments);
        this.author = 'NEW';
      }
    }
    this.owner.unregister('service:config');
    this.owner.register('service:config', ConfigService);

    idGeneratorStub = { newId: sinon.stub().returns('generatedId') };

    prototype =  {
      id: 'pix_1',
      airtableId: 'rec_1',
      status:'validé',
      genealogy: 'Prototype 1',
      author: 'DEV',
      version: 1,
      skill: store.createRecord('skill', {}),
      idGenerator: idGeneratorStub
    };
    alternative =  {
      id: 'pix_1',
      airtableId: 'rec_1',
      status:'validé',
      author: 'DEV',
      alternativeVersion: 1,
      skill: store.createRecord('skill', {}),
      idGenerator: idGeneratorStub
    };
  });

  module('#duplicate', function() {
    test('it should duplicate challenge to create new prototype version', async function (assert) {
      // given
      const challenge = run(() => store.createRecord('challenge', prototype));

      // when
      const clonedChallenge = await challenge.duplicate();

      // then
      assert.strictEqual(clonedChallenge.constructor.modelName, 'challenge');
      assert.strictEqual(clonedChallenge.id, 'generatedId');
      assert.strictEqual(clonedChallenge.airtableId, undefined);
      assert.strictEqual(clonedChallenge.status, 'proposé');
      assert.deepEqual(clonedChallenge.author, ['NEW']);
      assert.strictEqual(clonedChallenge.version, undefined);
      assert.ok(clonedChallenge.skill);
    });

    test('it should duplicate challenge to create new alternative version', async function (assert) {
      // given
      const challenge = run(() => store.createRecord('challenge', alternative));

      // when
      const clonedChallenge = await challenge.duplicate();

      // then
      assert.strictEqual(clonedChallenge.constructor.modelName, 'challenge');
      assert.strictEqual(clonedChallenge.id, 'generatedId');
      assert.strictEqual(clonedChallenge.status, 'proposé');
      assert.deepEqual(clonedChallenge.author, ['NEW']);
      assert.strictEqual(clonedChallenge.alternativeVersion, undefined);
      assert.ok(clonedChallenge.skill);
    });

    test('it should clone the attachments', async function (assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      const illustration = store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;',  size: 10, mimeType: 'image/png', type: 'illustration', alt: 'alt message', challenge });

      // when
      const clonedChallenge = await challenge.duplicate();

      // then
      assert.strictEqual(clonedChallenge.files.length, 1);
      assert.strictEqual(illustration.url, clonedChallenge.files.firstObject.url);
      assert.notEqual(illustration.id, clonedChallenge.files.firstObject.id);
      assert.ok(clonedChallenge.files.firstObject.cloneBeforeSave);
    });
  });

  module('#copyForDifferentSkill', function() {
    test('it should create a copy of the challenge for a different skill', async function(assert) {
      // given
      const challenge = run(() => store.createRecord('challenge', prototype));

      // when
      const clonedChallenge = await challenge.copyForDifferentSkill();
      const skill = await clonedChallenge.skill;

      // then
      assert.strictEqual(clonedChallenge.constructor.modelName, 'challenge');
      assert.strictEqual(clonedChallenge.id, 'generatedId');
      assert.strictEqual(clonedChallenge.airtableId, undefined);
      assert.strictEqual(clonedChallenge.status, 'proposé');
      assert.notOk(skill);
    });

    test('it should clone the attachments', async function (assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      const illustration = store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;',  size: 10, mimeType: 'image/png', type: 'illustration', alt: 'alt message', challenge });

      // when
      const clonedChallenge = await challenge.copyForDifferentSkill();

      // then
      assert.strictEqual(clonedChallenge.files.length, 1);
      assert.strictEqual(illustration.url, clonedChallenge.files.firstObject.url);
      assert.notEqual(illustration.id, clonedChallenge.files.firstObject.id);
      assert.ok(clonedChallenge.files.firstObject.cloneBeforeSave);
    });
  });

  module('#baseNameUpdated', function() {
    test('it should return true if the base name is updated', function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;',  size: 10, mimeType: 'image/png', type: 'attachment', challenge });

      // when
      challenge.attachmentBaseName = 'otherName';

      // then
      assert.true(challenge.baseNameUpdated());
    });

    test('it should return false if the base name is not updated', function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;',  size: 10, mimeType: 'image/png', type: 'attachment', challenge });

      // when
      challenge.attachmentBaseName = 'filename';

      // then
      assert.false(challenge.baseNameUpdated());
    });

    test('it should return true if the base name undefined', function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;',  size: 10, mimeType: 'image/png', type: 'attachment', challenge });

      // then
      assert.false(challenge.baseNameUpdated());
    });

  });
});
