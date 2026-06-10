import { render } from '@ember/test-helpers';
import PdfExport from 'pixeditor/components/target-profile/pdf-export';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/pdf-export', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><PdfExport /></template>);
    assert.dom('.ui.button i.pdf').exists();
  });
});
