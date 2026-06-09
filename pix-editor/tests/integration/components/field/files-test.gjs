import { render } from '@ember/test-helpers';
import Files from 'pixeditor/components/field/files';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | form-files', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Files /></template>);

    assert.dom('.field').exists();
  });
});
