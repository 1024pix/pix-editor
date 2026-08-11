import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModuleForm from 'pixeditor/components/modules/module-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

const isChrome = navigator?.userAgent?.includes(' Chrome/');

module('Integration | Component | modules/module-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.afterEach(async function () {
    // WORKAROUND: let some time for monaco-editor to dismount
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  test.if('it parses and saves a module data', !isChrome, async function (assert) {
    // given
    const saveModule = sinon.stub();

    // when
    const screen = await render(<template><ModuleForm @saveModule={{saveModule}} /></template>);

    // then
    const saveButton = screen.getByRole('button', { name: t('modules.components.module-form.save') });
    assert.dom(saveButton).hasAttribute('aria-disabled');

    const internalTitle = screen.getByRole('textbox', {
      name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
    });
    await fillIn(internalTitle, 'PALOURDE_MAGIQUE');

    assert.dom(saveButton).hasAttribute('aria-disabled');

    const monacoEditor = await screen.findByLabelText(t('modules.components.module-form.content-label'));
    assert.dom(monacoEditor).exists();

    await fillIn(monacoEditor, JSON.stringify({ slug: 'limaçoooooooooooooooooooon' }));

    assert.dom(saveButton).doesNotHaveAttribute('aria-disabled');

    await click(saveButton);
    sinon.assert.calledWithExactly(saveModule, {
      internalTitle: 'PALOURDE_MAGIQUE',
      slug: 'limaçoooooooooooooooooooon',
    });
  });

  module('when a module is given in argument', function () {
    test.if('it uses module’s data as default value', !isChrome, async function (assert) {
      // given
      const moduleWoInternalTitle = {
        id: 'dadfd2d3-0430-47ce-ae0f-455459f12d3b',
        shortId: 'dadfd2d3',
        slug: 'escargot-de-bourgogne',
        details: { level: 1000 },
        sections: [],
      };
      const module = {
        ...moduleWoInternalTitle,
        internalTitle: 'MOL_escargot-bourgogne',
      };

      // when
      const screen = await render(<template><ModuleForm @module={{module}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('textbox', {
            name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
          }),
        )
        .hasValue(module.internalTitle);

      assert
        .dom(await screen.findByLabelText(t('modules.components.module-form.content-label')))
        .hasValue(JSON.stringify(moduleWoInternalTitle, null, 2));
    });
  });

  module('when module-form is readonly', function () {
    test('it should not display actions buttons', async function (assert) {
      const moduleWoInternalTitle = {
        id: 'dadfd2d4-0430-47ce-ae0f-455459f12d3b',
        shortId: 'dadfd2d4',
        slug: 'escargot-du loiret',
        details: { level: 1001 },
        sections: [],
      };
      const module = {
        ...moduleWoInternalTitle,
        internalTitle: 'MOL_escargot-loiret',
      };

      // when
      const screen = await render(<template><ModuleForm @module={{module}} @readonly={{true}} /></template>);

      // then
      assert
        .dom(
          await screen.queryByRole('textbox', {
            name: new RegExp(`^${t('modules.components.module-form.internal-title-label')}`),
          }),
        )
        .doesNotExist();
      assert.dom(screen.getByRole('heading', { name: 'MOL_escargot-loiret' })).exists();

      assert.dom(await screen.queryByRole('button', { name: t('modules.components.module-form.save') })).doesNotExist();
      assert
        .dom(await screen.queryByRole('button', { name: t('modules.components.module-form.cancel') }))
        .doesNotExist();
    });
  });
});
