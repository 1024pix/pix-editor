import { visit, within } from '@1024pix/ember-testing-library';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Admin | Filter-Admin-Entities', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC', access: 'admin' });
    this.server.create('admin-schema', {
      label: 'Utilisateurs',
      entityName: 'users',
      defaultSort: {
        direction: 'desc',
        field: 'id',
      },
      fields: [
        { key: 'id', label: 'Identifiant', type: 'number', readonly: true },
        { key: 'name', label: 'Nom', type: 'string' },
        { key: 'trigram', label: 'Trigramme', type: 'string' },
        {
          key: 'access',
          label: 'Accès',
          type: 'enum',
          options: [
            { label: 'Lecture seule', value: 'readonly' },
            { label: 'Administrateur', value: 'admin' },
          ],
        },
      ],
    });

    return authenticateSession();
  });

  test('it should sort users by default order', async function (assert) {
    // given
    this.server.create('admin-entity', {
      id: 'users:200',
      properties: { id: 200, name: 'Milieu', trigram: 'MIL', access: 'readonly' },
    });
    this.server.create('admin-entity', {
      id: 'users:300',
      properties: { id: 300, name: 'Premier', trigram: 'PRM', access: 'readonly' },
    });
    this.server.create('admin-entity', {
      id: 'users:100',
      properties: { id: 100, name: 'Dernier', trigram: 'DER', access: 'readonly' },
    });

    // when
    const screen = await visit('/administration/users/list');

    // then
    const rows = await screen.findAllByRole('row');

    const row1 = rows[1];
    assert.dom(within(row1).getByText('300')).exists();
    assert.dom(within(row1).getByText('Premier')).exists();

    const row2 = rows[2];
    assert.dom(within(row2).getByText('200')).exists();
    assert.dom(within(row2).getByText('Milieu')).exists();

    const row3 = rows[3];
    assert.dom(within(row3).getByText('100')).exists();
    assert.dom(within(row3).getByText('Dernier')).exists();
  });
});
