import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Workbench from 'pixeditor/components/list/workbench';

module('Integration | Component | workbench-list', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given

    // when
    await render(<template><Workbench /></template>);

    // then
    assert.dom('.ember-table').exists();
  });
});
