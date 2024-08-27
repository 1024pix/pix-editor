import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | sidebar/search', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.maySearch = sinon.stub().returns(true);

    // when
    await render(hbs`<Sidebar::Search @displaySearch={{this.maySearch}} />`);

    // then
    assert.dom('.sidebar-search').exists();
  });
});
