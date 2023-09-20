import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | quality', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {

    this.set('challenge', { accessibility1:false, accessibility2:false, spoil:false, responsive:false });

    await render(hbs`<Field::Quality @title="form_title"
                                     @challenge={{this.challenge}} />`);

    assert.dom(this.element.getElementsByTagName('label')[0]).hasText('form_title');

  });
});
