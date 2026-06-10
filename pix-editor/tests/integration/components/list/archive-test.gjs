import { render } from '@ember/test-helpers';
import Archive from 'pixeditor/components/list/archive';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | list/archive', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Archive /></template>);

    assert.dom('.ember-table').exists();
  });
});
