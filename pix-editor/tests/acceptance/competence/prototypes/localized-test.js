import { module, test } from 'qunit';
import { click, findAll } from '@ember/test-helpers';
import { visit, clickByText } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | Controller | Get Localized Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('challenge', { id: 'recChallenge1', status: 'validé', alternativeLocales: ['en'] });
    this.server.create('localized-challenge', { id: 'localized-challenge-id-1', challengeId: 'recChallenge1', locale: 'en', embedURL: 'https://my-embed.com/en.html' });
    this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'], level: 1 });
    this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
    this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawThemeIds: ['recTheme1'], rawTubeIds: ['recTube1'] });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('it should display the localized challenge', async function(assert) {
    const screen = await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(screen.getByText('Version en'));

    const embedUrlInput = await screen.getByRole('textbox', { name: 'Embed URL :' });
    assert.deepEqual(embedUrlInput.value, 'https://my-embed.com/en.html');

    const link = await screen.findByText('Prévisualiser');
    assert.ok(link.getAttribute('href').endsWith('/preview?locale=en'), 'href ends with /preview?locale=en');
  });

  test('it should go back to the original challenge', async function(assert) {
    const screen = await visit('/');
    await click(findAll('[data-test-area-item]')[0]);
    await click(findAll('[data-test-competence-item]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(findAll('[data-test-skill-cell-link]')[0]);
    await click(screen.getByText('Version en'));

    await clickByText('Version originale');
    assert.dom(screen.getByText('Version en')).exists();
  });
});
