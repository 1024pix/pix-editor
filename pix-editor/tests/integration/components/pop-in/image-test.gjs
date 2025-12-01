import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Image from 'pixeditor/components/pop-in/image';

module('Integration | Component | popin-image', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const self = this;

    this.closeAction = function () {};

    await render(<template><Image @close={{self.closeAction}} @title="image" /></template>);

    assert.dom('.pix-modal').exists();
  });
});
