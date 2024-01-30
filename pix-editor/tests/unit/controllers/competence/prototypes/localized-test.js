import { module, test } from 'qunit';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';

module('Unit | Controller | competence/prototypes/localized', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller, messageStub, startStub, stopStub, errorStub;

  hooks.beforeEach(function () {
    //given
    controller = this.owner.lookup('controller:authenticated.competence/prototypes/localized');

    startStub = sinon.stub();
    stopStub = sinon.stub();
    class LoaderService extends Service {
      start = startStub;
      stop = stopStub;
    }
    this.owner.register('service:loader', LoaderService);

    errorStub = sinon.stub();
    messageStub = sinon.stub();
    class NotifyService extends Service {
      error = errorStub;
      message = messageStub;
    }
    this.owner.register('service:notify', NotifyService);
  });

  module('it should save localized challenge', function(hooks) {
    let handleIllustrationStub, handleAttachmentStub, localizedChallenge, saveChallengeStub, saveAttachmentsStub;

    hooks.beforeEach(function () {

      localizedChallenge = {
        id: 'rec123456',
        save: sinon.stub().resolves(localizedChallenge),
        files: [],
      };
      controller.model = localizedChallenge;

      handleIllustrationStub = sinon.stub().resolves(localizedChallenge);
      controller._handleIllustration = handleIllustrationStub;

      handleAttachmentStub = sinon.stub().resolves(localizedChallenge);
      controller._handleAttachments = handleAttachmentStub;

      saveChallengeStub = sinon.stub().resolves(localizedChallenge);
      controller._saveChallenge = saveChallengeStub;

      saveAttachmentsStub = sinon.stub().resolves(localizedChallenge);
      controller._saveAttachments = saveAttachmentsStub;

      controller.wasMaximized = true;
    });

    test('it should call handler with appropriate args', async function(assert) {
      // when
      await controller.save();

      // then
      assert.ok(startStub.calledOnce);
      assert.ok(handleIllustrationStub.calledWith(localizedChallenge));
      assert.ok(handleAttachmentStub.calledWith(localizedChallenge));
      assert.ok(saveChallengeStub.calledWith(localizedChallenge));
      assert.ok(saveAttachmentsStub.calledWith(localizedChallenge));
      assert.ok(messageStub.calledWith('Épreuve mise à jour'));
      assert.ok(stopStub.calledOnce);
    });

    test('it should reinitialize edition',  async function(assert) {
      // given
      controller.edition = true;

      // when
      await controller.save();

      // then
      assert.notOk(controller.edition);
    });
  });

  test('it should cancel edition', async function(assert) {
    // given
    controller.edition = true;
    controller.wasMaximized = true;
    const rollbackAttributesStub = sinon.stub();
    const localizedChallenge = EmberObject.create({
      id: 'recChallenge',
      rollbackAttributes: rollbackAttributesStub
    });
    controller.model = localizedChallenge;

    // when
    await controller.cancelEdit();

    // then
    assert.notOk(controller.edition);
    assert.ok(rollbackAttributesStub.calledOnce);
    assert.ok(messageStub.calledWith('Modification annulée'));
  });

});
