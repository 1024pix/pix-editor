import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pop-in/pdf-entries', function(hooks) {
  setupRenderingTest(hooks);
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
    await fillIn('[data-test-pdf-title-field] input', 'mont titre');
    await click('[data-test-pdf-language-field] .ember-basic-dropdown-trigger');
    await click('.ember-power-select-option');
    await click('[data-test-validate-pdf-entries]');

    // then
    assert.ok(callBackActionStub.calledOnce);
    assert.ok(closeTitleInputStub.calledOnce);
    assert.deepEqual(this.callBackAction.getCall(0).args, ['mont titre', 'en']);
  });
});
