import { click, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import ConfirmLog from 'pixeditor/components/pop-in/confirm-log';

module('Integration | Component | popin-confirm-log', function(hooks) {
  setupIntlRenderingTest(hooks);
  let approveActionStub, denyActionStub;
  hooks.beforeEach(async function() {
    const self = this;

    // given
    approveActionStub = sinon.stub();
    denyActionStub = sinon.stub();
    this.title = 'My title';
    this.approveAction = approveActionStub;
    this.denyAction = denyActionStub;
    this.defaultSaveChangelog = 'Mise à jour du prototype';

    // when
    await render(<template><ConfirmLog @title={{self.title}} @onApprove={{self.approveAction}} @onDeny={{self.denyAction}} @defaultValue={{self.defaultSaveChangelog}} /></template>);
  });

  test('it saves without changelog', async function(assert) {
    // when

    await click('[data-test-confirm-log-approve]');

    // then
    assert.dom('.pix-modal').exists();
    assert.ok(approveActionStub.calledOnce);
    assert.strictEqual(approveActionStub.getCall(0).args[0], null);
  });

  test('it saves with changelog', async function(assert) {
    // when
    await click('[data-test-confirm-log-check] input');
    await click('[data-test-confirm-log-approve]');

    // then
    assert.dom('.pix-modal').exists();
    assert.ok(approveActionStub.calledOnce);
    assert.strictEqual(approveActionStub.getCall(0).args[0], 'Mise à jour du prototype');
  });

  test('it should cancel', async function(assert) {
    // when
    await click('[data-test-confirm-log-cancel]');

    // then
    assert.dom('.pix-modal').exists();
    assert.ok(denyActionStub.calledOnce);
  });
});
