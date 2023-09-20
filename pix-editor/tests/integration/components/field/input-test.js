import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | form-input', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Field::Input />`);

    assert.dom('.field').exists();

  });
});
