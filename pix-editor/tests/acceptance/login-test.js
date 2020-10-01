import { module, test } from 'qunit';
import sinon from 'sinon';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Service from '@ember/service';

module('Acceptance | Login', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    localStorage.removeItem('pix-api-key');
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    this.server.create('author', { apiKey, trigram: 'ABC' });
  });

  test('visiting / when not connected', async function(assert) {
    // given
    const windowReloadStub = sinon.stub();
    // As window.location.replace is read.onlyonly, it cannot be stubbed
    // thus, we use a `window` service and mock this service
    class MockWindowService extends Service {
      reload() {
        return windowReloadStub();
      }
    }
    this.owner.register('service:window', MockWindowService);

    await visit('/');
    await fillIn('#login-api-key', apiKey);

    // when
    await click('[data-test-login-button]');

    // then
    assert.equal(windowReloadStub.called, true);
  });
});

