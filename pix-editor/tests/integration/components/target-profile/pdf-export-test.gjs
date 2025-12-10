import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import PdfExport from 'pix-editor/components/target-profile/pdf-export';

module('Integration | Component | target-profile/pdf-export', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><PdfExport /></template>);
    assert.dom('.ui.button i.pdf').exists();
  });
});
