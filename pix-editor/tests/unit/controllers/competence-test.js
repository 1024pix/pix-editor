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
    theme1 = {
      name: 'theme1',
      rollbackAttributes: rollbackAttributesStub
    };
    theme2 = {
      name: 'theme2',
      rollbackAttributes: rollbackAttributesStub
    };
    const competence =  {
      name: 'competenceName',
      sortedThemes: [theme1, theme2],
    };

    controller = this.owner.lookup('controller:competence');
    controller.model = competence;
  });

  test('it should display sort theme pop-in', function(assert) {
    // when
    controller.displaySortThemePopIn();

    // then
    assert.ok(controller.sortingPopInTitle === 'Trie des thématiques');
    assert.ok(controller.displaySortingPopIn);
    assert.deepEqual(controller.sortingPopInApproveAction, controller.sortTheme);
    assert.deepEqual(controller.sortingPopInCancelAction, controller.cancelThemeSorting);
  });

  test('it should cancel theme sorting', function (assert) {
    // given
    controller.displaySortingPopIn = true;

    // when
    controller.cancelThemeSorting();

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
    await controller.sortTheme();

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
    window.console = { error: errorStub };

    // when
    await controller.sortTheme();

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.ok(controller.displaySortingPopIn);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyErrorStub.calledWith('Erreur lors du trie des thématiques'));
    assert.deepEqual(errorStub.getCall(0).args[0], errorMessage);
  });
});
