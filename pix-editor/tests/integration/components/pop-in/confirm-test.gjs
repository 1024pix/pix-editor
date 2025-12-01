import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Confirm from 'pixeditor/components/pop-in/confirm';

module('Integration | Component | popin-confirm', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    this.approveAction = function () {};
    this.denyAction = function () {};

    await render(
      <template><Confirm @onApprove={{self.approveAction}} @onDeny={{self.denyAction}} @title="title" /></template>,
    );

    assert.dom('.pix-modal').exists();
  });
});
