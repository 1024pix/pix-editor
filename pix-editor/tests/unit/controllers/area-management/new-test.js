import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | area-management/new', function(hooks) {
  setupTest(hooks);
  let controller, transitionToRouteStub, area, framework, notifyMessageStub, notifyErrorStub;

  hooks.beforeEach(function() {
    notifyMessageStub = sinon.stub();
    notifyErrorStub = sinon.stub();
    class NotifyService extends Service {
      message = notifyMessageStub;
      error = notifyErrorStub;
    }
    this.owner.register('service:notify', NotifyService);

    controller = this.owner.lookup('controller:area-management/new');
    transitionToRouteStub = sinon.stub();
    controller.router.transitionTo = transitionToRouteStub;
    area = {
      name: 'newArea'
    };
    framework = {
      name: 'Pix+'
    };
    controller.model = {
      area,
      framework
    };
  });

  test('it should cancel creation', function(assert) {
    // given
    const deleteRecordStub = sinon.stub();
    controller.store.deleteRecord = deleteRecordStub;

    // when
    controller.cancelEdit();

    // then
    assert.ok(deleteRecordStub.calledWith(area));
    assert.ok(notifyMessageStub.calledWith('Création du domaine annulé'));
    assert.ok(transitionToRouteStub.calledWith('index'));
  });

  module('#save', function(hooks) {
    let loaderStartStub, loaderStopStub;
    hooks.beforeEach(function () {
      loaderStartStub = sinon.stub();
      loaderStopStub = sinon.stub();

      class LoaderService extends Service {
        start = loaderStartStub;
        stop = loaderStopStub;
      }

      this.owner.register('service:loader', LoaderService);
    });

    test('it should save area', async function(assert) {
      // given
      const saveStub = sinon.stub().resolves();
      area.save = saveStub;

      const expectedArea = {
        name: 'newArea',
        framework,
        save: saveStub
      };

      // when
      await controller.save();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(saveStub.calledOnce);
      assert.deepEqual(controller.area, expectedArea);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyMessageStub.calledWith('Domaine créé'));
      assert.ok(transitionToRouteStub.calledWith('index'));
    });

    test('it should throw an error if saving failed', async function(assert) {
      // given
      const errorMessage = {
        'error': ['error-test']
      };
      const saveStub = sinon.stub().rejects(errorMessage);
      area.save = saveStub;

      // when
      await controller.save();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(saveStub.calledOnce);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyErrorStub.getCall(0).args, 'Erreur lors de la création du domaine');
    });
  });
});
