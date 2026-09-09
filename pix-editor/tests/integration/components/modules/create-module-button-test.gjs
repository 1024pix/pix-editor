import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import CreateModuleButton from 'pixeditor/components/modules/create-module-button';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Components | modules/create-module-button', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when module has a draft', function () {
    test('it displays nothing', async function (assert) {
      // given
      const mayCreateOrEditModuleStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateOrEditModule = mayCreateOrEditModuleStub;
      }
      this.owner.register('service:access', Access);
      const store = this.owner.lookup('service:store');
      const module = store.createRecord('module', {
        id: 'moduleId',
        draftModule: store.createRecord('draft-module', {
          id: 'moduleId',
        }),
      });

      // when
      const screen = await render(<template><CreateModuleButton @module={{module}} /></template>);

      // then
      assert.dom(screen.queryByRole('link')).doesNotExist();
    });
  });

  module('when module does not have a draft', function () {
    test('it displays draft creation button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const mayCreateOrEditModuleStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateOrEditModule = mayCreateOrEditModuleStub;
      }
      this.owner.register('service:access', Access);
      const module = store.createRecord('module', {
        id: 'moduleId',
      });

      // when
      const screen = await render(<template><CreateModuleButton @module={{module}} /></template>);

      // then
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.create-module-button.create-draft') }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.create-module-button.create-draft') }))
        .hasAttribute('href', /\/modules\/workbench\/new\?moduleId=moduleId$/);
    });

    module('when user is not allowed to create modules', function () {
      test('it displays nothing', async function (assert) {
        // given
        const mayCreateOrEditModuleStub = sinon.stub().returns(false);
        class Access extends Service {
          mayCreateOrEditModule = mayCreateOrEditModuleStub;
        }
        this.owner.register('service:access', Access);
        const store = this.owner.lookup('service:store');

        const module = store.createRecord('module', {
          id: 'moduleId',
        });

        // when
        const screen = await render(<template><CreateModuleButton @module={{module}} /></template>);

        // then
        assert.dom(screen.queryByRole('link')).doesNotExist();
      });
    });
  });

  module('when no module', function () {
    test('it displays module creation button', async function (assert) {
      // given
      const mayCreateOrEditModuleStub = sinon.stub().returns(true);
      class Access extends Service {
        mayCreateOrEditModule = mayCreateOrEditModuleStub;
      }
      this.owner.register('service:access', Access);
      const module = undefined;

      // when
      const screen = await render(<template><CreateModuleButton @module={{module}} /></template>);

      // then
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.create-module-button.create-module') }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.create-module-button.create-module') }))
        .hasAttribute('href', /\/modules\/workbench\/new$/);
    });
  });
});
