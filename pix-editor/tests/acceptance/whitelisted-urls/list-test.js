import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | Whitelisted URLs | List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('whitelisted-url', {
      id: 1,
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2021-01-01'),
      creatorName: null,
      latestUpdatorName: 'Ma maman',
      url: 'http://pipeau-la-grenouille.fr',
      relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
      comment: 'Les grenouilles sont jolies',
    });
    this.server.create('whitelisted-url', {
      id: 2,
      createdAt: new Date('2020-02-02'),
      updatedAt: new Date('2021-02-02'),
      creatorName: 'Mon chat',
      latestUpdatorName: null,
      url: 'http://chats.fr',
      relatedEntityIds: null,
      comment: 'MIAOU',
    });

    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    return authenticateSession();
  });

  test('should display whitelisted urls by default when accessing list', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Whitelist moulinette des URLs');
    // FIXME Not great but better than a flaky test due to daytime savings hour change
    const hour = Intl.DateTimeFormat('fr', { hour: 'numeric' })
      .format(new Date('2020-01-01'))
      .replaceAll(/[A-Za-z\s]/g, ''); // Remove trailing hour unit

    // then
    assert.strictEqual(currentURL(), '/whitelisted-urls');

    assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
    assert.dom(screen.getByText('Les grenouilles sont jolies')).exists();
    assert.dom(screen.getByText(`Ajoutée le 01/01/2020 à ${hour}:00`)).exists();
    assert.dom(screen.getByText(`Modifiée par Ma maman le 01/01/2021 à ${hour}:00`)).exists();

    assert.dom(screen.getByText('http://chats.fr')).exists();
    assert.dom(screen.getByText('MIAOU')).exists();
    assert.dom(screen.getByText(`Ajoutée par Mon chat le 02/02/2020 à ${hour}:00`)).exists();
    assert.dom(screen.getByText(`Modifiée le 02/02/2021 à ${hour}:00`)).exists();
  });

  test('should display all static courses when accessing list and toggling URL filter', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Whitelist moulinette des URLs');
    await fillByLabel('URL', 'chat');
    await click(await screen.findByRole('button', { name: 'Filtrer' }));

    // then
    assert.strictEqual(currentURL(), '/whitelisted-urls?url=chat');
    assert.dom(screen.getByText('MIAOU')).exists();
    assert.dom(screen.queryByText('Les grenouilles sont jolies')).doesNotExist();
  });

  test('should display all static courses when accessing list and toggling IDs filter', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Whitelist moulinette des URLs');
    await fillByLabel('IDs', 'recPiCGFhfgervqr5');
    await click(await screen.findByRole('button', { name: 'Filtrer' }));

    // then
    assert.strictEqual(currentURL(), '/whitelisted-urls?ids=recPiCGFhfgervqr5');
    assert.dom(screen.getByText('Les grenouilles sont jolies')).exists();
    assert.dom(screen.queryByText('MIAOU')).doesNotExist();
  });
});
