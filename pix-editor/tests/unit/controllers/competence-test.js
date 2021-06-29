import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence', function(hooks) {
  setupTest(hooks);
  let controller, theme1, theme2, notifyMessageStub, notifyErrorStub, loaderStartStub, loaderStopStub;

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

    controller = this.owner.lookup('controller:competence');
  });

  test('it should save sorting', async function(assert) {
    // given
    const saveModelStub = sinon.stub().resolves();
    const model1 = {
      save: saveModelStub
    };
    const model2 = {
      save: saveModelStub
    };
    controller.displaySortingPopIn = true;

    // when
    await controller._saveSorting([model1, model2], 'successMessage', 'errorMessage');

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(saveModelStub.calledTwice);
    assert.ok(notifyMessageStub.calledWith('successMessage'));
    assert.notOk(controller.displaySortingPopIn);
  });

  test('it should catch error if save sorting fail', async function(assert) {
    // given
    const saveModelStub = sinon.stub().rejects();
    const model1 = {
      save: saveModelStub
    };

    // when
    await controller._saveSorting([model1], 'successMessage', 'errorMessage');

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyErrorStub.calledWith('errorMessage'));
  });

  test('it should cancel sorting', function(assert) {
    // given
    const rollbackAttributesStub = sinon.stub();
    const model1 = {
      rollbackAttributes: rollbackAttributesStub
    };
    const model2 = {
      rollbackAttributes: rollbackAttributesStub
    };
    controller.displaySortingPopIn = true;
    // when
    controller._cancelSorting([model1, model2]);

    // then
    assert.ok(rollbackAttributesStub.calledTwice);
    assert.notOk(controller.displaySortingPopIn);
  });

  module('#theme sorting', function (hooks) {
    hooks.beforeEach(function () {
      theme1 = {
        name: 'theme1',
      };
      theme2 = {
        name: 'theme2',
      };

      const competence = {
        name: 'competenceName',
        sortedThemes: [theme1, theme2],
      };

      controller.model = competence;
      controller.sortingModel = null;
    });
    test('it should display sort theme pop-in', function(assert) {
      // when
      controller.displaySortThemesPopIn();

      // then
      assert.equal(controller.sortingPopInTitle, 'Tri des thématiques');
      assert.ok(controller.displaySortingPopIn);
      assert.deepEqual(controller.sortingPopInApproveAction, controller.sortThemes);
      assert.deepEqual(controller.sortingPopInCancelAction, controller.cancelThemesSorting);
      assert.deepEqual(controller.sortingModel, [theme1, theme2]);
    });

    test('it should cancel theme sorting', function (assert) {
      // given
      const cancelSortingStub = sinon.stub();
      controller._cancelSorting = cancelSortingStub;

      // when
      controller.cancelThemesSorting([theme1, theme2]);

      // then
      assert.ok(cancelSortingStub.calledWith([theme1, theme2]));
    });

    test('it should sort theme', async function (assert) {
      // given
      const saveSortingStub = sinon.stub();
      controller._saveSorting = saveSortingStub;

      // when
      await controller.sortThemes([theme1, theme2]);

      // then
      assert.ok(saveSortingStub.calledWith([theme1, theme2],'Thématiques ordonnées', 'Erreur lors du trie des thématiques'));
    });
  });

  module('#tube sorting', function (hooks) {
    let tube1, tube2;

    hooks.beforeEach(function () {

      tube1 = {
        name: 'tube1',
      };
      tube2 = {
        name: 'tube2',
      };
      controller.sortingModel = null;
    });

    test('it should display sort tubes pop-in', function(assert) {
      // when
      controller.displaySortTubesPopIn([tube1, tube2]);

      // then
      assert.equal(controller.sortingPopInTitle, 'Tri des tubes');
      assert.ok(controller.displaySortingPopIn);
      assert.deepEqual(controller.sortingModel, [tube1, tube2]);
      assert.deepEqual(controller.sortingPopInApproveAction, controller.sortTubes);
      assert.deepEqual(controller.sortingPopInCancelAction, controller.cancelTubesSorting);
    });

    test('it should cancel tube sorting', function (assert) {
      // given
      const cancelSortingStub = sinon.stub();
      controller._cancelSorting = cancelSortingStub;

      // when
      controller.cancelTubesSorting([tube1, tube2]);

      // then
      assert.ok(cancelSortingStub.calledWith([tube1, tube2]));
    });

    test('it should sort tubes', async function (assert) {
      // given
      const saveSortingStub = sinon.stub();
      controller._saveSorting = saveSortingStub;

      // when
      await controller.sortTubes([tube1, tube2]);

      // then
      assert.ok(saveSortingStub.calledWith([tube1, tube2], 'Tubes ordonnés', 'Erreur lors du trie des tubes'));
    });
  });
});
