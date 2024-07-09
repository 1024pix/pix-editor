import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | competence/prototypes/single/alternatives', function(hooks) {
  setupTest(hooks);
  let controller, alternativeValidee, alternativePerimee;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.competence/prototypes/single/alternatives');
  });

  module('#alternatives', function() {
    module('When arePerimeDeclisDisplayed is true', function() {
      test('displays all challenges', function(assert) {
        // given
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

        // when
        controller.arePerimeDeclisDisplayed = true;

        // then
        assert.deepEqual(controller.alternatives, [alternativeValidee, alternativePerimee]);

      });
    });
    module('When arePerimeDeclisDisplayed is false', function() {
      test('displays all challenges but périmés', function(assert) {
        // given
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

        // when
        controller.arePerimeDeclisDisplayed = false;

        // then
        assert.deepEqual(controller.alternatives, [alternativeValidee]);

      });
    });
  });
});
