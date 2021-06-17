import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('unit | Component | sidebar/navigation', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:sidebar/navigation');
  });

  test('it should display newFramework pop-in', function(assert) {
    // given
    const newFramework = { name: '' };
    const createRecordStub = sinon.stub().returns(newFramework);
    const storeStub = { createRecord: createRecordStub };

    component.store = storeStub;

    // when
    component._openNewFrameworkPopIn();

    // then
    assert.ok(createRecordStub.calledWith('framework', {}));
    assert.deepEqual(component.newFramework, newFramework);
    assert.ok(component.displayNewFrameworkPopIn);
  });

  test('it should hide newFramework pop-in', function(assert) {
    // given
    const framework = { name: 'pix +' };
    const deleteRecordStub = sinon.stub();
    const storeStub = { deleteRecord: deleteRecordStub };
    component.store = storeStub;
    component.newFramework = framework;

    // when
    component.closeNewFrameworkPopIn();

    // then
    assert.ok(deleteRecordStub.calledWith(framework));
    assert.notOk(component.displayNewFrameworkPopIn);
  });

  module('#saveFramework', function(hooks) {
    let notifyMessageStub, notifyErrorStub, loaderStartStub, loaderStopStub;
    hooks.beforeEach(function () {
      notifyMessageStub = sinon.stub();
      notifyErrorStub = sinon.stub();

      component.notify = {
        message: notifyMessageStub,
        error: notifyErrorStub,
      };

      loaderStartStub = sinon.stub();
      loaderStopStub = sinon.stub();

      component.loader = {
        start: loaderStartStub,
        stop: loaderStopStub,
      };
    });

    test('it should save the framework', async function(assert) {
      // given
      const transitionToStub = sinon.stub();
      component.router = {
        transitionTo: transitionToStub,
      };
      const setFrameworkStub = sinon.stub();
      component.currentData = {
        setFramework: setFrameworkStub,
      };
      const saveStub = sinon.stub().resolves();
      const framework = {
        name: 'pix +',
        save: saveStub,
      };
      component.newFramework = framework;

      // when
      await component.saveFramework();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(setFrameworkStub.calledWith(framework));
      assert.deepEqual(component._selectedFramework, {
        label: 'pix +',
        data: framework
      });
      assert.ok(notifyMessageStub.calledWith('Référentiel créé'));
      assert.notOk(component.displayNewFrameworkPopIn);
      assert.ok(transitionToStub.calledWith('index'));
    });

    test('it should catch an error if save framework failed', async function(assert) {
      // given
      const errorMessage = {
        'error': ['error-test']
      };
      const saveStub = sinon.stub().rejects(errorMessage);
      component.newFramework = {
        name: 'pix +',
        save: saveStub,
      };

      // when
      await component.saveFramework();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyErrorStub.calledWith('Erreur lors de la création du Référentiel'));
    });
  });
});
