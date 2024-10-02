import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | storage', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    class sessionServiceStub extends Service {
      get data() {
        return { authenticated: { apiKey: 'someApiKey' } };
      }
    }
    this.owner.register('service:session', sessionServiceStub);
  });

  module('download', function() {
    test('it should trigger API call', async function(assert) {
      // given
      const phraseService = this.owner.lookup('service:phrase');
      const fetch = sinon.stub().resolves();

      // when
      await phraseService.download(fetch);

      // then
      assert.ok(fetch.calledOnce);
      assert.deepEqual(fetch.args[0], ['/api/phrase/download', {
        method: 'POST',
        headers: {
          authorization: 'Bearer someApiKey',
        },
      }]);
    });

  });
});
