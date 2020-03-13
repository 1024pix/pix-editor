import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | popin-challenge-log', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('closeAction', function(){});
    this.set('challenge', null);

    await render(hbs`{{pop-in/challenge-log close=(action closeAction) challenge=challenge}}`);

    assert.dom('.ember-modal-dialog').exists();

  });
});
