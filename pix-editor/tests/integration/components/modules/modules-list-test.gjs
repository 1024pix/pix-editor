import { render } from '@1024pix/ember-testing-library';
import { queryByText } from '@testing-library/dom';
import { module, test } from 'qunit';
import ModulesList from 'pixeditor/components/modules/modules-list';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    const store = this.owner.lookup('service:store');
    const moduleSummaries = [
      store.createRecord('module-summary', {
        title: 'Super module 1',
        isBeta: false,
        visibility: 'public',
        level: 'novice',
      }),
      store.createRecord('module-summary', {
        title: 'Super module 2',
        isBeta: true,
        visibility: 'private',
        level: 'advanced',
      }),
    ];

    const screen = await render(<template><ModulesList @modules={{moduleSummaries}} /></template>);

    assert.dom(screen.queryByText('Super module 1')).exists();
    assert.dom(screen.queryByText('Super module 2')).exists();

    const firstRow = screen.getByText('Super module 1').closest('tr');
    assert.dom(queryByText(firstRow, 'Public')).exists();
    assert.dom(queryByText(firstRow, 'Beta')).doesNotExist();
    assert.dom(queryByText(firstRow, 'Novice')).exists();

    const secondRow = screen.getByText('Super module 2').closest('tr');
    assert.dom(queryByText(secondRow, 'Privé')).exists();
    assert.dom(queryByText(secondRow, 'Beta')).exists();
    assert.dom(queryByText(secondRow, 'Avancé')).exists();
  });
});
