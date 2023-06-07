import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence/tubes/single', function(hooks) {
  setupTest(hooks);

  let controller, store, notifyMessageStub, notifyErrorStub, loaderStartStub, loaderStopStub;

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

    store = this.owner.lookup('service:store');

    const tube = store.createRecord('tube',{
      id: 'recTube0',
      name: 'TubeName',
    });

    controller = this.owner.lookup('controller:authenticated.competence/tubes/single');
    controller.model = tube;

  });

  test('it should save modifications', async function(assert) {
    // given
    const reloadSkillsStub = sinon.stub();
    controller.model.hasMany('rawSkills').reload = reloadSkillsStub;

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
    assert.ok(notifyMessageStub.calledWith('Tube mis à jour'));
    assert.ok(reloadSkillsStub.calledOnce);
  });

  test('it should catch an error if save action failed', async function(assert) {
    // given
    const errorMessage = {
      'error': ['error-test']
    };
    const saveStub = sinon.stub().rejects(errorMessage);
    controller.model.save = saveStub;
    controller.edition = true;

    // when
    await controller.save();

    // then
    assert.ok(loaderStartStub.calledOnce);
    assert.ok(controller.edition);
    assert.ok(saveStub.calledOnce);
    assert.ok(loaderStopStub.calledOnce);
    assert.ok(notifyErrorStub.calledWith('Erreur lors de la mise à jour du tube'));
  });

  test('it should start edition', function(assert) {
    // given
    const sendStub = sinon.stub();
    controller.send = sendStub;
    controller.parentController.leftMaximized = true;
    controller.edition = false;
    controller.wasMaximized = false;
    // when
    controller.edit();

    // then
    assert.ok(controller.edition);
    assert.ok(controller.wasMaximized);
    assert.ok(sendStub.calledWith('maximize'));
  });

  module('#cancelEdition', function(hooks) {
    let rollbackAttributesStub;
    hooks.beforeEach(function () {
      rollbackAttributesStub = sinon.stub();
      controller.model.rollbackAttributes = rollbackAttributesStub;
      controller.edition = true;
    });

    test('it should cancel edition', function(assert) {
      // given
      this.wasMaximized = true;

      // when
      controller.cancelEdit();

      // then
      assert.notOk(controller.edition);
      assert.ok(rollbackAttributesStub.calledOnce);
      assert.ok(notifyMessageStub.calledWith('Modification annulée'));
    });

    test('it should send `minimize` if `wasMaximized` is `false`', function(assert) {
      // given
      const sendStub = sinon.stub();
      controller.send = sendStub;
      this.wasMaximized = false;

      // when
      controller.cancelEdit();

      // then
      assert.ok(sendStub.calledWith('minimize'));
    });

    test('it should close and cancel edition', function(assert) {
      // given
      const parentControllerSendStub = sinon.stub();
      controller.parentController.send = parentControllerSendStub;

      // when
      controller.close();

      // then
      assert.notOk(controller.edition);
      assert.ok(rollbackAttributesStub.calledOnce);
      assert.ok(notifyMessageStub.calledWith('Modification annulée'));
      assert.ok(parentControllerSendStub.calledWith('closeChildComponent'));
    });
  });

  module('#setCompetence', function(hooks) {
    let newTheme, newCompetence;
    hooks.beforeEach(function () {
      newTheme = store.createRecord('theme',{
        id: 'recTheme0',
        name: 'themeName',
      });
      newCompetence = store.createRecord('competence',{
        id: 'recCompetence0',
        title: 'competenceName',
      });
    });

    test('it should set a competence and a theme', async function(assert) {
      // given
      const transitionToRouteStub = sinon.stub();
      controller.router.transitionTo = transitionToRouteStub;
      const saveStub = sinon.stub().resolves();
      controller.model.save = saveStub;

      // when
      await controller.setCompetence(newCompetence, newTheme);
      const competence = await controller.model.get('competence');
      const theme = await controller.model.get('theme');

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(saveStub.calledOnce);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyMessageStub.calledWith('Tube mis à jour'));
      assert.ok(transitionToRouteStub.calledWith('authenticated.competence.tubes.single', newCompetence, controller.model));
      assert.deepEqual(competence, newCompetence);
      assert.deepEqual(theme, newTheme);
    });

    test('it should catch an error if action failed',async function(assert) {
      // given
      const errorMessage = {
        'error': ['error-test']
      };
      const saveStub = sinon.stub().rejects(errorMessage);
      controller.model.save = saveStub;

      // when
      await controller.setCompetence(newCompetence, newTheme);

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(saveStub.calledOnce);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyErrorStub.calledWith('Erreur lors de la mise à jour du tube'));
    });
  });
});
