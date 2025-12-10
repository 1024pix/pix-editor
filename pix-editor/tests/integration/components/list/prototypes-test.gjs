import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Prototypes from 'pix-editor/components/list/prototypes';

module('Integration | Component | prototypes-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Prototypes /></template>);

    assert.dom('.ember-table').exists();
  });
});
