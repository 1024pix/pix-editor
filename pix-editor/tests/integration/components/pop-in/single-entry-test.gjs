import { render } from '@ember/test-helpers';
import SingleEntry from 'pixeditor/components/pop-in/single-entry';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | popin-single-entry', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><SingleEntry @title="title" /></template>);

    assert.dom('.pix-modal').exists();
  });
});
