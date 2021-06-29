import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';
import { mockAuthService } from '../../../mock-auth';

module('Integration | Component | popin-login-form', function(hooks) {
  setupRenderingTest(hooks);

  const configLoadStub = sinon.stub();

  hooks.beforeEach(function() {
    class ConfigService extends Service {
      load = configLoadStub;
    }
    this.owner.unregister('service:config');
    this.owner.register('service:config', ConfigService);
    mockAuthService.call(this);
  });

  test('it should ask for apiKey', async function(assert) {
    // when
    await render(hbs`<PopIn::LoginForm/>`);

    // then
    assert.dom('#login-api-key').exists();
  });


  module('successful cases', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      configLoadStub.resolves();
      this.update = () => {};
      this.close = () => {};
      await render(hbs`<PopIn::LoginForm @close={{this.close}} @update={{this.update}}/>`);
      await fillIn('#login-api-key', 'valid-api-key');

      //  when
      await click('.button');
    });

    test('it should use load api from config service', async function(assert) {
      // then
      assert.true(configLoadStub.called);
    });

    test('it should not display error message', async function(assert) {
      // then
      assert.dom('#login-form-error-message').doesNotExist();
    });

    test('it should store api key in localStorage', async function(assert) {
      // then
      assert.equal(this.owner.lookup('service:auth').key, 'valid-api-key');
    });

  });

  module('401 error case', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      const invalidCredentialsErrorMessage = {
        'errors': [{
          'code': 401,
          'title': 'Unauthorized',
        }]
      };

      configLoadStub.rejects(invalidCredentialsErrorMessage);
      await render(hbs`<PopIn::LoginForm/>`);
      await fillIn('#login-api-key', 'invalid-api-key');

      //  when
      await click('.button');
    });

    test('it should display an invalid credentials message if authentication with api key failed', async function(assert) {
      // then
      assert.dom('#login-form-error-message').exists();
      assert.dom('#login-form-error-message').hasText('La clé saisie n\'est pas valide. Vérifiez votre saisie.');
    });

    test('it should not store api key in localStorage', async function(assert) {
      // then
      assert.equal(this.owner.lookup('service:auth').key, undefined);
    });

  });

  module('other error case', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      configLoadStub.rejects();
      await render(hbs`<PopIn::LoginForm/>`);
      await fillIn('#login-api-key', 'server-error');

      //  when
      await click('.button');
    });

    test('it should display an error message', async function(assert) {
      // then
      assert.dom('#login-form-error-message').exists();
      assert.dom('#login-form-error-message').hasText('La clé saisie n\'a pas pu être validée. Vérifiez votre connexion ou contactez l\'équipe de développement.');
    });

    test('it should store api key in localStorage', async function(assert) {
      // then
      assert.equal(this.owner.lookup('service:auth').key, 'server-error');
    });

  });
});
