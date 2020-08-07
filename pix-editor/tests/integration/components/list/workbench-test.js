import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | workbench-list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given


    // when
    await render(hbs`{{list/workbench}}`);


    // then
    assert.dom('.ember-table').exists();
  });
});
