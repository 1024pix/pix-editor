import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | main-sidebar', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders main-sideBar', async function(assert) {
    this.set('menuOpen', function() {});
    this.set('openLogout', function() {});
    this.set('closeMenu', function() {});
    this.owner.register('service:currentData', class MockService extends Service {
      getFramework() {
        return { name: 'Pix Junior' };
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

  module('the pixJunior framework is selected', function() {
    test('displays mission tab', async function(assert) {
      this.owner.register('service:currentData', class MockService extends Service {
        getFramework() {
          return { name: 'Pix Junior' };
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
      assert.dom(screen.getByText('Missions Pix Junior')).exists();
    });
  });

  module('the pixJunior framework is not selected', function() {
    test('does not display the Mission Pix Junior', async function(assert) {
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

      assert.dom(screen.queryByText('Missions Pix Junior')).doesNotExist();
    });
  });
});

