import { render } from '@1024pix/ember-testing-library';
import ModulePreviewButtons from 'pixeditor/components/modules/module-preview-buttons';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Components | modules/module-preview-buttons', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when module is draft', function () {
    test('it displays play and preview buttons', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const draftModule = store.createRecord('draft-module', {
        id: 'moduleId',
        url: 'https://kapoue.org/module/play',
        previewUrl: 'https://kapoue.org/module/preview',
      });

      // when
      const screen = await render(<template><ModulePreviewButtons @module={{draftModule}} /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: 'Jouer le draft' })).exists();
      assert
        .dom(screen.getByRole('link', { name: 'Jouer le draft' }))
        .hasAttribute('href', 'https://kapoue.org/module/play');
      assert.dom(screen.getByRole('link', { name: 'Prévisualiser' })).exists();
      assert
        .dom(screen.getByRole('link', { name: 'Prévisualiser' }))
        .hasAttribute('href', 'https://kapoue.org/module/preview');
    });
  });

  module('when module is in production', function () {
    test('it displays play and preview buttons', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const module = store.createRecord('module', {
        id: 'moduleId',
        url: 'https://kapoue-production.org/module/play',
        previewUrl: 'https://kapoue-production.org/module/preview',
      });

      // when
      const screen = await render(<template><ModulePreviewButtons @module={{module}} /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: 'Jouer le module' })).exists();
      assert
        .dom(screen.getByRole('link', { name: 'Jouer le module' }))
        .hasAttribute('href', 'https://kapoue-production.org/module/play');
      assert.dom(screen.getByRole('link', { name: 'Prévisualiser' })).exists();
      assert
        .dom(screen.getByRole('link', { name: 'Prévisualiser' }))
        .hasAttribute('href', 'https://kapoue-production.org/module/preview');
    });
  });
});
