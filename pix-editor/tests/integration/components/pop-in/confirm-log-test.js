import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | popin-confirm-log', function(hooks) {
  setupRenderingTest(hooks);

  test('it saves without changelog', async function(assert) {
    // given
    const approveActionStub = sinon.stub();
    const denyActionStub = sinon.stub();
    this.approveAction = approveActionStub;
    this.denyAction = denyActionStub;
    this.defaultSaveChangelog = 'Mise à jour du prototype';

    // when
    await render(hbs`<PopIn::ConfirmLog
        @onApprove={{this.approveAction}}
        @onDeny={{this.denyAction}}
        @defaultValue={{this.defaultSaveChangelog}}/>`);

    await click('[data-test-confirm-log-approve]');

    // then
    assert.dom('.ember-modal-dialog').exists();
    assert.ok(approveActionStub.calledOnce);
    assert.equal(approveActionStub.getCall(0).args[0], null);
  });

  test('it saves with changelog', async function(assert) {
    // given
    const approveActionStub = sinon.stub();
    const denyActionStub = sinon.stub();
    this.approveAction = approveActionStub;
    this.denyAction = denyActionStub;
    this.defaultSaveChangelog = 'Mise à jour du prototype';

    // when
    await render(hbs`<PopIn::ConfirmLog
        @onApprove={{this.approveAction}}
        @onDeny={{this.denyAction}}
        @defaultValue={{this.defaultSaveChangelog}}/>`);

    await click('[data-test-confirm-log-check] input');
    await click('[data-test-confirm-log-approve]');

    // then
    assert.dom('.ember-modal-dialog').exists();
    assert.ok(approveActionStub.calledOnce);
    assert.equal(approveActionStub.getCall(0).args[0], 'Mise à jour du prototype');
  });

  test('it should cancel', async function(assert) {
    // given
    const approveActionStub = sinon.stub();
    const denyActionStub = sinon.stub();
    this.approveAction = approveActionStub;
    this.denyAction = denyActionStub;
    this.defaultSaveChangelog = 'Mise à jour du prototype';

    // when
    await render(hbs`<PopIn::ConfirmLog
        @onApprove={{this.approveAction}}
        @onDeny={{this.denyAction}}
        @defaultValue={{this.defaultSaveChangelog}}/>`);

    await click('[data-test-confirm-log-cancel]');

    // then
    assert.dom('.ember-modal-dialog').exists();
    assert.ok(denyActionStub.calledOnce);
  });
});
