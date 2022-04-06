import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence/themes/new', function(hooks) {
  setupTest(hooks);
  let controller, notifyMessageStub, notifyErrorStub, loaderStartStub, loaderStopStub, deleteRecordStub;

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

    deleteRecordStub = sinon.stub();

    class StoreService extends Service {
      deleteRecord = deleteRecordStub;
    }

    this.owner.register('service:store', StoreService);

    controller = this.owner.lookup('controller:competence/themes/new');
    controller.model = {} ;
    controller.edition = true;
  });

  test('it should cancel creation', function(assert) {
    // given
    controller.model.name = 'newTheme';
    const parentControllerSendStub = sinon.stub();
    controller.parentController = {
      send: parentControllerSendStub
    };

    // when
    controller.cancelEdit();

    // then
    assert.ok(deleteRecordStub.calledWith({ name: 'newTheme' }));
    assert.notOk(controller.edition);
    assert.ok(notifyMessageStub.calledWith('Création annulée'));
    assert.ok(parentControllerSendStub.calledWith('closeChildComponent'));
  });

  test('it should save record', async function(assert) {
    // given
    class CurrentDataService extends Service {
      getCompetence() {
        return {
          name:'Competence'
        };
      }
    }
    this.owner.register('service:currentData', CurrentDataService);

    const transitionToRouteStub = sinon.stub();
    controller.router.transitionTo = transitionToRouteStub;

    const saveStub = sinon.stub().resolves();
    controller.model.save = saveStub;

    // when
    await controller.save();

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.notOk(controller.edition);
    assert.ok(saveStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyMessageStub.calledWith('Thématique créé'));
    assert.ok(transitionToRouteStub.calledOnce);
  });

  test('it should catch an error if save action failed', async function (assert) {
    // given
    class CurrentDataService extends Service {
      getCompetence() {
        return {
          name:'Competence'
        };
      }
    }
    this.owner.register('service:currentData', CurrentDataService);

    const errorMessage = {
      'error': ['error-test']
    };
    const saveStub = sinon.stub().rejects(errorMessage);
    controller.model.save = saveStub;

    // when
    await controller.save();

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.ok(controller.edition);
    assert.ok(saveStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyErrorStub.calledWith('Erreur lors de la création de la thématique'));
  });
});
