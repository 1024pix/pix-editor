import { render } from '@ember/test-helpers';
import Textarea from 'pixeditor/components/field/textarea';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | form-textarea', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(<template><Textarea /></template>);

    assert.dom('.field').exists();
  });
});
