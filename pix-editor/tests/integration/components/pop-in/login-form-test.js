import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | popin-login-form', function(hooks) {
  setupRenderingTest(hooks);

  let configService;

  hooks.beforeEach(function() {
    configService = Service.extend({});
    this.owner.unregister('service:config');
    this.owner.register('service:config', configService);
  });

  test('it should ask for apiKey', async function(assert) {
    // when
    await render(hbs`<PopIn::LoginForm/>`);

    // then
    assert.dom('#login-api-key').exists();
  });


  module('successful cases', function(hooks) {
    const configLoadStub = sinon.stub().resolves();

    hooks.beforeEach(async function() {
      // given
      configService.prototype.load = configLoadStub;
      this.update = () => {};
      this.close = () => {};
      await render(hbs`<PopIn::LoginForm @close={{this.close}} @update={{this.update}}/>`);
      await fillIn('#login-api-key', 'valid-api-key');

      //  when
      await click('.button');
    });

    test('it should use load api from config service', async function(assert) {
      // then
      assert.equal(configLoadStub.called, true);
    });

    test('it should not display error message', async function(assert) {
      // then
      assert.dom('#login-form-error-message').doesNotExist();
    });

    test('it should store api key in localStorage', async function(assert) {
      // then
      assert.equal(localStorage.getItem('pix-api-key'), 'valid-api-key');
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

      configService.prototype.load = sinon.stub().rejects(invalidCredentialsErrorMessage);
      await render(hbs`<PopIn::LoginForm/>`);
      await fillIn('#login-api-key', 'invalid-api-key');

      //  when
      await click('.button');
    });

    test('it should display an invalid credentials message if authentication with api key failed', async function(assert) {
      // then
      assert.dom('#login-form-error-message').exists();
      assert.dom('#login-form-error-message').hasText('L\'api key n\'est pas valide. Vérifiez votre saisie.');
    });

    test('it should not store api key in localStorage', async function(assert) {
      // then
      assert.equal(localStorage.getItem('pix-api-key'), undefined);
    });

  });

  module('other error case', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      configService.prototype.load = sinon.stub().rejects();
      await render(hbs`<PopIn::LoginForm/>`);
      await fillIn('#login-api-key', 'server-error');

      //  when
      await click('.button');
    });

    test('it should display an error message', async function(assert) {
      // then
      assert.dom('#login-form-error-message').exists();
      assert.dom('#login-form-error-message').hasText('L\'api key n\'a pas pu être validée. Vérifiez votre connexion ou contactez l\'équipe de développement.');
    });

    test('it should store api key in localStorage', async function(assert) {
      // then
      assert.equal(localStorage.getItem('pix-api-key'), 'server-error');
    });

  });
});
