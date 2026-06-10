import { render } from '@1024pix/ember-testing-library';
import Mde from 'pixeditor/components/field/mde';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | form-mde.hbs', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display Tui editor if `edition` is `true`', async function (assert) {
    const self = this;

    // given
    this.edition = true;

    // when
    const screen = await render(<template><Mde @edition={{self.edition}} /></template>);

    // then
    assert.dom(screen.getByRole('textbox')).exists();
  });

  test('it should display `MarkdownToHtml` if `edition` is `false`', async function (assert) {
    const self = this;

    // given
    this.edition = false;

    // when
    await render(<template><Mde @edition={{self.edition}} /></template>);

    // then
    assert.dom('[data-test-markdow-to-html]').exists();
  });
});
