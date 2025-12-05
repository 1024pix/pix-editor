import { clickByName, clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | Whitelisted URLs | Edition', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const notifications = this.owner.lookup('service:notifications');
    notifications.setDefaultClearDuration(50);
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
      relatedSkillNames: '',
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

  test('should edit a whitelisted url', async function (assert) {
    // given
    const screen = await visit('/');
    await clickByName('URLs à ne pas analyser');
    await clickByText('MIAOU');

    // when
    await fillByLabel('Nom des acquis concernés, séparés par des virgules', '@miaou1,@croquettes2');
    await fillByLabel('Commentaire', 'MIAOU MIAOU');
    await clickByName('Modifier');

    // then
    assert.strictEqual(currentURL(), '/whitelisted-urls');
    assert.dom(screen.getByText('http://chats.fr')).exists();
    assert.dom(screen.getByText('MIAOU MIAOU')).exists();
    assert.dom(screen.getByText('@croquettes2 et 1 autre acquis')).exists();
    assert.strictEqual(screen.getAllByText('Strictement égale à').length, 2);
  });

  test("should edit a whitelisted url's url", async function (assert) {
    // given
    const screen = await visit('/');
    await clickByName('URLs à ne pas analyser');
    await clickByText('OUAF');

    // when
    await fillByLabel('URL à ne pas analyser', 'https://en.wikipedia.org/wiki/Dog');
    await clickByName('Modifier');

    // then
    assert.strictEqual(currentURL(), '/whitelisted-urls');
    assert.dom(screen.getByText('https://en.wikipedia.org/wiki/Dog')).exists();
    assert.dom(screen.queryByText('http://chiens.fr')).doesNotExist();
  });
});
