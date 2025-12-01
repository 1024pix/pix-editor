import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Checkbox from 'pixeditor/components/field/checkbox';

module('Integration | Component | checkbox', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Checkbox @label="search" /></template>);

    assert.dom('.ui.checkbox').exists();
  });
});
