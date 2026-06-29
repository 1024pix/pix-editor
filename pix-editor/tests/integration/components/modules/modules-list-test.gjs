import { render } from '@1024pix/ember-testing-library';
import { getByRole, getByText, queryByRole, queryByText } from '@testing-library/dom';
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

        assert.dom(screen.getByRole('columnheader', { name: 'Statut' })).exists();
        assert.dom(screen.getByRole('columnheader', { name: 'Titre interne' })).exists();
        assert.dom(screen.getByRole('columnheader', { name: 'Niveau' })).exists();

        assert.dom(screen.getByText('MOD_super_1')).exists();
        assert.dom(screen.getByText('MOD_super_2')).exists();

        const firstRow = screen.getByText('MOD_super_1').closest('tr');
        assert.dom(getByText(firstRow, 'Public')).exists();
        assert.dom(queryByText(firstRow, 'Beta')).doesNotExist();
        assert.dom(getByText(firstRow, 'Novice')).exists();

        assert.dom(getByRole(firstRow, 'link', { name: 'Voir le détail' })).exists();
        assert
          .dom(getByRole(firstRow, 'link', { name: 'Voir le détail' }))
          .hasAttribute('href', `/modules/production/super-1`);
        assert.dom(getByRole(firstRow, 'link', { name: 'Jouer le module' })).exists();
        assert
          .dom(getByRole(firstRow, 'link', { name: 'Jouer le module' }))
          .hasAttribute('href', 'https://graou.prod.asso/modules/super-1');

        const secondRow = screen.getByText('MOD_super_2').closest('tr');
        assert.dom(getByText(secondRow, 'Privé')).exists();
        assert.dom(getByText(secondRow, 'Beta')).exists();
        assert.dom(getByText(secondRow, 'Avancé')).exists();
        assert.dom(getByRole(secondRow, 'link', { name: 'Voir le détail' })).exists();
        assert
          .dom(getByRole(secondRow, 'link', { name: 'Voir le détail' }))
          .hasAttribute('href', `/modules/production/super-2`);
        assert.dom(getByRole(secondRow, 'link', { name: 'Jouer le module' })).exists();
        assert
          .dom(getByRole(secondRow, 'link', { name: 'Jouer le module' }))
          .hasAttribute('href', 'https://graou.prod.asso/modules/super-2');
      });
    });

    module('when @showStatus is false', () => {
      test('it renders without status column', async function (assert) {
        const screen = await render(<template><ModulesList @modules={{modules}} @showStatus={{false}} /></template>);

        assert.dom(screen.queryByRole('columnheader', { name: 'Statut' })).doesNotExist();
        assert.dom(screen.getByRole('columnheader', { name: 'Titre interne' })).exists();
        assert.dom(screen.getByRole('columnheader', { name: 'Niveau' })).exists();

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
      assert.dom(getByRole(firstRow, 'link', { name: 'Voir le détail' })).exists();
      assert
        .dom(getByRole(firstRow, 'link', { name: 'Voir le détail' }))
        .hasAttribute('href', `/modules/workbench/super-1`);
      assert.dom(getByRole(firstRow, 'link', { name: 'Voir le détail du module en prod' })).exists();
      assert
        .dom(getByRole(firstRow, 'link', { name: 'Voir le détail du module en prod' }))
        .hasAttribute('href', '/modules/production/moduleId');
      assert.dom(getByRole(firstRow, 'link', { name: 'Prévisualiser' })).exists();
      assert
        .dom(getByRole(firstRow, 'link', { name: 'Prévisualiser' }))
        .hasAttribute('href', 'https://graou.asso/modules/preview/super-1');

      const secondRow = screen.getByText('MOD_super_2').closest('tr');
      assert.dom(getByRole(secondRow, 'link', { name: 'Voir le détail' })).exists();
      assert
        .dom(getByRole(secondRow, 'link', { name: 'Voir le détail' }))
        .hasAttribute('href', `/modules/workbench/super-2`);
      assert.dom(queryByRole(secondRow, 'link', { name: 'Voir le détail du module en prod' })).doesNotExist();
      assert
        .dom(getByRole(secondRow, 'link', { name: 'Prévisualiser' }))
        .hasAttribute('href', 'https://graou.asso/modules/preview/super-2');
    });
  });
});
