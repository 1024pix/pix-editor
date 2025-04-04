import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | pop-in/pdf-entries', function(hooks) {
  setupIntlRenderingTest(hooks);
  let callBackActionStub, closeTitleInputStub;

  hooks.beforeEach(async function() {
    // given
    callBackActionStub = sinon.stub();
    closeTitleInputStub = sinon.stub();
    this.callBackAction = callBackActionStub;
    this.closeTitleInput = closeTitleInputStub;

    // when
    await render(hbs `<PopIn::PdfEntries
                       @validateAction={{this.callBackAction}}
                       @close={{this.closeTitleInput}}
                       />`);
  });

  test('it should set default title and language on validate', async function(assert) {
    // when
    await click('[data-test-validate-pdf-entries]');

    // then
    assert.ok(callBackActionStub.calledOnce);
    assert.ok(closeTitleInputStub.calledOnce);
    assert.deepEqual(this.callBackAction.getCall(0).args, ['Liste des thèmes et des sujets abordés dans Pix', 'fr']);
  });

  test('it should set custom title and selected language on validate', async function(assert) {
    // when
    await fillIn('[data-test-pdf-title-field] input', 'mon titre');
    await click('[data-test-pdf-language-field]');
    await click('.pix-select-list-category__option');
    await click('[data-test-validate-pdf-entries]');

    // then
    assert.ok(callBackActionStub.calledOnce);
    assert.ok(closeTitleInputStub.calledOnce);
    assert.deepEqual(this.callBackAction.getCall(0).args, ['mon titre', 'en']);
  });
});
