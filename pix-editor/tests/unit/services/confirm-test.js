import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Service | confirm', function(hooks) {
  setupTest(hooks);
  let service, startStub, stopStub;
  hooks.beforeEach(function () {
    service = this.owner.lookup('service:confirm');
    startStub = sinon.stub();
    stopStub = sinon.stub();
  });

  module('#loader management', function(hooks) {
    hooks.beforeEach(function () {
      service.setTarget({
        confirmAsk(title, text, callback) {
          callback(true);
        }
      });
    });

    test('it should manage loader if `isLoading` is `true`', async function(assert) {
      // given
      class LoaderService extends Service {
        start = startStub;
        stop = stopStub;
        isLoading = true;
      }
      this.owner.register('service:loader', LoaderService);

      // when
      await service.ask();

      // then
      assert.ok(startStub.calledOnce);
      assert.ok(stopStub.calledOnce);
    });

    test('it should not manage loader if `isLoading` is `false`', async function(assert) {
      // given
      class LoaderService extends Service {
        start = startStub;
        stop = stopStub;
        isLoading = false;
      }
      this.owner.register('service:loader', LoaderService);

      // when
      await service.ask();

      // then
      assert.notOk(startStub.calledOnce);
      assert.notOk(stopStub.calledOnce);
    });
  });

  test('It should reject promise if callback return `false`', async function(assert) {
    // given
    class LoaderService extends Service {
      start = startStub;
      stop = stopStub;
      isLoading = true;
    }
    this.owner.register('service:loader', LoaderService);

    service.setTarget({
      confirmAsk(title, text, callback) {
        callback(false);
      }
    });
    await assert.rejects(service.ask()) ;
    assert.ok(stopStub.calledOnce);
    assert.notOk(startStub.calledOnce);
  });
});
