import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | main-sidebar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('executeAction', function() {});
    this.set('openConfigurationAction', function() {});

    await render(hbs`{{main-sidebar execute=(action executeAction) openConfiguration=(action openConfigurationAction)}}`);

    assert.equal(this.element.textContent.trim(), '');
    //assert.dom('#main-sidebar').exists();

  });
});
