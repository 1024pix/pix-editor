import { render } from '@1024pix/ember-testing-library';
import DraftModuleDiff from 'pixeditor/components/modules/draft-module-diff';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | modules/draft-module-diff', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it display module internal title and diff', async function (assert) {
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
    assert.dom(screen.getByRole('heading', { name: internalTitle })).exists();
    assert.dom(screen.getByText('première ligne de diff')).exists();
    assert.dom(screen.getByText('deuxième ligne de diff')).exists();
  });

  test('it display a notification with a redirection production module button', async function (assert) {
    // given
    const internalTitle = 'MOD_test-diff';
    const draftModule = {
      internalTitle,
      moduleId: 'moduleId',
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
    assert.dom(screen.getByText("Ce module en draft est issue d'un module en production.")).exists();
    assert.dom(screen.getByRole('link', { name: 'Voir le détail du module en prod' })).exists();
  });
});
