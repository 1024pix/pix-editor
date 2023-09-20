import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | workbench-list', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given


    // when
    await render(hbs`<List::Workbench />`);


    // then
    assert.dom('.ember-table').exists();
  });
});
