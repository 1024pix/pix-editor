import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | sidebar/search', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // given
    this.maySearch = sinon.stub().returns(true);

    // when
    await render(hbs`<Sidebar::Search @displaySearch={{this.maySearch}} />`);

    // then
    assert.dom('.sidebar-search').exists();
  });
});
