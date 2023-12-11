import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | main-sidebar', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders main-sideBar', async function(assert) {
    this.set('menuOpen', function() {});
    this.set('openLogout', function() {});
    this.set('closeMenu', function() {});
    this.owner.register('service:currentData', class MockService extends Service {
      getFramework() {
        return { name: 'Pix 1D' };
      }
      getAreas() {
        return [];
      }
    });
    await render(hbs`<Sidebar::Main @openLogout={{this.openLogout}}
                                    @open={{this.menuOpen}}
                                    @close={{this.closeMenu}} />`);

    assert.dom('.main-sidebar').exists();
  });

  module('the pix1d framework is selected', function() {
    test('displays mission tab', async function(assert) {
      this.owner.register('service:currentData', class MockService extends Service {
        getFramework() {
          return { name: 'Pix 1D' };
        }
        getAreas() {
          return [];
        }
      });
      this.set('menuOpen', function() {});
      this.set('openLogout', function() {});
      this.set('closeMenu', function() {});

      const screen = await render(hbs`<Sidebar::Main @openLogout={{this.openLogout}}
                                    @open={{this.menuOpen}}
                                    @close={{this.closeMenu}} />`);
      assert.dom(screen.getByText('Missions Pix 1D')).exists();
    });
  });

  module('the pix1d framework is not selected', function() {
    test('does not display the Mission Pix 1D', async function(assert) {
      this.owner.register('service:currentData', class MockService extends Service {
        getFramework() {
          return { name: 'Pix+ Droit' };
        }
        getAreas() {
          return [];
        }
      });
      this.set('menuOpen', function() {});
      this.set('openLogout', function() {});
      this.set('closeMenu', function() {});

      const screen = await render(hbs`<Sidebar::Main @openLogout={{this.openLogout}}
                                    @open={{this.menuOpen}}
                                    @close={{this.closeMenu}} />`);
                                    
      assert.dom(screen.queryByText('Missions Pix 1D')).doesNotExist();
    });
  });
});

