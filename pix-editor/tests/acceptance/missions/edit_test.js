import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL, find, triggerEvent } from '@ember/test-helpers';
import { clickByName, clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Missions | Edit', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('theme', { id: 'recTheme1' });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'recCompetence1.1', rawThemeIds: ['recTheme1'], title: 'Notre compétence' });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1']
    });
    this.server.create('framework', { id: 'recFrameworkPix1D', name: 'Pix 1D', areaIds: ['recArea1'] });
    this.server.create('mission', {
      id: 2,
      name: 'Mission 1',
      competenceId: 'recCompetence1.1',
      createdAt: '2023/12/11',
      status: 'VALIDATED'
    });
  });

  module('when user has write access', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'admin' });
      return authenticateSession();
    });

    test('should be able to edit a mission', async function (assert) {
      // given
      await visit('/missions/2');

      // when
      await clickByName('Modifier la mission');

      // then
      assert.strictEqual(currentURL(), '/missions/2/edit');
    });

    test('should save updated informations', async function (assert) {
      // given
      this.server.create('mission', {
        id: 3,
        name: 'Mission',
        competenceId: 'recCompetence1.1',
        thematicIds: '',
        createdAt: '2023/12/11',
        status: 'VALIDATED'
      });
      const screen = await visit('/missions/3/edit');

      // when
      await fillByLabel('* Nom de la mission', 'Nouvelle mission de test');
      await triggerEvent(find('#mission-name'), 'keyup', '');

      await clickByText('Compétence');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Notre compétence' }));
      await click(screen.getByRole('button', { name: 'Modifier la mission' }));

      // then
      assert.strictEqual(currentURL(), '/missions/3');
      assert.dom(screen.getByText('Nouvelle mission de test')).exists();
    });

    test('should display errors if any', async function (assert) {
      // given
      this.server.create('mission', {
        id: 3,
        name: 'Mission',
        competenceId: 'recCompetence1.1',
        thematicIds: '',
        createdAt: '2023/12/11',
        status: 'VALIDATED'
      });
      const screen = await visit('/missions/3/edit');

      // when
      await fillByLabel('* Nom de la mission', 'will trigger error');
      await triggerEvent(find('#mission-name'), 'keyup', '');

      await clickByText('Compétence');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Notre compétence' }));
      await click(screen.getByRole('button', { name: 'Modifier la mission' }));

      // then
      assert.dom(screen.getByText('La mission ne peut pas être mise à jour car les épreuves X, Y ne sont pas au statut VALIDE.')).exists();
    });
  });
});
