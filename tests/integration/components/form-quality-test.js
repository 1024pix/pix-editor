import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | form-quality', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    await render(hbs`{{form-quality title="form_title"}}`);

    assert.equal(this.element.getElementsByTagName("label")[0].textContent.trim(), 'form_title');

  });
});
