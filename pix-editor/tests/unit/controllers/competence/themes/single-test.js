import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence/themes/single', function(hooks) {
  setupTest(hooks);
  let controller, notifyMessageStub, notifyErrorStub, rollbackAttributesStub, loaderStartStub, loaderStopStub;

  hooks.beforeEach(function () {
    notifyMessageStub = sinon.stub();
    notifyErrorStub = sinon.stub();

    class NotifyService extends Service {
      message = notifyMessageStub;
      error = notifyErrorStub;
    }

    this.owner.register('service:notify', NotifyService);

    loaderStartStub = sinon.stub();
    loaderStopStub = sinon.stub();

    class LoaderService extends Service {
      start = loaderStartStub;
      stop = loaderStopStub;
    }

    this.owner.register('service:loader', LoaderService);

    rollbackAttributesStub = sinon.stub();
    const theme =  {
      name: 'themeName',
      rollbackAttributes: rollbackAttributesStub
    };

    controller = this.owner.lookup('controller:competence/themes/single');
    controller.model = theme;

  });

  test('it should cancel edition', function(assert) {
    // given
    controller.edition = true;

    // when
    controller.cancelEdit();

    // then
    assert.notOk(controller.edition);
    assert.ok(rollbackAttributesStub.calledOnce);
    assert.ok(notifyMessageStub.calledWith('Modification annulée'));
  });

  test('it should save modification', async function (assert) {
    // given
    const saveStub = sinon.stub().resolves();
    controller.model.save = saveStub;
    controller.edition = true;

    // when
    await controller.save();

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.notOk(controller.edition);
    assert.ok(saveStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyMessageStub.calledWith('Thématique mis à jour'));
  });

  test('it should catch an error if save action failed', async function (assert) {
    // given
    const errorMessage = {
      'error': ['error']
    };
    const saveStub = sinon.stub().rejects(errorMessage);
    controller.model.save = saveStub;
    controller.edition = true;

    const errorStub = sinon.stub();
    window.console = { error: errorStub };

    // when
    await controller.save();

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.ok(controller.edition);
    assert.ok(saveStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyErrorStub.calledWith('Erreur lors de la mise à jour de la thématique'));
    assert.deepEqual(errorStub.getCall(0).args[0], errorMessage);
  });
});
