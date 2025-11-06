import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../setup-intl-rendering';

module('Integration | Component | login-form', function(hooks) {
  setupIntlRenderingTest(hooks);
  let onLogInClickedStub;

  hooks.beforeEach(async function() {
    onLogInClickedStub = sinon.stub();
    this.onLogInClicked = onLogInClickedStub;
  });

  test('it renders correctly', async function(assert) {
    // when
    await render(hbs`<LoginForm @onLogInClicked={{this.onLogInClicked}} />`);

    // then
    assert.dom('.login').exists();
    assert.dom('.login__header').exists();
    assert.dom('.login-header__title').hasText('Connectez-vous');
    assert.dom('.login-header__information').hasText('Pour vous identifier, merci de saisir votre clé personnelle.');
    assert.dom('#login-api-key').exists();
    assert.dom('button[type="submit"]').hasText('Se connecter');
    assert.dom('#login-form-error-message').doesNotExist();
  });

  test('it calls onLogInClicked with the API key when form is submitted', async function(assert) {
    // given
    onLogInClickedStub.resolves();
    const apiKey = 'test-api-key-123';

    // when
    await render(hbs`<LoginForm @onLogInClicked={{this.onLogInClicked}} />`);
    await fillIn('#login-api-key', apiKey);
    await click('button[type="submit"]');

    // then
    assert.ok(onLogInClickedStub.calledOnce);
    assert.ok(onLogInClickedStub.calledWith(apiKey));
  });

  test('it displays error message when login fails', async function(assert) {
    // given
    onLogInClickedStub.rejects(new Error('Login failed'));
    const apiKey = 'invalid-api-key';

    // when
    await render(hbs`<LoginForm @onLogInClicked={{this.onLogInClicked}} />`);
    await fillIn('#login-api-key', apiKey);
    await click('button[type="submit"]');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message p').hasText('La clé saisie n\'a pas pu être validée ou n\'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l\'équipe de développement.');
  });

  test('it hides error message when a new login attempt is made', async function(assert) {
    // given
    onLogInClickedStub.onFirstCall().rejects(new Error('Login failed'));
    onLogInClickedStub.onSecondCall().resolves();
    const apiKey = 'test-api-key';

    // when
    await render(hbs`<LoginForm @onLogInClicked={{this.onLogInClicked}} />`);

    // First failed attempt
    await fillIn('#login-api-key', 'invalid-key');
    await click('button[type="submit"]');

    // Verify error is shown
    assert.dom('#login-form-error-message').exists();

    // Second successful attempt
    await fillIn('#login-api-key', apiKey);
    await click('button[type="submit"]');

    // then
    assert.dom('#login-form-error-message').doesNotExist();
  });

  test('it updates the API key value when input changes', async function(assert) {
    // given
    onLogInClickedStub.resolves();
    const firstApiKey = 'first-key';
    const secondApiKey = 'second-key';

    // when
    await render(hbs`<LoginForm @onLogInClicked={{this.onLogInClicked}} />`);

    await fillIn('#login-api-key', firstApiKey);
    await click('button[type="submit"]');

    // then
    assert.ok(onLogInClickedStub.calledWith(firstApiKey));

    // when - change the API key
    await fillIn('#login-api-key', secondApiKey);
    await click('button[type="submit"]');

    // then
    assert.ok(onLogInClickedStub.calledWith(secondApiKey));
    assert.strictEqual(onLogInClickedStub.callCount, 2);
  });
});
