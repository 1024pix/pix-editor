import { render } from '@1024pix/ember-testing-library';
import { getByText, queryByText } from '@testing-library/dom';
import { module, test } from 'qunit';
import ModulesList from 'pixeditor/components/modules/modules-list';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  let moduleSummaries;

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    moduleSummaries = [
      store.createRecord('module', {
        internalTitle: 'MOD_super_1',
        isBeta: false,
        visibility: 'public',
        details: {
          level: 'novice',
        },
      }),
      store.createRecord('module', {
        internalTitle: 'MOD_super_2',
        isBeta: true,
        visibility: 'private',
        details: {
          level: 'advanced',
        },
      }),
    ];
  });

  module('when @showStatus is true', () => {
    test('it renders with status column', async function (assert) {
      const screen = await render(
        <template><ModulesList @modules={{moduleSummaries}} @showStatus={{true}} /></template>,
      );

      assert.dom(screen.getByRole('columnheader', { name: 'Statut' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Titre interne' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Niveau' })).exists();

      assert.dom(screen.getByText('MOD_super_1')).exists();
      assert.dom(screen.getByText('MOD_super_2')).exists();

      const firstRow = screen.getByText('MOD_super_1').closest('tr');
      assert.dom(getByText(firstRow, 'Public')).exists();
      assert.dom(queryByText(firstRow, 'Beta')).doesNotExist();
      assert.dom(getByText(firstRow, 'Novice')).exists();

      const secondRow = screen.getByText('MOD_super_2').closest('tr');
      assert.dom(getByText(secondRow, 'Privé')).exists();
      assert.dom(getByText(secondRow, 'Beta')).exists();
      assert.dom(getByText(secondRow, 'Avancé')).exists();
    });
  });

  module('when @showStatus is false', () => {
    test('it renders without status column', async function (assert) {
      const screen = await render(
        <template><ModulesList @modules={{moduleSummaries}} @showStatus={{false}} /></template>,
      );

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
