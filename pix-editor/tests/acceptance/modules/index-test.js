import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Routes | Modules | Index', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user is allowed to edit modules', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'editor' });

      return authenticateSession();
    });

    test('should display workbench menu first', async function (assert) {
      // when
      await visit('/');
      await clickByName('Modules');

      // then
      assert.strictEqual(currentURL(), '/modules/workbench');
    });

    test('displays module creation button', async function (assert) {
      // when
      const screen = await visit('/');
      await clickByName('Modules');

      // then
      assert
        .dom(screen.getByRole('link', { name: t('modules.components.create-module-button.create-module') }))
        .exists();
    });
  });

  module('when user is not allowed to edit modules', function () {
    test('should display production menu first', async function (assert) {
      // given
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'readonly' });

      await authenticateSession();

      // when
      await visit('/');
      await clickByName('Modules');

      // then
      assert.strictEqual(currentURL(), '/modules/production');
    });
  });
});
