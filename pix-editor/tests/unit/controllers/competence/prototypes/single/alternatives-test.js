import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | competence/prototypes/single/alternatives', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.competence/prototypes/single/alternatives');
  });

  module('#alternatives', function(hooks) {
    let alternativeValidee, alternativePerimee;

    hooks.beforeEach(function() {
      alternativeValidee = {
        id: 'id',
        status: 'validé',
      };
      alternativePerimee = {
        id: 'id2',
        status: 'périmé',
      };
      controller.model = {
        alternatives: [alternativeValidee, alternativePerimee]
      };
    });

    module('When arePerimeDeclisDisplayed is true', function() {
      test('displays all challenges', function(assert) {
        // when
        controller.arePerimeDeclisDisplayed = true;

        // then
        assert.deepEqual(controller.alternatives, [alternativeValidee, alternativePerimee]);

      });
    });
    module('When arePerimeDeclisDisplayed is false', function() {
      test('displays all challenges but périmés', function(assert) {

        // when
        controller.arePerimeDeclisDisplayed = false;

        // then
        assert.deepEqual(controller.alternatives, [alternativeValidee]);

      });
    });
  });
});
