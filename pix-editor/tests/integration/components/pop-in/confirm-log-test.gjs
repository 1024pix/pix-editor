import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ConfirmLog from 'pixeditor/components/pop-in/confirm-log';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | popin-confirm-log', function (hooks) {
  setupIntlRenderingTest(hooks);
  let approveActionStub, denyActionStub, screen;
  hooks.beforeEach(async function () {
    const self = this;

    // given
    approveActionStub = sinon.stub();
    denyActionStub = sinon.stub();
    this.title = 'My title';
    this.approveAction = approveActionStub;
    this.denyAction = denyActionStub;
    this.defaultSaveChangelog = 'Mise à jour du prototype';

    // when
    screen = await render(
      <template>
        <ConfirmLog
          @title={{self.title}}
          @onApprove={{self.approveAction}}
          @onDeny={{self.denyAction}}
          @defaultValue={{self.defaultSaveChangelog}}
          @showModal={{true}}
        />
      </template>,
    );
  });

  test('it saves without changelog', async function (assert) {
    // when
    await click(screen.getByRole('button', { name: /Valider/ }));

    // then
    assert.ok(approveActionStub.calledOnce);
    assert.strictEqual(approveActionStub.getCall(0).args[0], null);
  });

  test('it saves with changelog', async function (assert) {
    // when
    await click(screen.getByRole('checkbox', { name: 'Je veux ajouter une note de changelog' }));
    await click(screen.getByRole('button', { name: /Valider/ }));

    // then
    assert.ok(approveActionStub.calledOnce);
    assert.strictEqual(approveActionStub.getCall(0).args[0], self.defaultSaveChangelog);
  });

  test('it should cancel', async function (assert) {
    // when
    await click(screen.getByRole('button', { name: /Annuler/ }));

    // then
    assert.ok(denyActionStub.calledOnce);
  });
});
