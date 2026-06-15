import { render } from '@1024pix/ember-testing-library';
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
        assert.dom(screen.getByText('Ce module possède une version en cours de modification.')).exists();
        assert.dom(screen.getByRole('link', { name: 'Voir le détail des modifications' })).exists();
        assert
          .dom(screen.getByRole('link', { name: 'Voir le détail des modifications' }))
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
        assert.dom(screen.getByText('Ce module possède une version disponible en production.')).exists();
        assert.dom(screen.getByRole('link', { name: 'Voir le détail du module en prod' })).exists();
        assert
          .dom(screen.getByRole('link', { name: 'Voir le détail du module en prod' }))
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
