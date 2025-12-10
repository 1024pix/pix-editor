import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Quality from 'pix-editor/components/field/quality';

module('Integration | Component | quality', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    this.challenge = { accessibility1: false, accessibility2: false, spoil: false, responsive: false };

    await render(<template><Quality @title="form_title" @challenge={{self.challenge}} /></template>);

    assert.dom(this.element.getElementsByTagName('label')[0]).hasText('form_title');
  });
});
