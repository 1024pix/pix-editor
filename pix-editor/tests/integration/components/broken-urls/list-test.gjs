import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import BrokenUrlList from 'pixeditor/components/broken-urls/list';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | broken-urls/list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store, brokenUrl1, brokenUrl2;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    brokenUrl1 = store.createRecord('broken-url', {
      url: 'https://tomate.com',
      statusCode: 404,
      errorMessage: null,
      tutorialIds: [],
    });
    brokenUrl2 = store.createRecord('broken-url', {
      url: 'https://carotte.com',
      statusCode: 401,
      errorMessage: null,
      tutorialIds: [],
    });
  });

  test('it should display list of broken tutorials urls', async function (assert) {
    // given
    const brokenUrls = [brokenUrl1, brokenUrl2];
    // when
    const screen = await render(<template><BrokenUrlList @brokenUrls={{brokenUrls}} /></template>);

    // then
    assert.ok(screen.getByRole('columnheader', { name: "URL Trier dans l'ordre décroissant des url" }));
  });

  test('it should reorder list of broken tutorials urls', async function (assert) {
    // given
    const brokenUrls = [brokenUrl1, brokenUrl2];
    // when
    const screen = await render(<template><BrokenUrlList @brokenUrls={{brokenUrls}} /></template>);

    const [, row1, row2] = screen.getAllByRole('row');
    const [cell1] = within(row1).getAllByRole('cell');
    const [cell2] = within(row2).getAllByRole('cell');
    assert.dom(cell1).hasText('https://carotte.com');
    assert.dom(cell2).hasText('https://tomate.com');

    const orderButton = screen.getByRole('button', { name: "Trier dans l'ordre décroissant des url" });
    await click(orderButton);

    // then
    const [, row3, row4] = screen.getAllByRole('row');
    const [cell3] = within(row3).getAllByRole('cell');
    const [cell4] = within(row4).getAllByRole('cell');
    assert.dom(cell3).hasText('https://tomate.com');
    assert.dom(cell4).hasText('https://carotte.com');
  });
});
