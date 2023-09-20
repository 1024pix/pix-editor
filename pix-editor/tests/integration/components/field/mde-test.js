import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | form-mde.hbs', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display Tui editor if `edition` is `true`', async function(assert) {
    // given
    this.set('edition', true);

    // when
    await render(hbs`<Field::mde @edition={{this.edition}} />`);

    // then
    assert.dom('[data-test-tui-editor]').exists();
  });

  test('it should display `MarkdownToHtml` if `edition` is `false`', async function(assert) {
    // given
    this.set('edition', false);

    // when
    await render(hbs`<Field::mde @edition={{this.edition}} />`);

    // then
    assert.dom('[data-test-markdow-to-html]').exists();
  });
});
