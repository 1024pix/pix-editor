import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence', function(hooks) {
  setupTest(hooks);
  let controller, theme1, theme2, notifyMessageStub, notifyErrorStub, rollbackAttributesStub, loaderStartStub, loaderStopStub;

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

    controller = this.owner.lookup('controller:competence');

    theme1 = {
      name: 'theme1',
      rollbackAttributes: rollbackAttributesStub
    };
    theme2 = {
      name: 'theme2',
      rollbackAttributes: rollbackAttributesStub
    };
  });
  module('#theme sorting', function () {
    test('it should display sort theme pop-in', function(assert) {
      // when
      controller.displaySortThemesPopIn();

      // then
      assert.ok(controller.sortingPopInTitle === 'Trie des thématiques');
      assert.ok(controller.sortingName === 'theme');
      assert.ok(controller.displaySortingPopIn);
      assert.deepEqual(controller.sortingPopInApproveAction, controller.sortThemes);
      assert.deepEqual(controller.sortingPopInCancelAction, controller.cancelThemesSorting);
    });

    test('it should cancel theme sorting', function (assert) {
      // given
      controller.displaySortingPopIn = true;

      // when
      controller.cancelThemesSorting([theme1, theme2]);

      // then
      assert.notOk(controller.displaySortingPopIn);
      assert.ok(rollbackAttributesStub.calledTwice);
    });

    test('it should sort theme', async function (assert) {
      // given
      const saveStub = sinon.stub().resolves();
      theme1.save = saveStub;
      theme2.save = saveStub;
      controller.displaySortingPopIn = true;

      // when
      await controller.sortThemes([theme1, theme2]);

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.notOk(controller.displaySortingPopIn);
      assert.ok(saveStub.calledTwice);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyMessageStub.calledWith('Thématiques ordonnées'));
    });

    test('it should throw an error if sort theme saving is wrong', async function (assert) {
      // given
      const errorMessage = {
        'error': ['error']
      };
      const saveStub = sinon.stub().rejects(errorMessage);
      theme1.save = saveStub;
      theme2.save = saveStub;
      controller.displaySortingPopIn = true;

      const errorStub = sinon.stub();
      window.console.error = errorStub;

      // when
      await controller.sortThemes([theme1, theme2]);

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(controller.displaySortingPopIn);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyErrorStub.calledWith('Erreur lors du trie des thématiques'));
      assert.deepEqual(errorStub.getCall(0).args[0], errorMessage);
    });
  });

  module('#tube sorting', function (hooks) {
    let rollbackTubeAttributesStub, tube1_1, tube1_2, tube2_1;

    hooks.beforeEach(function () {
      rollbackTubeAttributesStub = sinon.stub();

      tube1_1 = {
        name: 'tube1',
        rollbackAttributes: rollbackTubeAttributesStub
      };
      tube1_2 = {
        name: 'tube2',
        rollbackAttributes: rollbackTubeAttributesStub
      };
      tube2_1 = {
        name: 'tube3',
        rollbackAttributes: rollbackTubeAttributesStub
      };
      theme1.tubes = [tube1_1, tube1_2];
      theme2.tubes = [tube2_1];
    });
    test('it should display sort tubes pop-in', function(assert) {
      // when
      controller.displaySortTubesPopIn();

      // then
      assert.ok(controller.sortingPopInTitle === 'Trie des tubes');
      assert.ok(controller.sortingName === 'tube');
      assert.ok(controller.displaySortingPopIn);
      assert.deepEqual(controller.sortingPopInApproveAction, controller.sortTubes);
      assert.deepEqual(controller.sortingPopInCancelAction, controller.cancelTubesSorting);
    });

    test('it should cancel tube sorting', function (assert) {
      // given
      controller.displaySortingPopIn = true;

      // when
      controller.cancelTubesSorting([theme1, theme2]);

      // then
      assert.notOk(controller.displaySortingPopIn);
      assert.ok(rollbackTubeAttributesStub.calledThrice);
    });

    test('it should sort tubes', async function (assert) {
      // given
      const saveTubeStub = sinon.stub().resolves();
      tube1_1.save = saveTubeStub;
      tube1_2.save = saveTubeStub;
      tube2_1.save = saveTubeStub;
      controller.displaySortingPopIn = true;

      // when
      await controller.sortTubes([theme1, theme2]);

      // then
      assert.ok(loaderStartStub.calledOnce);

      assert.notOk(controller.displaySortingPopIn);
      assert.ok(saveTubeStub.calledThrice);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyMessageStub.calledWith('Tubes ordonnés'));
    });

    test('it should throw an error if sort tubes saving is wrong', async function (assert) {
      // given
      const errorMessage = {
        'error': ['error']
      };
      const saveTubeStub = sinon.stub().rejects(errorMessage);
      tube1_1.save = saveTubeStub;
      tube1_2.save = saveTubeStub;
      tube2_1.save = saveTubeStub;
      controller.displaySortingPopIn = true;

      const errorStub = sinon.stub();
      window.console.error = errorStub;

      // when
      await controller.sortTubes([theme1, theme2]);

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(controller.displaySortingPopIn);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyErrorStub.calledWith('Erreur lors du trie des tubes'));
      assert.deepEqual(errorStub.getCall(0).args[0], errorMessage);
    });
  });
});
