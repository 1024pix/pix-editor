import ModuleForm from 'pixeditor/components/modules/module-form';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | modules/module-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders', async function (assert) {
    // given
    const saveModule = sinon.stub();

    // when
    const screen = await render(<template><ModuleForm @saveModule={{saveModule}} /></template>);

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Titre' })).hasAttribute('readonly');
    const monacoEditor = await screen.findByLabelText('Contenu (JSON)');
    assert.dom(monacoEditor).exists();
    const saveButton = screen.getByRole('button', { name: 'Enregistrer' });

    await fillIn(monacoEditor, JSON.stringify({ title: 'Mon titre' }));

    assert.dom(saveButton).doesNotHaveAttribute('aria-disabled');
    assert.dom(screen.getByRole('textbox', { name: 'Titre' })).hasValue('Mon titre');

    await click(saveButton);
    sinon.assert.calledWithExactly(saveModule, { title: 'Mon titre' });

    // WORKAROUND: let some time for monaco-editor to dismount
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});
