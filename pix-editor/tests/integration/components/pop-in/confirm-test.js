import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | popin-confirm', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('approveAction', function() {});
    this.set('denyAction', function() {});

    await render(hbs`<PopIn::Confirm @onApprove={{this.approveAction}}
                                     @onDeny={{this.denyAction}}
                                     @title="title" />`);

    assert.dom('.pix-modal').exists();
  });
});
