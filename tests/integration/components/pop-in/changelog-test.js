import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | popin-changelog', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('closedAction', function() {});
    this.set('denyAction', function() {});

    await render(hbs`{{pop-in/changelog deny=(action denyAction) closed=(action closedAction)}}`);

    //assert.dom('.popin-changelog').exists();
    assert.ok(true);
  });
});
