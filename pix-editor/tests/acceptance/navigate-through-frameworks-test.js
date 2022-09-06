import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockAuthService } from '../mock-auth';

module('Acceptance | Navigate through frameworks', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;
  hooks.beforeEach(function () {
    this.owner.lookup('service:store');
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
  });

  for (const role of ['readonly', 'replicator', 'editor', 'admin']) {
    module(`when user is ${role}`, function(hooks) {
      hooks.beforeEach(function () {
        this.server.create('user', { apiKey, trigram: 'ABC', access: role, });
      });
      test('it should display select framework', async function (assert) {
        // when
        await visit('/');

        // then
        assert.dom('[data-test-frameworks-select]').exists();
      });
    });
  }

  module('when user is `readpixonly`', function(hooks) {
    hooks.beforeEach(function () {
      this.server.create('user', { apiKey, trigram: 'ABC', access: 'readpixonly', });
    });
    test('it should not have access to framework list', async function (assert) {
      // when
      await visit('/');

      // then
      assert.dom('[data-test-frameworks-select]').doesNotExist();
    });
  });
});
