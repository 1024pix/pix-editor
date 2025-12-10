import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Archive from 'pix-editor/components/list/archive';

module('Integration | Component | list/archive', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Archive /></template>);

    assert.dom('.ember-table').exists();
  });
});
