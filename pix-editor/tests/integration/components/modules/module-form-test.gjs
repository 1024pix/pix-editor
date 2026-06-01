import ModuleForm from 'pixeditor/components/modules/module-form';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

const isChrome = navigator?.userAgent?.includes(' Chrome/');

module('Integration | Component | modules/module-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test.if('it parses and saves a module data', !isChrome, async function (assert) {
    // given
    const saveModule = sinon.stub();

    // when
    const screen = await render(<template><ModuleForm @saveModule={{saveModule}} /></template>);

    // then
    const saveButton = screen.getByRole('button', { name: 'Enregistrer' });
    assert.dom(saveButton).hasAttribute('aria-disabled');

    const internalTitle = screen.getByRole('textbox', { name: /^Titre interne/ });
    await fillIn(internalTitle, 'PALOURDE_MAGIQUE');

    assert.dom(saveButton).hasAttribute('aria-disabled');

    const monacoEditor = await screen.findByLabelText('Contenu (JSON)');
    assert.dom(monacoEditor).exists();

    await fillIn(monacoEditor, JSON.stringify({ slug: 'limaçoooooooooooooooooooon' }));

    assert.dom(saveButton).doesNotHaveAttribute('aria-disabled');

    await click(saveButton);
    sinon.assert.calledWithExactly(saveModule, {
      internalTitle: 'PALOURDE_MAGIQUE',
      slug: 'limaçoooooooooooooooooooon',
    });

    // WORKAROUND: let some time for monaco-editor to dismount
    await new Promise((resolve) => setTimeout(resolve, 100));
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
      assert.dom(screen.getByRole('textbox', { name: /^Titre interne/ })).hasValue(module.internalTitle);

      assert
        .dom(await screen.findByLabelText('Contenu (JSON)'))
        .hasValue(JSON.stringify(moduleWoInternalTitle, null, 2));

      // WORKAROUND: let some time for monaco-editor to dismount
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});
