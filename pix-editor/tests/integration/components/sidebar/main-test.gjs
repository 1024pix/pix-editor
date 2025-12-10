import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { module, test } from 'qunit';

import SidebarMain from 'pix-editor/components/sidebar/main';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | main-sidebar', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders main-sideBar', async function (assert) {
    const self = this;

    this.menuOpen = function () {};
    this.openLogout = function () {};
    this.closeMenu = function () {};
    this.owner.register(
      'service:currentData',
      class MockService extends Service {
        getFramework() {
          return { name: 'Pix 1D' };
        }

        getAreas() {
          return [];
        }
      },
    );
    await render(
      <template>
        <SidebarMain @openLogout={{self.openLogout}} @open={{self.menuOpen}} @close={{self.closeMenu}} />
      </template>,
    );

    assert.dom('.main-sidebar').exists();
  });

  module('the pix1d framework is selected', function () {
    test('displays mission tab', async function (assert) {
      const self = this;

      this.owner.register(
        'service:currentData',
        class MockService extends Service {
          getFramework() {
            return { name: 'Pix 1D' };
          }

          getAreas() {
            return [];
          }
        },
      );
      this.menuOpen = function () {};
      this.openLogout = function () {};
      this.closeMenu = function () {};

      const screen = await render(
        <template>
          <SidebarMain @openLogout={{self.openLogout}} @open={{self.menuOpen}} @close={{self.closeMenu}} />
        </template>,
      );
      assert.dom(screen.getByText('Missions Pix 1D')).exists();
    });
  });

  module('the pix1d framework is not selected', function () {
    test('does not display the Mission Pix 1D', async function (assert) {
      const self = this;

      this.owner.register(
        'service:currentData',
        class MockService extends Service {
          getFramework() {
            return { name: 'Pix+ Droit' };
          }

          getAreas() {
            return [];
          }
        },
      );
      this.menuOpen = function () {};
      this.openLogout = function () {};
      this.closeMenu = function () {};

      const screen = await render(
        <template>
          <SidebarMain @openLogout={{self.openLogout}} @open={{self.menuOpen}} @close={{self.closeMenu}} />
        </template>,
      );

      assert.dom(screen.queryByText('Missions Pix 1D')).doesNotExist();
    });
  });
});
