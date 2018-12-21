import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | popin-tube-level', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('actionSet', function() {});
    this.set('actionClosed', function() {});
    await render(hbs`{{popin-tube-level closed=(action actionClosed) set=(action actionSet) class='popin-tube-level'}}`);

    assert.dom('.popin-tube-level').exists();

  });
});
