import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { currentURL } from '@ember/test-helpers';
import { clickByName, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Static Courses', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('static-course-summary', { name: 'Premier test statique', challengeCount: 3, createdAt: new Date('2020-01-01') });
    this.server.create('static-course-summary', { name: 'Deuxième test statique', challengeCount: 10, createdAt: new Date('2019-01-01') });
    return authenticateSession();
  });

  test('should display static courses', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Tests statiques');

    // then
    assert.strictEqual(currentURL(), '/static-courses');
    assert.dom(screen.getByText('Premier test statique'));
    assert.dom(screen.getByText('Deuxième test statique'));
  });
});
