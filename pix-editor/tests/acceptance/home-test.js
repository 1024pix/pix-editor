import { module, test } from 'qunit';
import { visit, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

const competenceIds = [
  'recCompetence1.1',
  'recCompetence2.1',
];

module('Acceptance | Home', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    competenceIds.map((competenceId) => this.server.create('competence', { id: competenceId, pixId: `pixId ${competenceId}` }));
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1', 'recArea2'] });
    return authenticateSession();
  });

  test('visiting /', async function(assert) {
    // when
    await visit('/');

    // then
    assert.dom(findAll('[data-test-area-item]')[0]).hasText('1. Information et données');
    assert.dom(findAll('[data-test-area-item]')[1]).hasText('2. Communication et collaboration');
    assert.dom('[data-test-area-item]').exists({ count: 2 });
  });
});

