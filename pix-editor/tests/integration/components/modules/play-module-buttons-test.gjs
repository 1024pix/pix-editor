import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PlayModuleButtons from 'pixeditor/components/modules/play-module-buttons';
import { module, test } from 'qunit';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Components | modules/play-module-buttons', function (hooks) {
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
      const screen = await render(<template><PlayModuleButtons @module={{draftModule}} /></template>);

      // then
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.play-module-button.play-draft') }))
        .hasAttribute('href', 'https://kapoue.org/module/play');
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.play-module-button.preview') }))
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
      const screen = await render(<template><PlayModuleButtons @module={{module}} /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: t('modules.components.play-module-button.play-module') })).exists();
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.play-module-button.play-module') }))
        .hasAttribute('href', 'https://kapoue-production.org/module/play');
      assert.dom(screen.getByRole('link', { name: t('modules.components.play-module-button.preview') })).exists();
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.play-module-button.preview') }))
        .hasAttribute('href', 'https://kapoue-production.org/module/preview');
    });
  });
});
