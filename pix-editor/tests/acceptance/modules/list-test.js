import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Modules | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.createList('module', 36);

    return authenticateSession();
  });

  test('displays module creation button', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');

    // then
    assert.dom(screen.getByRole('link', { name: 'Créer un module' })).exists();
  });

  test('displays modules with pagination', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');

    // then
    assert.strictEqual(currentURL(), '/modules');
    assert.dom(await screen.findByRole('heading', { name: 'Modules' })).exists();

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

    await screen.getByRole('button', { name: "Nombre d'élément à afficher par page" }).click();
    assert.dom(await screen.findByRole('option', { name: '50' })).exists();

    await screen.getByRole('option', { name: '50' }).click();
    assert.dom(await screen.findByText('Page 1 / 1')).exists();
    assert.dom(await screen.findByText('36 éléments')).exists();
    assert.dom(await screen.findByText('MOD_0')).exists();
    assert.dom(await screen.findByText('MOD_35')).exists();
  });
});
