import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Sorted from 'pix-editor/components/list/sorted';

module('Integration | Component | sorted-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Sorted /></template>);

    assert.dom(this.element).hasText('');
  });
});
