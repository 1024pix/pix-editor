import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | competence-management/new', function (hooks) {
  setupTest(hooks);
  let controller, transitionToRouteStub, area, competence, pixToastSendSuccess, pixToastSendError;
  hooks.beforeEach(function () {
    pixToastSendSuccess = sinon.stub();
    pixToastSendError = sinon.stub();
    class PixToastNotificationsStub extends Service {
      sendSuccess = pixToastSendSuccess;
      sendError = pixToastSendError;
    }
    this.owner.register('service:notifications', PixToastNotificationsStub);
    controller = this.owner.lookup('controller:authenticated.competence-management/new');
    controller.edition = true;
    transitionToRouteStub = sinon.stub();
    controller.router.transitionTo = transitionToRouteStub;
    area = {
      source: 'Pix+',
      framework: { name: 'Pix+' },
    };
    competence = {
      code: '1.1',
      rawThemes: ['theme'],
      rawTubes: ['tube'],
    };
    controller.model = {
      area,
      competence,
    };
  });

  test('it should cancel creation', function (assert) {
    // given
    const deleteRecordStub = sinon.stub();
    controller.store.deleteRecord = deleteRecordStub;

    // when
    controller.cancelEdit();

    // then
    assert.notOk(controller.edition);
    assert.ok(deleteRecordStub.calledWith(competence));
    assert.ok(pixToastSendSuccess.calledWith('Création de la compétence annulée'));
    assert.ok(transitionToRouteStub.calledWith('authenticated'));
  });

  module('#save', function (hooks) {
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

    test('it should save competence', async function (assert) {
      // given
      const saveStub = sinon.stub().resolves();
      competence.save = saveStub;
      const expectedCompetence = {
        area,
        code: '1.1',
        rawThemes: ['theme'],
        rawTubes: ['tube'],
        save: saveStub,
      };
      // when
      await controller.save();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.notOk(controller.edition);
      assert.ok(saveStub.calledOnce);
      assert.deepEqual(controller.model.competence, expectedCompetence);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(pixToastSendSuccess.getCall(0).args, ['Compétence créée']);
      assert.ok(
        transitionToRouteStub.calledWith('authenticated.competence.skills', controller.model.competence.id, {
          queryParams: { view: 'workbench' },
        }),
      );
    });

    test('it should throw an error if saving failed', async function (assert) {
      // given
      const errorMessage = { error: ['error-test'] };
      const saveStub = sinon.stub().rejects(errorMessage);
      competence.save = saveStub;

      // when
      await controller.save();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(controller.edition);
      assert.ok(saveStub.calledOnce);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(pixToastSendError.calledWith('Erreur lors de la création de la compétence'));
    });
  });
});
