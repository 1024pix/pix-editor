import { render } from '@1024pix/ember-testing-library';
import DraftModuleDiff from 'pixeditor/components/modules/draft-module-diff';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/draft-module-diff', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays module internal title and diff', async function (assert) {
    // given
    const internalTitle = 'MOD_test-diff';
    const draftModule = {
      internalTitle,
    };
    const htmlDiff = `
        <pre class="shiki">
          <code>
            <span>première ligne de diff</span>
            <span>deuxième ligne de diff</span>
          </code>
        </pre>
      `;

    // when
    const screen = await render(
      <template><DraftModuleDiff @draftModule={{draftModule}} @htmlDiff={{htmlDiff}} /></template>,
    );

    // then
    assert.dom(screen.getByText('première ligne de diff')).exists();
    assert.dom(screen.getByText('deuxième ligne de diff')).exists();
  });
});
