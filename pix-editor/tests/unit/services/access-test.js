import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Service | access', function(hooks) {
  setupTest(hooks);

  const REPLICATOR = 2;
  const EDITOR = 3;
  const ADMIN = 4;
  let accessService,
    configService;

  hooks.beforeEach(function() {
    configService = Service.extend({});
    this.owner.unregister('service:config');
    this.owner.register('service:config', configService);
    accessService = this.owner.lookup('service:access');
  });

  module('mayEdit', function() {

    test('it should return `false` if challenge is not live', function (assert) {
      //given
      const challenges = [{
        id: 'rec123655',
        name: 'archivedChallenge',
        isArchived: true
      },{
        id: 'rec123656',
        name: 'deletedChallenge',
        isDeleted: true
      }];

      //when
      challenges.forEach(challenge=>{

        //then
        assert.notOk(accessService.mayEdit(challenge));
      });
    });

    test('it should return `true` if challenge is live and level is `EDITOR` or more', function (assert) {
      //given
      const challenge = {
        id: 'rec123655',
        name: 'challenge',
        isValidated: true,
        isPrototype: true
      };

      const roles = [ADMIN,EDITOR];

      //when
      roles.forEach(role=>{
        configService.prototype.accessLevel = sinon.fake.returns(role)();

        //then
        assert.ok(accessService.mayEdit(challenge));
      });
    });

    test('it should return `true` when level is `REPLICATOR` only if challenge is not in production and is not a prototype', function (assert) {
      //given
      const validatedChallenge = {
        id: 'rec123655',
        name: 'validatedChallenge',
        isValidated: true,
      };
      const prototypeChallenge = {
        id: 'rec123656',
        name: 'prototypeChallenge',
        isPrototype: true,
      };
      const challenge = {
        id: 'rec123657',
        name: 'challenge',
      };

      //when
      configService.prototype.accessLevel = sinon.fake.returns(REPLICATOR)();

      //then
      assert.notOk(accessService.mayEdit(validatedChallenge));
      assert.notOk(accessService.mayEdit(prototypeChallenge));
      assert.ok(accessService.mayEdit(challenge));
    });
  });
});
