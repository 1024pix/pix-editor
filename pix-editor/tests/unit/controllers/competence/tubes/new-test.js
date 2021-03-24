import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';


module('Unit | Controller | competence/tubes/new', function(hooks) {
  setupTest(hooks);

  let controller, notifyMessageStub, notifyErrorStub, loaderStartStub, loaderStopStub, deleteRecordStub, themeRollbackAttributesStub;

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

    class CurrentDataService extends Service {
      getCompetence() {
        return {
          name:'Competence'
        };
      }
    }
    this.owner.register('service:currentData', CurrentDataService);

    deleteRecordStub = sinon.stub();

    class StoreService extends Service {
      deleteRecord = deleteRecordStub;
    }
    this.owner.register('service:store', StoreService);

    controller = this.owner.lookup('controller:competence/tubes/new');

    themeRollbackAttributesStub = sinon.stub();
    controller.model = EmberObject.create({
      theme: {
        rollbackAttributes: themeRollbackAttributesStub,
      }
    });
    controller.edition = true;
  });

  test('it should cancel creation', async function(assert) {
    // given
    controller.model.name = 'newTube';
    const parentControllerSendStub = sinon.stub();
    controller.parentController = {
      send: parentControllerSendStub,
    };

    // when
    await controller.cancelEdit();

    // then
    assert.ok(themeRollbackAttributesStub.calledOnce);
    assert.ok(deleteRecordStub.calledWith(controller.model));
    assert.notOk(controller.edition);
    assert.ok(notifyMessageStub.calledWith('Création annulée'));
    assert.ok(parentControllerSendStub.calledWith('closeChildComponent'));
  });

  test('it should save record', async function(assert) {
    // given
    const transitionToRouteStub = sinon.stub();
    controller.transitionToRoute = transitionToRouteStub;

    const saveStub = sinon.stub().resolves();
    controller.model.save = saveStub;

    // when
    await controller.save();

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.notOk(controller.edition);
    assert.ok(saveStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyMessageStub.calledWith('Tube créé'));
    assert.ok(transitionToRouteStub.calledWith('competence.tubes.single', { name:'Competence' }, controller.model));
  });

  test('it should catch an error if save action failed', async function (assert) {
    // given
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
    assert.ok(notifyErrorStub.calledWith('Erreur lors de la création du tube'));
  });
});
