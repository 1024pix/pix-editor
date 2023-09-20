import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | popin-image', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('closeAction', function() {});

    await render(hbs`<PopIn::Image @close={{this.closeAction}}
                                   @title="image" />`);

    assert.dom('.pix-modal').exists();
  });
});
