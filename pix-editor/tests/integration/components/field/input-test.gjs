import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Input from 'pixeditor/components/field/input';

module('Integration | Component | form-input', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Input /></template>);

    assert.dom('.field').exists();
  });
});
