import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | field/copy', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('value', 'to be copied');
    this.set('onCopied', function() {});

    await render(hbs`<Field::Copy @value={{this.value}} @onCopied={{this.onCopied}}/>`);

    assert.equal(this.element.querySelector('textarea').value.trim(), 'to be copied');
  });
});
