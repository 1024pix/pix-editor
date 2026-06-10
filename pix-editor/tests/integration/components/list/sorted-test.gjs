import { render } from '@ember/test-helpers';
import Sorted from 'pixeditor/components/list/sorted';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | sorted-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Sorted /></template>);

    assert.dom(this.element).hasText('');
  });
});
