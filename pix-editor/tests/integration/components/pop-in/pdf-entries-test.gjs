import { clickByText, fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import PopinPdfEntries from 'pixeditor/components/pop-in/pdf-entries';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | pop-in/pdf-entries', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen, callBackActionStub, closeTitleInputStub;

  hooks.beforeEach(async function () {
    // given
    callBackActionStub = sinon.stub();
    closeTitleInputStub = sinon.stub();

    // when
    screen = await render(<template><PopinPdfEntries
      @validateAction={{callBackActionStub}}
      @close={{closeTitleInputStub}}
      @showModal={{true}}
    /></template>);
  });

  test('it should set default title and language on validate', async function (assert) {
    // when
    await clickByText('Valider');

    // then
    assert.ok(callBackActionStub.calledOnce);
    assert.ok(closeTitleInputStub.calledOnce);
    assert.deepEqual(callBackActionStub.getCall(0).args, ['Liste des thèmes et des sujets abordés dans Pix', 'fr']);
  });

  test('it should set custom title and selected language on validate', async function (assert) {
    // when
    await fillByLabel('Titre', 'mont titre');
    await clickByText('Langue');
    await click(await screen.findByRole('option', { name: 'Anglais' }));
    await clickByText('Valider');

    // then
    assert.ok(callBackActionStub.calledOnce);
    assert.ok(closeTitleInputStub.calledOnce);
    assert.deepEqual(callBackActionStub.getCall(0).args, ['mont titre', 'en']);
  });
});
