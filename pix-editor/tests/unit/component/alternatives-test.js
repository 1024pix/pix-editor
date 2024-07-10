import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | alternatives', function(hooks) {
  setupTest(hooks);

  let component;

  module('#alternatives', function(hooks) {
    let alternativeValidee, alternativePerimee;

    hooks.beforeEach(function() {
      // given
      alternativeValidee = {
        id: 'id',
        status: 'validé',
      };
      alternativePerimee = {
        id: 'id2',
        status: 'périmé',
      };
      const challenge = {
        alternatives: [alternativeValidee, alternativePerimee]
      };

      component = createGlimmerComponent('component:alternatives', { challenge });
    });

    module('when arePerimeDeclisDisplayed is true', function() {
      test('displays all challenges', function(assert) {
        // when
        component.arePerimeDeclisDisplayed = true;

        // then
        assert.deepEqual(component.alternatives, [alternativeValidee, alternativePerimee]);
      });
    });

    module('when arePerimeDeclisDisplayed is false', function() {
      test('displays all challenges but périmés', function(assert) {
        // when
        component.arePerimeDeclisDisplayed = false;

        // then
        assert.deepEqual(component.alternatives, [alternativeValidee]);
      });
    });
  });
});
