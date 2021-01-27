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
      id: 'rec_1',
      pixId: 'pix_1',
      status:'validé',
      genealogy: 'Prototype 1',
      author: 'DEV',
      version: 1,
      skills: [store.createRecord('skill', {})],
      idGenerator: idGeneratorStub
    };
    alternative =  {
      id: 'rec_1',
      pixId: 'pix_1',
      status:'validé',
      author: 'DEV',
      alternativeVersion: 1,
      skills: [store.createRecord('skill', {})],
      idGenerator: idGeneratorStub
    };
  });

  test('it should clone challenge to create new prototype version', function (assert) {
    // given
    const challenge = run(() => store.createRecord('challenge', prototype));

    // when
    const clonedChallenge = challenge.clone();

    // then
    assert.equal(clonedChallenge.constructor.modelName, 'challenge');
    assert.equal(clonedChallenge.pixId, 'generatedId');
    assert.equal(clonedChallenge.status, 'proposé');
    assert.equal(clonedChallenge.author, 'NEW');
    assert.equal(clonedChallenge.version, null);
    assert.equal(clonedChallenge.skills.length, 1);
  });

  test('it should clone challenge to create new alternative version', function (assert) {
    // given
    const challenge = run(() => store.createRecord('challenge', alternative));

    // when
    const clonedChallenge = challenge.clone();

    // then
    assert.equal(clonedChallenge.constructor.modelName, 'challenge');
    assert.equal(clonedChallenge.pixId, 'generatedId');
    assert.equal(clonedChallenge.status, 'proposé');
    assert.equal(clonedChallenge.author, 'NEW');
    assert.equal(clonedChallenge.alternativeVersion, null);
    assert.equal(clonedChallenge.skills.length, 1);
  });

  test('it should clone challenge to duplicate', function(assert) {
    // given
    const challenge = run(() => store.createRecord('challenge', prototype));

    // when
    const clonedChallenge = challenge.cloneToDuplicate();

    // then
    assert.equal(clonedChallenge.constructor.modelName, 'challenge');
    assert.equal(clonedChallenge.pixId, 'generatedId');
    assert.equal(clonedChallenge.status, 'proposé');
    assert.equal(clonedChallenge.skills.length, 0);
  });
});
