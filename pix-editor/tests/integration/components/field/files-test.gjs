import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Files from 'pix-editor/components/field/files';

module('Integration | Component | form-files', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Files /></template>);

    assert.dom('.field').exists();
  });
});
