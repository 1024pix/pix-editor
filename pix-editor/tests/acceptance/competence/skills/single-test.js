import { module, test } from 'qunit';
import { currentURL, visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockAuthService } from '../../../mock-auth';

module('Acceptance | single', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey;

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('tube', { id: 'recTube1' });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawTubeIds: ['recTube1'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
  });

  test('close single', async function(assert) {
    await visit('/competence/recCompetence1.1/skills/new/recTube1/0?leftMaximized=true&view=workbench');
    await click(find('.icon.window.close'));

    assert.equal(currentURL(), '/competence/recCompetence1.1/skills?view=workbench');
  });
});
