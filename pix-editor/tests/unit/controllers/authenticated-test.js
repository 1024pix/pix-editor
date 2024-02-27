import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | authenticated', function(hooks) {
  setupTest(hooks);

  let controller, confirmAskStub, storeQueryStub, reloadStub;

  hooks.beforeEach(function () {
    storeQueryStub = sinon.stub();
    class Store extends Service {
      queryRecord = storeQueryStub;
    }
    this.owner.register('service:store', Store);

    confirmAskStub = sinon.stub();
    class Confirm extends Service {
      ask = confirmAskStub;
      setTarget = sinon.stub();
    }
    this.owner.register('service:confirm', Confirm);

    controller = this.owner.lookup('controller:authenticated');

    reloadStub = sinon.stub();
  });

  test('it should reload when user confirms new version notification', async function(assert) {
    // given
    storeQueryStub.resolves({ version: 'nouvelle version' });
    confirmAskStub.resolves();

    // when
    await controller.checkApiVersion(reloadStub);

    // then
    assert.true(reloadStub.calledOnce, 'window.location.reload() called');
  });


  test('it should not reload when user does not confirm new version notification', async function(assert) {
    // given
    storeQueryStub.resolves({ version: 'nouvelle version' });
    confirmAskStub.rejects();

    // when
    await controller.checkApiVersion(reloadStub);

    // then
    assert.false(reloadStub.calledOnce, 'window.location.reload() called');
  });
});
