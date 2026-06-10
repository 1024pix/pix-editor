import { render } from '@ember/test-helpers';
import Input from 'pixeditor/components/field/input';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | form-input', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Input /></template>);

    assert.dom('.field').exists();
  });
});
