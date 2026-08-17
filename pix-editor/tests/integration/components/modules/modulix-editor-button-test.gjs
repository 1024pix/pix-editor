import { render } from '@1024pix/ember-testing-library';
import { click, settled } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModulixEditorButton from 'pixeditor/components/modules/modulix-editor-button';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Components | modules/modulix-editor-button', function (hooks) {
  setupIntlRenderingTest(hooks);
  let originalWindowOpen;

  hooks.beforeEach(function () {
    // given
    originalWindowOpen = window.open;
  });

  hooks.afterEach(function () {
    window.open = originalWindowOpen;
  });

  test('it displays a button', async function (assert) {
    // given
    // when
    const screen = await render(<template><ModulixEditorButton /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: t('modules.modulix-editor-button.label') })).exists();
  });

  module('when button is clicked', function () {
    module('when draft module exists', function () {
      test("it redirects and sends the module's content via a postMessage", async function (assert) {
        // given
        const postMessageStub = sinon.stub();
        const openStub = sinon.stub(window, 'open');
        openStub.returns({ postMessage: postMessageStub });

        const store = this.owner.lookup('service:store');
        const draftModule = store.createRecord('draft-module', {
          id: 'moduleId',
          url: 'https://kapoue.org/module/play',
          previewUrl: 'https://kapoue.org/module/preview',
        });

        const screen = await render(<template><ModulixEditorButton @moduleContent={{draftModule}} /></template>);
        await click(screen.getByRole('button', { name: t('modules.modulix-editor-button.label') }));

        // when
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { from: 'modulix-editor', message: 'ready' },
          }),
        );
        await settled();

        // then
        assert.true(postMessageStub.calledWithExactly({ from: 'pix-editor', moduleContent: draftModule }, '*'));
        sinon.assert.calledOnceWithExactly(openStub, 'https://app.modulix-editor.io', 'modulix-editor-edit');
      });
    });

    module('when no draft module exists', function () {
      test('it only redirects', async function (assert) {
        // given
        const postMessageStub = sinon.stub();
        const openStub = sinon.stub(window, 'open');
        openStub.returns({ postMessage: postMessageStub });

        const screen = await render(<template><ModulixEditorButton /></template>);
        await click(screen.getByRole('button', { name: t('modules.modulix-editor-button.label') }));

        // when
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { from: 'modulix-editor', message: 'ready' },
          }),
        );
        await settled();

        // then
        assert.false(postMessageStub.calledOnce);
        assert.true(openStub.calledWithExactly('https://app.modulix-editor.io', 'modulix-editor-edit'));
      });
    });
  });
});
