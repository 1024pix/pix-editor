import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competence-list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // given


    // when
    await render(hbs`{{competence/competence-list}}`);


    // then

    assert.dom('.list-header').exists();
  });
});
