import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import BrokenUrlList from 'pixeditor/components/broken-urls/list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | broken-urls/list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store, brokenUrl1, brokenUrl2, ignoreBrokenUrl;

  hooks.beforeEach(async function () {
    ignoreBrokenUrl = sinon.stub();
    store = this.owner.lookup('service:store');
    brokenUrl1 = store.createRecord('broken-url', {
      url: 'https://tomate.com',
      statusCode: 404,
      errorMessage: null,
      frameworks: ['Pix', 'UnAutreRef'],
      tutorialIds: [],
      ignored: false,
    });
    brokenUrl2 = store.createRecord('broken-url', {
      url: 'https://carotte.com',
      statusCode: 401,
      errorMessage: null,
      frameworks: ['UnAutreRef'],
      tutorialIds: [],
      ignored: true,
    });
  });

  test('it should display list of broken tutorials urls', async function (assert) {
    // given
    const brokenUrls = [brokenUrl1, brokenUrl2];

    // when
    const screen = await render(
      <template><BrokenUrlList @brokenUrls={{brokenUrls}} @ignoreBrokenUrl={{ignoreBrokenUrl}} /></template>,
    );

    // then
    assert.ok(screen.getByRole('columnheader', { name: "URL Trier dans l'ordre décroissant des url" }));
  });

  test('it should reorder list of broken tutorials urls', async function (assert) {
    // given
    const brokenUrls = [brokenUrl1, brokenUrl2];

    // when
    const screen = await render(
      <template><BrokenUrlList @brokenUrls={{brokenUrls}} @ignoreBrokenUrl={{ignoreBrokenUrl}} /></template>,
    );

    const [, row1, row2] = screen.getAllByRole('row');
    const [cell11, , cell13] = within(row1).getAllByRole('cell');
    const [cell21, , cell23] = within(row2).getAllByRole('cell');
    assert.dom(cell11).hasText('https://carotte.com');
    assert.dom(cell21).hasText('https://tomate.com');
    assert.dom(cell13).hasText('UnAutreRef');
    assert.dom(cell23).hasText('Pix UnAutreRef');

    const orderButton = screen.getByRole('button', { name: "Trier dans l'ordre décroissant des url" });
    await click(orderButton);

    // then
    const [, row3, row4] = screen.getAllByRole('row');
    const [cell3] = within(row3).getAllByRole('cell');
    const [cell4] = within(row4).getAllByRole('cell');
    assert.dom(cell3).hasText('https://tomate.com');
    assert.dom(cell4).hasText('https://carotte.com');
  });

  test('it should display ignored toggle for each broken url', async function (assert) {
    // given
    const brokenUrls = [brokenUrl1, brokenUrl2];

    // when
    const screen = await render(
      <template><BrokenUrlList @brokenUrls={{brokenUrls}} @ignoreBrokenUrl={{ignoreBrokenUrl}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'À ignorer' })).exists();
    const [, carotteRow, tomateRow] = screen.getAllByRole('row');
    assert.dom(within(carotteRow).getByTitle("Vu et s'en tape")).isChecked();
    assert.dom(within(tomateRow).getByTitle("Vu et s'en tape")).isNotChecked();
  });

  test('it should call ignoreBrokenUrl with broken url when clicking its toggle', async function (assert) {
    // given
    const brokenUrls = [brokenUrl1, brokenUrl2];
    const screen = await render(
      <template><BrokenUrlList @brokenUrls={{brokenUrls}} @ignoreBrokenUrl={{ignoreBrokenUrl}} /></template>,
    );

    // when
    const [, , tomateRow] = screen.getAllByRole('row');
    await click(within(tomateRow).getByTitle("Vu et s'en tape"));

    // then
    assert.ok(ignoreBrokenUrl.calledOnce);
    assert.strictEqual(ignoreBrokenUrl.firstCall.args[0], brokenUrl1);
  });
});
