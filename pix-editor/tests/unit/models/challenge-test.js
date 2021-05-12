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
      skills: [store.createRecord('skill', {})],
      idGenerator: idGeneratorStub
    };
    alternative =  {
      id: 'pix_1',
      airtableId: 'rec_1',
      status:'validé',
      author: 'DEV',
      alternativeVersion: 1,
      skills: [store.createRecord('skill', {})],
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
      assert.equal(clonedChallenge.constructor.modelName, 'challenge');
      assert.equal(clonedChallenge.id, 'generatedId');
      assert.equal(clonedChallenge.status, 'proposé');
      assert.equal(clonedChallenge.author, 'NEW');
      assert.equal(clonedChallenge.version, null);
      assert.equal(clonedChallenge.skills.length, 1);
    });

    test('it should duplicate challenge to create new alternative version', async function (assert) {
      // given
      const challenge = run(() => store.createRecord('challenge', alternative));

      // when
      const clonedChallenge = await challenge.duplicate();

      // then
      assert.equal(clonedChallenge.constructor.modelName, 'challenge');
      assert.equal(clonedChallenge.id, 'generatedId');
      assert.equal(clonedChallenge.status, 'proposé');
      assert.equal(clonedChallenge.author, 'NEW');
      assert.equal(clonedChallenge.alternativeVersion, null);
      assert.equal(clonedChallenge.skills.length, 1);
    });

    test('it should clone the attachments', async function (assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      const illustration = store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;',  size: 10, mimeType: 'image/png', type: 'illustration', alt: 'alt message', challenge });

      // when
      const clonedChallenge = await challenge.duplicate();

      // then
      assert.equal(clonedChallenge.files.length, 1);
      assert.equal(illustration.url, clonedChallenge.files.firstObject.url);
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

      // then
      assert.equal(clonedChallenge.constructor.modelName, 'challenge');
      assert.equal(clonedChallenge.id, 'generatedId');
      assert.equal(clonedChallenge.status, 'proposé');
      assert.equal(clonedChallenge.skills.length, 0);
    });

    test('it should clone the attachments', async function (assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      const illustration = store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;',  size: 10, mimeType: 'image/png', type: 'illustration', alt: 'alt message', challenge });

      // when
      const clonedChallenge = await challenge.copyForDifferentSkill();

      // then
      assert.equal(clonedChallenge.files.length, 1);
      assert.equal(illustration.url, clonedChallenge.files.firstObject.url);
      assert.notEqual(illustration.id, clonedChallenge.files.firstObject.id);
      assert.ok(clonedChallenge.files.firstObject.cloneBeforeSave);
    });
  });
});
