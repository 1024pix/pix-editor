import { module, test } from 'qunit';
import { visit, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

const competenceIds = [
  'recCompetence1.1',
  'recCompetence2.1',
];

module('Acceptance | Home', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    localStorage.setItem('pix-api-key', apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    competenceIds.map((competenceId) => this.server.create('competence', { id: competenceId, pixId: `pixId ${competenceId}` }));
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });
  });

  test('visiting /', async function(assert) {
    // when
    await visit('/');

    // then
    assert.dom(findAll('.title.AccordionToggle')[0]).hasText('1. Information et données');
    assert.dom(findAll('.title.AccordionToggle')[1]).hasText('2. Communication et collaboration');
    assert.dom('.title.AccordionToggle').exists({ count: 2 });
  });
});

