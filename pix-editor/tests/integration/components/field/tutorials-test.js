import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | form-tutorials', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Field::Tutorials />`);

    assert.dom('.field').exists();
  });
});
