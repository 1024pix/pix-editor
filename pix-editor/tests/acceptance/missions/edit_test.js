import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL, find, triggerEvent } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Missions | Edit', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('theme', { id: 'recTheme1' });
    this.server.create('competence', { id:  'recCompetence1.1', pixId: 'recCompetence1.1', rawThemeIds: ['recTheme1'], title: 'Notre compétence' });
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1.1']
    });
    this.server.create('framework', { id: 'recFrameworkPix1D', name: 'Pix 1D', areaIds: ['recArea1'] });
    this.server.create('mission-summary', {
      id: 2,
      name: 'Mission 1',
      competence: 'Mirage',
      createdAt: '2023/12/11',
      status: 'ACTIVE'
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
      await visit('/missions');

      // when
      await clickByName('Modifier');

      // then
      assert.strictEqual(currentURL(), '/missions/2');
    });

    test('should save updated informations', async function (assert) {
      // given
      this.server.create('mission', {
        id: 3,
        name: 'Mission',
        competenceId: 'Mirage',
        createdAt: '2023/12/11',
        status: 'ACTIVE'
      });
      const screen = await visit('/missions/3');

      // when
      await fillByLabel('* Nom de la mission', 'Nouvelle mission de test');
      await triggerEvent(find('#mission-name'), 'keyup', '');

      await clickByName('Compétence');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Notre compétence' }));
      await click(screen.getByRole('button', { name: 'Modifier la mission' }));

      // then
      assert.strictEqual(currentURL(), '/missions');
      assert.dom(screen.getByText('Nouvelle mission de test')).exists();
    });
  });
});
