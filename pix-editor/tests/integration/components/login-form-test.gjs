import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import LoginForm from 'pixeditor/components/login-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../setup-intl-rendering';

module('Integration | Component | login-form', function (hooks) {
  setupIntlRenderingTest(hooks);
  let onLogInClickedStub;

  hooks.beforeEach(async function () {
    onLogInClickedStub = sinon.stub();
  });

  test('it renders correctly', async function (assert) {
    // when
    const screen = await render(<template><LoginForm @onLogInClicked={{onLogInClickedStub}} /></template>);

    // then
    assert.dom(screen.getByRole('img', { name: 'Pix Editor' })).exists();
    assert.dom(screen.getByRole('heading', { level: 1, name: 'Connectez-vous' })).exists();
    assert.dom(screen.getByText('Pour vous identifier, merci de saisir votre clé personnelle.')).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Clé API *' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Se connecter' })).exists();
    assert
      .dom(
        screen.queryByText(
          "La clé saisie n'a pas pu être validée ou n'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l'équipe de développement.",
        ),
      )
      .doesNotExist();
  });

  test('it calls onLogInClicked with the API key when form is submitted', async function (assert) {
    // given
    onLogInClickedStub.resolves();
    const apiKey = 'test-api-key-123';

    // when
    const screen = await render(<template><LoginForm @onLogInClicked={{onLogInClickedStub}} /></template>);
    await fillIn(screen.getByRole('textbox', { name: 'Clé API *' }), apiKey);
    await click(screen.getByRole('button', { name: 'Se connecter' }));

    // then
    assert.ok(onLogInClickedStub.calledOnceWithExactly(apiKey));
  });

  test('it displays error message when login fails', async function (assert) {
    // given
    onLogInClickedStub.rejects(new Error('Login failed'));

    // when
    const screen = await render(<template><LoginForm @onLogInClicked={{onLogInClickedStub}} /></template>);
    await fillIn(screen.getByRole('textbox', { name: 'Clé API *' }), 'invalid-api-key');
    await click(screen.getByRole('button', { name: 'Se connecter' }));

    // then
    assert
      .dom(
        screen.getByText(
          "La clé saisie n'a pas pu être validée ou n'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l'équipe de développement.",
        ),
      )
      .exists();
  });

  test('it hides error message when a new login attempt is made', async function (assert) {
    // given
    onLogInClickedStub.onFirstCall().rejects(new Error('Login failed'));
    onLogInClickedStub.onSecondCall().resolves();

    // when
    const screen = await render(<template><LoginForm @onLogInClicked={{onLogInClickedStub}} /></template>);

    await fillIn(screen.getByRole('textbox', { name: 'Clé API *' }), 'invalid-key');
    await click(screen.getByRole('button', { name: 'Se connecter' }));

    assert
      .dom(
        screen.getByText(
          "La clé saisie n'a pas pu être validée ou n'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l'équipe de développement.",
        ),
      )
      .exists();

    await fillIn(screen.getByRole('textbox', { name: 'Clé API *' }), 'test-api-key');
    await click(screen.getByRole('button', { name: 'Se connecter' }));

    // then
    assert
      .dom(
        screen.queryByText(
          "La clé saisie n'a pas pu être validée ou n'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l'équipe de développement.",
        ),
      )
      .doesNotExist();
  });

  test('it updates the API key value when input changes', async function (assert) {
    // given
    onLogInClickedStub.resolves();
    const firstApiKey = 'first-key';
    const secondApiKey = 'second-key';

    // when
    const screen = await render(<template><LoginForm @onLogInClicked={{onLogInClickedStub}} /></template>);

    await fillIn(screen.getByRole('textbox', { name: 'Clé API *' }), firstApiKey);
    await click(screen.getByRole('button', { name: 'Se connecter' }));

    // then
    assert.ok(onLogInClickedStub.calledWith(firstApiKey));

    // when - change the API key
    await fillIn(screen.getByRole('textbox', { name: 'Clé API *' }), secondApiKey);
    await click(screen.getByRole('button', { name: 'Se connecter' }));

    // then
    assert.ok(onLogInClickedStub.calledWith(secondApiKey));
    assert.strictEqual(onLogInClickedStub.callCount, 2);
  });
});
