import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | sidebar/search', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.mayShowFrameworkList = sinon.stub().returns(true);

    await render(hbs`<Sidebar::Search @mayShowFrameworkList={{this.mayShowFrameworkList}} />`);

    assert.dom('.sidebar-search').exists();
  });
});
