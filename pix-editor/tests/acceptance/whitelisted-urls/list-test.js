import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Whitelisted URLs | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('whitelisted-url', {
      id: 1,
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2021-01-01'),
      creatorName: null,
      latestUpdatorName: 'Ma maman',
      url: 'http://pipeau-la-grenouille.fr',
      relatedSkillNames: '@noix2,@souris8',
      checkType: 'starts_with',
      comment: 'Les grenouilles sont jolies',
    });
    this.server.create('whitelisted-url', {
      id: 2,
      createdAt: new Date('2020-02-02'),
      updatedAt: new Date('2021-02-02'),
      creatorName: 'Mon chat',
      latestUpdatorName: null,
      url: 'http://chats.fr',
      relatedSkillNames: null,
      checkType: 'exact_match',
      comment: 'MIAOU',
    });
    this.server.create('whitelisted-url', {
      id: 3,
      createdAt: new Date('2020-03-03'),
      updatedAt: new Date('2021-03-03'),
      creatorName: 'Mon chien',
      latestUpdatorName: null,
      url: 'http://chiens.fr',
      relatedSkillNames: '@noix3',
      checkType: 'exact_match',
      comment: 'OUAF',
    });

    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    return authenticateSession();
  });

  test('should display whitelisted urls when accessing list', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('URLs à ne pas analyser');

    // then
    assert.strictEqual(currentURL(), '/whitelisted-urls');
    assert.strictEqual(screen.getAllByRole('row').length, 4);
    assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
    assert.dom(screen.getByText('http://chats.fr')).exists();
    assert.dom(screen.getByText('http://chiens.fr')).exists();
  });

  test('should delete delete whitelisted url', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('URLs à ne pas analyser');

    const deleteButtons = await screen.findAllByRole('button', { name: "Supprimer l'URL" });
    await click(deleteButtons[0]);
    await click(await screen.findByRole('button', { name: 'Oui' }));

    // then
    assert.dom(screen.getByText('OUAF')).exists();
    assert.dom(screen.getByText('MIAOU')).exists();
    assert.dom(screen.queryByText('Les grenouilles sont jolies')).doesNotExist();
  });
});
