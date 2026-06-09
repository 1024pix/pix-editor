import { visit, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Admin | Delete-Admin-Entity', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC', access: 'admin' });
    this.server.create('admin-schema', {
      label: 'Utilisateurs',
      entityName: 'users',
      defaultSort: {
        field: 'id',
        direction: 'desc',
      },
      fields: [
        { key: 'id', label: 'Identifiant', type: 'number', readonly: true },
        { key: 'name', label: 'Nom', type: 'string' },
        { key: 'trigram', label: 'Trigramme', type: 'string' },
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

  test('it should delete a user', async function (assert) {
    // given
    this.server.create('admin-entity', {
      id: 'users:100',
      properties: { id: 100, name: 'Delete Me Maybe', trigram: 'DMM', access: 'readonly' },
    });

    // when
    const screen = await visit('/administration/users/list');
    const rows = await screen.findAllByRole('row');
    await click(within(rows[1]).getByRole('button', { name: "Supprimer l'entité" }));
    await click(await screen.findByRole('button', { name: 'Confirmer' }));

    // then
    assert.ok(screen.getByText("Entité 'users:100' supprimée avec succès"), 'Notification is visible');
    assert.notOk(await screen.queryByText('Delete Me Maybe'));
  });
});
