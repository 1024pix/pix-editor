import { clickByName, clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Admin | Create-Admin-Entity', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC', access: 'admin' });
    this.server.create('admin-schema', {
      label: 'Utilisateurs',
      entityName: 'users',
      fields: [
        { key: 'id', label: 'Identifiant', type: 'number', readonly: true },
        { key: 'name', label: 'Nom', type: 'string' },
        { key: 'trigram', label: 'Trigramme', type: 'string' },
        { key: 'apiKey', label: 'Clé API', type: 'secret' },
        {
          key: 'access',
          label: 'Accès',
          type: 'enum',
          options: [{ label: 'Lecture seule', value: 'readonly' }],
        },
      ],
    });

    return authenticateSession();
  });

  test('it should create a new user', async function (assert) {
    // given
    const userName = 'Fraise Des Bois';
    const trigram = 'FDB';
    const apiKey = window.crypto.randomUUID();
    const access = 'Lecture seule';

    // when
    const screen = await visit('/administration/users/list');
    await click(screen.getByRole('link', { name: 'Créer' }));

    await fillByLabel('Nom *', userName);
    await fillByLabel('Trigramme *', trigram);
    await fillByLabel('Clé API *', apiKey);
    await clickByName('Accès *');
    await clickByText(access);
    await clickByName('Créer');

    // then
    assert.ok(screen.getByText('Entité créée avec succès'), 'Notification is visible');
    assert.strictEqual(currentURL(), '/administration/users/list', 'Navigated to users list');
    assert.ok(screen.getByText('Fraise Des Bois'), 'Name is visible');
    assert.ok(screen.getByText('FDB'), 'Trigram is visible');
    assert.ok(screen.getByText('Lecture seule'), 'Access is visible');
    await clickByName('Afficher le secret "Clé API" de l\'entité "1"');
    assert.ok(screen.getByText(apiKey), 'API Key is visible');
  });
});
