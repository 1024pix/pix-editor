import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModuleNotification from 'pixeditor/components/modules/module-notification';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/draft-module-diff', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when @module is a production module', function () {
    module('and has a draft', function () {
      test('it displays a notification with a show draft button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const module = store.createRecord('module', {
          id: 'moduleId',
          draftModule: store.createRecord('draft-module', {
            id: 'draftModuleId',
          }),
        });

        // when
        const screen = await render(<template><ModuleNotification @module={{module}} /></template>);

        // then
        assert.dom(screen.getByText(t('modules.components.module-notification.production-information'))).exists();
        assert
          .dom(screen.getByRole('link', { name: t('modules.components.module-notification.production-redirection') }))
          .exists();
        assert
          .dom(screen.getByRole('link', { name: t('modules.components.module-notification.production-redirection') }))
          .hasAttribute('href', /\/modules\/workbench\/draftModuleId$/);
      });
    });

    module('and has no draft', function () {
      test('it displays nothing', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const module = store.createRecord('module', {
          id: 'moduleId',
        });

        // when
        const screen = await render(<template><ModuleNotification @module={{module}} /></template>);

        // then
        assert.dom(screen.queryByRole('paragraph')).doesNotExist();
      });
    });
  });

  module('when @module is a draft module', function () {
    module('and belongs to a production module', function () {
      test('it displays a notification with a show production module button', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftModule = store.createRecord('draft-module', {
          id: 'draftModuleId',
          module: store.createRecord('module', {
            id: 'moduleId',
          }),
        });

        // when
        const screen = await render(<template><ModuleNotification @module={{draftModule}} /></template>);

        // then
        assert.dom(screen.getByText(t('modules.components.module-notification.draft-information'))).exists();
        assert
          .dom(screen.getByRole('link', { name: t('modules.components.module-notification.draft-redirection') }))
          .exists();
        assert
          .dom(screen.getByRole('link', { name: t('modules.components.module-notification.draft-redirection') }))
          .hasAttribute('href', /\/modules\/production\/moduleId$/);
      });
    });

    module('and does not belong to a production module', function () {
      test('it displays nothing', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftModule = store.createRecord('draft-module', {
          id: 'draftModuleId',
        });

        // when
        const screen = await render(<template><ModuleNotification @module={{draftModule}} /></template>);

        // then
        assert.dom(screen.queryByRole('paragraph')).doesNotExist();
      });
    });
  });
});
