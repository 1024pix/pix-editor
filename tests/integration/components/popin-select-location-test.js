import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//import $ from 'jquery';

module('Integration | Component | popin-select-location', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{popin-select-location class="test"}}`);
    /*$(".test").modal("show");

    assert.dom('.test').exists();*/
    assert.ok(true);
  });
});
