import { render } from '@1024pix/ember-testing-library';
import { getByRole, getByText, queryByRole, queryByText } from '@testing-library/dom';
import { t } from 'ember-intl/test-support';
import ModulesList from 'pixeditor/components/modules/modules-list';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when listing production modules', function (hooks) {
    let modules;

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      modules = [
        store.createRecord('module', {
          id: 'super-1',
          internalTitle: 'MOD_super_1',
          isBeta: false,
          visibility: 'public',
          details: {
            level: 'novice',
          },
          url: 'https://graou.prod.asso/modules/super-1',
        }),
        store.createRecord('module', {
          id: 'super-2',
          internalTitle: 'MOD_super_2',
          isBeta: true,
          visibility: 'private',
          details: {
            level: 'advanced',
          },
          url: 'https://graou.prod.asso/modules/super-2',
        }),
      ];
    });

    module('when @showStatus is true', () => {
      test('it renders with status column', async function (assert) {
        const screen = await render(<template><ModulesList @modules={{modules}} @showStatus={{true}} /></template>);

        assert.dom(screen.getByRole('columnheader', { name: t('modules.components.modules-list.status') })).exists();
        assert
          .dom(screen.getByRole('columnheader', { name: t('modules.components.modules-list.internal-title') }))
          .exists();
        assert.dom(screen.getByRole('columnheader', { name: t('modules.components.modules-list.level') })).exists();

        assert.dom(screen.getByText('MOD_super_1')).exists();
        assert.dom(screen.getByText('MOD_super_2')).exists();

        const firstRow = screen.getByText('MOD_super_1').closest('tr');
        assert.dom(getByText(firstRow, 'Public')).exists();
        assert.dom(queryByText(firstRow, 'Beta')).doesNotExist();
        assert.dom(getByText(firstRow, 'Novice')).exists();

        assert.dom(getByRole(firstRow, 'link', { name: t('modules.components.modules-list.detail') })).exists();
        assert
          .dom(getByRole(firstRow, 'link', { name: t('modules.components.modules-list.detail') }))
          .hasAttribute('href', `/modules/production/super-1`);
        assert
          .dom(getByRole(firstRow, 'link', { name: t('modules.components.play-module-button.play-module') }))
          .exists();
        assert
          .dom(getByRole(firstRow, 'link', { name: t('modules.components.play-module-button.play-module') }))
          .hasAttribute('href', 'https://graou.prod.asso/modules/super-1');

        const secondRow = screen.getByText('MOD_super_2').closest('tr');
        assert.dom(getByText(secondRow, 'Privé')).exists();
        assert.dom(getByText(secondRow, 'Beta')).exists();
        assert.dom(getByText(secondRow, 'Avancé')).exists();
        assert.dom(getByRole(secondRow, 'link', { name: t('modules.components.modules-list.detail') })).exists();
        assert
          .dom(getByRole(secondRow, 'link', { name: t('modules.components.modules-list.detail') }))
          .hasAttribute('href', `/modules/production/super-2`);
        assert
          .dom(getByRole(secondRow, 'link', { name: t('modules.components.play-module-button.play-module') }))
          .exists();
        assert
          .dom(getByRole(secondRow, 'link', { name: t('modules.components.play-module-button.play-module') }))
          .hasAttribute('href', 'https://graou.prod.asso/modules/super-2');
      });
    });

    module('when @showStatus is false', () => {
      test('it renders without status column', async function (assert) {
        const screen = await render(<template><ModulesList @modules={{modules}} @showStatus={{false}} /></template>);

        assert
          .dom(screen.queryByRole('columnheader', { name: t('modules.components.modules-list.status') }))
          .doesNotExist();
        assert
          .dom(screen.getByRole('columnheader', { name: t('modules.components.modules-list.internal-title') }))
          .exists();
        assert.dom(screen.getByRole('columnheader', { name: t('modules.components.modules-list.level') })).exists();

        assert.dom(screen.getByText('MOD_super_1')).exists();
        assert.dom(screen.getByText('MOD_super_2')).exists();

        const firstRow = screen.getByText('MOD_super_1').closest('tr');
        assert.dom(getByText(firstRow, 'Novice')).exists();

        const secondRow = screen.getByText('MOD_super_2').closest('tr');
        assert.dom(getByText(secondRow, 'Avancé')).exists();
      });
    });
  });

  module('when listing draft modules', function (hooks) {
    let draftModules;

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      const module = store.createRecord('module', { id: 'moduleId' });

      draftModules = [
        store.createRecord('draft-module', {
          id: 'super-1',
          module,
          internalTitle: 'MOD_super_1',
          isBeta: false,
          visibility: 'public',
          details: {
            level: 'novice',
          },
          previewUrl: 'https://graou.asso/modules/preview/super-1',
        }),
        store.createRecord('draft-module', {
          id: 'super-2',
          internalTitle: 'MOD_super_2',
          isBeta: true,
          visibility: 'private',
          details: {
            level: 'advanced',
          },
          previewUrl: 'https://graou.asso/modules/preview/super-2',
        }),
      ];
    });

    test('these don’t have a show detail button', async function (assert) {
      // given
      this.owner.lookup('service:store');

      // when
      const screen = await render(<template><ModulesList @modules={{draftModules}} /></template>);

      // then
      assert.dom(screen.getByText('MOD_super_1')).exists();
      assert.dom(screen.getByText('MOD_super_2')).exists();

      const firstRow = screen.getByText('MOD_super_1').closest('tr');
      assert.dom(getByRole(firstRow, 'link', { name: t('modules.components.modules-list.detail') })).exists();
      assert
        .dom(getByRole(firstRow, 'link', { name: t('modules.components.modules-list.detail') }))
        .hasAttribute('href', `/modules/workbench/super-1`);
      assert
        .dom(getByRole(firstRow, 'link', { name: t('modules.components.modules-list.production-detail') }))
        .exists();
      assert
        .dom(getByRole(firstRow, 'link', { name: t('modules.components.modules-list.production-detail') }))
        .hasAttribute('href', '/modules/production/moduleId');
      assert.dom(getByRole(firstRow, 'link', { name: t('modules.components.play-module-button.preview') })).exists();
      assert
        .dom(getByRole(firstRow, 'link', { name: t('modules.components.play-module-button.preview') }))
        .hasAttribute('href', 'https://graou.asso/modules/preview/super-1');

      const secondRow = screen.getByText('MOD_super_2').closest('tr');
      assert.dom(getByRole(secondRow, 'link', { name: t('modules.components.modules-list.detail') })).exists();
      assert
        .dom(getByRole(secondRow, 'link', { name: t('modules.components.modules-list.detail') }))
        .hasAttribute('href', `/modules/workbench/super-2`);
      assert
        .dom(queryByRole(secondRow, 'link', { name: t('modules.components.modules-list.production-detail') }))
        .doesNotExist();
      assert
        .dom(getByRole(secondRow, 'link', { name: t('modules.components.play-module-button.preview') }))
        .hasAttribute('href', 'https://graou.asso/modules/preview/super-2');
    });
  });
});
