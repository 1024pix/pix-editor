import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { selectOption } from 'pixeditor/tests/select-option-list-box-helper.js';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Modules | Production', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.createList('module', 36);
    this.server.createList('draft-module', 36);

    return authenticateSession();
  });

  test('displays module creation button', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');
    await clickByName(t('modules.components.modules-tabs.production'));

    // then
    assert.dom(screen.getByRole('link', { name: t('modules.components.create-module-button.create-module') })).exists();
  });

  test('displays modules with pagination', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');
    await clickByName(t('modules.components.modules-tabs.production'));

    // then
    assert.strictEqual(currentURL(), '/modules/production');
    assert.dom(await screen.findByRole('heading', { name: t('modules.production.title') })).exists();

    assert.dom(await screen.findByText('1-10 sur 36 éléments')).exists();
    assert.dom(await screen.findByText('Page 1 / 4')).exists();
    assert.dom(await screen.findByText('MOD_0')).exists();
    assert.dom(await screen.findByText('MOD_5')).exists();
    assert.dom(await screen.findByText('MOD_9')).exists();

    await screen.getByRole('button', { name: 'Aller à la page suivante' }).click();
    assert.dom(await screen.findByText('11-20 sur 36 éléments')).exists();
    assert.dom(await screen.findByText('Page 2 / 4')).exists();
    assert.dom(await screen.findByText('MOD_10')).exists();
    assert.dom(await screen.findByText('MOD_15')).exists();
    assert.dom(await screen.findByText('MOD_19')).exists();

    await screen.getByRole('button', { name: 'Aller à la page suivante' }).click();
    assert.dom(await screen.findByText('21-30 sur 36 éléments')).exists();
    assert.dom(await screen.findByText('Page 3 / 4')).exists();
    assert.dom(await screen.findByText('MOD_20')).exists();
    assert.dom(await screen.findByText('MOD_25')).exists();
    assert.dom(await screen.findByText('MOD_29')).exists();

    await screen.getByRole('button', { name: 'Aller à la page suivante' }).click();
    assert.dom(await screen.findByText('31-36 sur 36 éléments')).exists();
    assert.dom(await screen.findByText('Page 4 / 4')).exists();
    assert.dom(await screen.findByText('MOD_30')).exists();
    assert.dom(await screen.findByText('MOD_35')).exists();

    await screen.getByRole('button', { name: 'Aller à la page précédente' }).click();
    assert.dom(await screen.findByText('Page 3 / 4')).exists();

    await selectOption(screen, "Nombre d'élément à afficher par page", '50');
    assert.dom(await screen.findByText('Page 1 / 1')).exists();
    assert.dom(await screen.findByText('36 éléments')).exists();
    assert.dom(await screen.findByText('MOD_0')).exists();
    assert.dom(await screen.findByText('MOD_35')).exists();
  });

  test('filters modules by internal title', async function (assert) {
    // given
    const screen = await visit('/modules/production');

    // when
    await fillIn(screen.getByRole('textbox', { name: 'Titre interne' }), 'MOD_12');

    // then
    assert.dom(await screen.findByText('MOD_12')).exists();
    assert.dom(screen.getByText('1 élément')).exists();
    assert.dom(screen.queryByText('MOD_0')).doesNotExist();
    assert.strictEqual(currentURL(), '/modules/production?internalTitle=MOD_12');
  });

  module('when clearing filters', function () {
    test('resets the internal title filter', async function (assert) {
      // given
      const screen = await visit('/modules/production?internalTitle=MOD_12');

      // when
      await click(screen.getByRole('button', { name: 'Réinitialiser le filtre' }));

      // then
      assert.dom(await screen.findByText('MOD_0')).exists();
      assert.strictEqual(currentURL(), '/modules/production');
    });
  });

  module('when switching to the workbench tab', function () {
    test('keeps the internal title filter', async function (assert) {
      // given
      const screen = await visit('/modules/production');
      await fillIn(screen.getByRole('textbox', { name: 'Titre interne' }), 'MOD_3');

      // when
      await click(await screen.getByRole('link', { name: 'Atelier' }));

      // then
      assert.dom(await screen.findByText('MOD_3')).exists();
      assert.dom(screen.queryByText('MOD_0')).doesNotExist();
      assert.strictEqual(currentURL(), '/modules/workbench?internalTitle=MOD_3');
    });
  });
});
