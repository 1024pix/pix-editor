import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | quality', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    this.set('challenge', { accessibility1:false, accessibility2:false, spoil:false, responsive:false });

    await render(hbs`{{field/quality title="form_title" challenge=challenge}}`);

    assert.equal(this.element.getElementsByTagName('label')[0].textContent.trim(), 'form_title');

  });
});
