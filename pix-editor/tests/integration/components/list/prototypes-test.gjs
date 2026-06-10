import { render } from '@ember/test-helpers';
import Prototypes from 'pixeditor/components/list/prototypes';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | prototypes-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Prototypes /></template>);

    assert.dom('.ember-table').exists();
  });
});
