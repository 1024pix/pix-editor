import { render } from '@ember/test-helpers';
import SearchSidebar from 'pixeditor/components/sidebar/search';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | sidebar/search', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given

    // when
    await render(<template><SearchSidebar /></template>);

    // then
    assert.dom('.sidebar-search').exists();
  });
});
