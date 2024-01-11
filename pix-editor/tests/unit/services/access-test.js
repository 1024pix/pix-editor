import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import EmberObject from '@ember/object';

module('Unit | Service | access', function(hooks) {
  setupTest(hooks);

  const REPLICATOR = 2;
  const EDITOR = 3;
  const ADMIN = 4;
  let accessService;

  hooks.beforeEach(function() {
    accessService = this.owner.lookup('service:access');
  });

  function _stubAccessLevel(accessLevel, owner) {
    class ConfigService extends Service {
      constructor() {
        super(...arguments);
        this.accessLevel = accessLevel;
      }
    }
    owner.unregister('service:config');
    owner.register('service:config', ConfigService);
  }

  module('mayEdit', function() {

    test('it should return `false` if challenge is obsolete', function (assert) {
      // given
      const challenge = EmberObject.create({
        id: 'rec123656',
        name: 'deletedChallenge',
        isObsolete: true
      });

      //when
      const accessResult = accessService.mayEdit(challenge);

      //then
      assert.notOk(accessResult);
    });

    module('#liveChallenge', function(hooks) {
      let validatedChallenge, archivedChallenge;
      hooks.beforeEach(function () {
        validatedChallenge = EmberObject.create({
          id: 'recChallenge1',
          name: 'challenge',
          isValidated: true,
        });

        archivedChallenge = EmberObject.create({
          id: 'recChallenge2',
          name: 'challenge',
          isArchived: true,
        });
      });
      test('it should return `true` if challenge is live and level is `EDITOR`', function (assert) {
        //when
        _stubAccessLevel(EDITOR, this.owner);

        //then
        assert.ok(accessService.mayEdit(validatedChallenge));
        assert.ok(accessService.mayEdit(archivedChallenge));

      });
      test('it should return `true` if challenge is live and level is `ADMIN`', function (assert) {
        //when
        _stubAccessLevel(ADMIN, this.owner);

        //then
        assert.ok(accessService.mayEdit(validatedChallenge));
        assert.ok(accessService.mayEdit(archivedChallenge));
      });
    });

    test('it should return `true` when level is `REPLICATOR` only if challenge is not in production and is not a prototype', function (assert) {
      //given
      const validatedChallenge = EmberObject.create({
        id: 'rec123655',
        name: 'validatedChallenge',
        isValidated: true,
      });
      const prototypeChallenge = EmberObject.create({
        id: 'rec123656',
        name: 'prototypeChallenge',
        isPrototype: true,
      });
      const challenge = EmberObject.create({
        id: 'rec123657',
        name: 'challenge',
      });

      //when
      _stubAccessLevel(REPLICATOR, this.owner);

      //then
      assert.notOk(accessService.mayEdit(validatedChallenge));
      assert.notOk(accessService.mayEdit(prototypeChallenge));
      assert.ok(accessService.mayEdit(challenge));
    });
  });

  module('mayChangeLocalizedChallengeStatus', function() {
    test('it should return `false` if localized challenge is not editable', function (assert) {
      // given
      const localizedChallenge = EmberObject.create({
        id: 'rec123656',
        isStatusEditable: false,
      });

      //when
      const accessResult = accessService.mayChangeLocalizedChallengeStatus(localizedChallenge);

      //then
      assert.notOk(accessResult);
    });

    test('it should return `false` if localized challenge is editable and user is not admin', function (assert) {
      // given
      const localizedChallenge = EmberObject.create({
        id: 'rec123656',
        isStatusEditable: true,
      });
      _stubAccessLevel(EDITOR, this.owner);

      //when
      const accessResult = accessService.mayChangeLocalizedChallengeStatus(localizedChallenge);

      //then
      assert.notOk(accessResult);
    });

    test('it should return `true` if localized challenge is editable and user is admin', function (assert) {
      // given
      const localizedChallenge = EmberObject.create({
        id: 'rec123656',
        isStatusEditable: true,
      });
      _stubAccessLevel(ADMIN, this.owner);

      //when
      const accessResult = accessService.mayChangeLocalizedChallengeStatus(localizedChallenge);

      //then
      assert.ok(accessResult);
    });

  });
});
