import { render } from '@ember/test-helpers';
import SearchSidebar from 'pixeditor/components/sidebar/search';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | sidebar/search', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    const maySearch = sinon.stub().returns(true);

    // when
    await render(<template><SearchSidebar @displaySearch={{maySearch}} /></template>);

    // then
    assert.dom('.sidebar-search').exists();
  });
});
