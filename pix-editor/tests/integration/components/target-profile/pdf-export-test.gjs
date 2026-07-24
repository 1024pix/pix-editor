import { render } from '@1024pix/ember-testing-library';
import PdfExport from 'pixeditor/components/target-profile/pdf-export';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/pdf-export', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const screen = await render(<template><PdfExport /></template>);
    assert.dom(screen.getByRole('button', { name: 'PDF' })).exists();
  });
});
