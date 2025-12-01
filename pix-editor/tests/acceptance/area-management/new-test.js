import { clickByName, clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | area-management/new', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store;

  hooks.beforeEach(function () {
    // given
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('framework', { id: 'recFramework1', name: 'Pix+' });
    this.server.create('framework', { id: 'recFramework0', name: 'Pix' });

    return authenticateSession();
  });

  test('it should create a new area', async function (assert) {
    // given
    const newAreaTitle = 'Nouveau titre';

    // when
    const screen = await visit('/');
    await clickByName('Sélectionner un référentiel');
    await clickByText('Pix+');
    await click(screen.getByRole('link', { name: 'Ajouter un domaine' }));
    await fillByLabel('Titre :', newAreaTitle);
    await clickByText('Enregistrer');

    // then
    const framework = await store.peekRecord('framework', 'recFramework1');
    assert.ok(
      framework
        .hasMany('areas')
        .value()
        .find((area) => area.titleFrFr === newAreaTitle),
    );
    assert.dom(find('[data-test-main-message]')).hasText('Domaine créé');
    assert.strictEqual(currentURL(), '/');
  });

  test('it should cancel creation', async function (assert) {
    // when
    await visit('/area-management/new/recFramework1');
    await click(find('[data-test-cancel-button]'));

    // then
    assert.dom('[data-test-main-message]').hasText('Création du domaine annulé');
    assert.strictEqual(currentURL(), '/');
  });
});
