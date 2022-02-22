import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence-management/new', function(hooks) {
  setupTest(hooks);
  let controller, transitionToRouteStub, area, competence, notifyMessageStub, notifyErrorStub;
  hooks.beforeEach(function() {
    notifyMessageStub = sinon.stub();
    notifyErrorStub = sinon.stub();
    class NotifyService extends Service {
      message = notifyMessageStub;
      error = notifyErrorStub;
    }
    this.owner.register('service:notify', NotifyService);
    controller = this.owner.lookup('controller:competence-management/new');
    controller.edition = true;
    transitionToRouteStub = sinon.stub();
    controller.transitionToRoute = transitionToRouteStub;
    area = {
      source: 'Pix+',
      framework: {
        name: 'Pix+',
      },
    };
    competence = {
      code: '1.1'
    };
    controller.model = {
      area,
      competence
    };
  });

  test('it should cancel creation', function(assert) {
    // given
    const deleteRecordStub = sinon.stub();
    controller.store.deleteRecord = deleteRecordStub;

    // when
    controller.cancelEdit();

    // then
    assert.notOk(controller.edition);
    assert.ok(deleteRecordStub.calledWith(competence));
    assert.ok(notifyMessageStub.calledWith('Création de la compétence annulée'));
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

    test('it should save competence', async function(assert) {
      // given
      const createWorkbenchStub = sinon.stub().resolves();
      controller._createWorkbench = createWorkbenchStub;

      const saveStub = sinon.stub().resolves();
      competence.save = saveStub;
      const expectedCompetence = {
        area,
        code: '1.1',
        save: saveStub
      };
      // when
      await controller.save();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.notOk(controller.edition);
      assert.ok(saveStub.calledOnce);
      assert.deepEqual(controller.model.competence, expectedCompetence);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyMessageStub.getCall(0).args, ['Compétence créée']);
      assert.ok(createWorkbenchStub.calledOnce);
      assert.ok(notifyMessageStub.getCall(0).args, ['Atelier créé']);
      assert.ok(transitionToRouteStub.calledWith('competence.skills', controller.model.competence,  { queryParams: { view: 'workbench' } }));
    });

    test('it should throw an error if saving failed', async function(assert) {
      // given
      const errorMessage = {
        'error': ['error-test']
      };
      const saveStub = sinon.stub().rejects(errorMessage);
      competence.save = saveStub;

      // when
      await controller.save();

      // then
      assert.ok(loaderStartStub.calledOnce);
      assert.ok(controller.edition);
      assert.ok(saveStub.calledOnce);
      assert.ok(loaderStopStub.calledOnce);
      assert.ok(notifyErrorStub.calledWith('Erreur lors de la création de la compétence'));
    });
  });

  test('it should create workbench', async function(assert) {
    // given
    const idGeneratorStub = sinon.stub().returns('recId');
    class IdGenerator extends Service {
      newId = idGeneratorStub;
    }
    this.owner.register('service:idGenerator', IdGenerator);
    const saveStub = sinon.stub()
      .onFirstCall().resolves('theme')
      .onSecondCall().resolves('tube');
    const model = { save: saveStub };
    const createRecordStub = sinon.stub().returns(model);
    controller.store.createRecord = createRecordStub;

    const expectedTheme = {
      name: 'workbench_Pix+_1_1',
      competence,
      index: 0
    };
    const expectedTube = {
      name: '@workbench',
      theme: 'theme',
      title: 'Sujet pour l\'atelier de la compétence 1.1 Pix+',
      competence,
      pixId: 'recId',
    };
    const expectedSkill = {
      name: '@workbench',
      tube: 'tube',
      description: 'Acquis pour l\'atelier de la compétence 1.1 Pix+',
      pixId: 'recId',
    };

    // when
    await controller._createWorkbench('Pix+');

    // then
    assert.deepEqual(createRecordStub.getCall(0).args, ['theme', expectedTheme]);
    assert.deepEqual(createRecordStub.getCall(1).args, ['tube', expectedTube]);
    assert.deepEqual(createRecordStub.getCall(2).args, ['skill', expectedSkill]);
  });
});
