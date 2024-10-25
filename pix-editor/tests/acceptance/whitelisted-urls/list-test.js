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
    assert.dom(screen.getByText(`01/01/2020 à ${hour}:00`)).exists();
    assert.dom(screen.getByText(`01/01/2021 à ${hour}:00 par Ma maman`)).exists();
    assert.dom(screen.getByText('Commence par')).exists();

    assert.dom(screen.getByText('http://chats.fr')).exists();
    assert.dom(screen.getByText('MIAOU')).exists();
    assert.dom(screen.getByText(`02/02/2020 à ${hour}:00 par Mon chat`)).exists();
    assert.dom(screen.getByText(`02/02/2021 à ${hour}:00`)).exists();

    assert.dom(screen.getByText('http://chiens.fr')).exists();
    assert.dom(screen.getByText('OUAF')).exists();
    assert.dom(screen.getByText(`03/03/2020 à ${hour}:00 par Mon chien`)).exists();
    assert.dom(screen.getByText(`03/03/2021 à ${hour}:00`)).exists();

    assert.strictEqual(screen.getAllByText('Strictement égale à').length, 2);
  });

  test('should display all whitelisted urls when accessing list and toggling URL filter', async function(assert) {
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

  test('should display filtered whitelisted urls when accessing list and toggling basic skill name filter', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Whitelist moulinette des URLs');
    await fillByLabel('Nom d\'acquis', 'souris');
    await click(await screen.findByRole('button', { name: 'Filtrer' }));

    // then
    assert.strictEqual(currentURL(), '/whitelisted-urls?names=souris');
    assert.dom(screen.getByText('Les grenouilles sont jolies')).exists();
    assert.dom(screen.queryByText('MIAOU')).doesNotExist();
  });

  test('should display filtered whitelisted urls when accessing list and toggling advanced skill name filter', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Whitelist moulinette des URLs');
    await fillByLabel('Nom d\'acquis', 'souris,noix');
    await click(await screen.findByRole('button', { name: 'Filtrer' }));

    // then
    assert.strictEqual(currentURL(), `/whitelisted-urls?names=${encodeURIComponent('souris,noix')}`);
    assert.dom(screen.getByText('Les grenouilles sont jolies')).exists();
    assert.dom(screen.getByText('OUAF')).exists();
    assert.dom(screen.queryByText('MIAOU')).doesNotExist();
  });

  test('should delete delete whitelisted url', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Whitelist moulinette des URLs');

    const deleteButtons = await screen.findAllByRole('button', { name: 'Supprimer l\'URL de la whitelist' });
    await click(deleteButtons[0]);
    await click(await screen.findByRole('button', { name: 'Oui' }));

    // then
    assert.dom(screen.getByText('OUAF')).exists();
    assert.dom(screen.getByText('MIAOU')).exists();
    assert.dom(screen.queryByText('Les grenouilles sont jolies')).doesNotExist();
  });
});
