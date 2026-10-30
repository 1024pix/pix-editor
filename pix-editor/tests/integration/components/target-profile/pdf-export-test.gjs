import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import PdfExport from 'pixeditor/components/target-profile/pdf-export';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | target-profile/pdf-export', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    // when
    const screen = await render(<template><PdfExport /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: 'PDF' })).exists();
  });

  module('when clicking on button', function () {
    test('it should display a modal', async function (assert) {
      // given
      const screen = await render(<template><PdfExport /></template>);

      // when
      await click(screen.getByRole('button', { name: 'PDF' }));

      // then
      assert.dom(await screen.findByRole('dialog')).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Titre' })).exists();
    });
  });
});
