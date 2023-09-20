import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | main-sidebar', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders main-sideBar', async function(assert) {
    this.set('menuOpen', function() {});
    this.set('openLogout', function() {});
    this.set('closeMenu', function() {});

    await render(hbs`<Sidebar::Main @openLogout={{this.openLogout}}
                                    @open={{this.menuOpen}}
                                    @close={{this.closeMenu}} />`);

    assert.dom('.main-sidebar').exists();
  });
});

