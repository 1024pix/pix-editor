import { clickByText, visit } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Localized-Challenge', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When interacting with a prototype', function(hooks) {
    hooks.beforeEach(function() {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC' });

      this.server.create('challenge', { id: 'recChallenge1', airtableId: 'airtableId1', embedURL: 'https://mon-site.fr/my-link.html?lang=fr', genealogy: 'Prototype 1', version: 1 });
      this.server.create('localized-challenge', { id: 'recChallenge1', challengeId: 'recChallenge1', locale: 'fr' });
      this.server.create('localized-challenge', { id: 'recChallenge1NL', challengeId: 'recChallenge1', locale: 'nl', defaultEmbedURL: 'https://mon-site.fr/my-link.html?lang=nl' });
      this.server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
      this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
      this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
      this.server.create('competence', {
        id: 'recCompetence1.1',
        pixId: 'pixId recCompetence1.1',
        rawThemeIds: ['recTheme1'],
        rawTubeIds: ['recTube1'],
      });
      this.server.create('area', {
        id: 'recArea1',
        name: '1. Information et données',
        code: '1',
        competenceIds: ['recCompetence1.1'],
      });
      this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
      return authenticateSession();
    });

    test('should display a default embedUrl if is empty but not for primary', async function(assert) {
      // when
      const screen = await visit('/');
      await click(findAll('[data-test-area-item]')[0]);
      await click(findAll('[data-test-competence-item]')[0]);
      await click(findAll('[data-test-skill-cell-link]')[0]);
      await clickByText('Version nl');

      // then
      assert.dom(await screen.queryByText('https://mon-site.fr/my-link.html?lang=nl', { exact: false })).exists();
    });
    test('should not display a default url if primary does not have any', async function(assert) {
      // given
      this.server.create('challenge', { id: 'recChallenge2', airtableId: 'airtableId1', embedURL: null });
      this.server.create('localized-challenge', { id: 'recChallenge2', challengeId: 'recChallenge2', locale: 'fr' });
      this.server.create('localized-challenge', { id: 'recChallenge2NL', challengeId: 'recChallenge2', locale: 'nl' });
      this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge2'], level: 1, tubeId: 'recTube1' });

      // when
      const screen = await visit('/');
      await click(findAll('[data-test-area-item]')[0]);
      await click(findAll('[data-test-competence-item]')[0]);
      await click(findAll('[data-test-skill-cell-link]')[0]);
      await clickByText('Version nl');

      // then
      assert.dom(await screen.queryByText('Embed URL auto-générée', { exact: false })).doesNotExist();
    });
    test('should display an embed url if localized challenge has one', async function(assert) {
      // given
      this.server.create('challenge', { id: 'recChallenge2', airtableId: 'airtableId1' });
      this.server.create('localized-challenge', { id: 'recChallenge2', challengeId: 'recChallenge2', locale: 'fr' });
      this.server.create('localized-challenge', { id: 'recChallenge2NL', challengeId: 'recChallenge2', locale: 'nl', embedURL: 'https://mon-site.fr/my-nl-link.html' });
      this.server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge2'], level: 1, tubeId: 'recTube1' });

      // when
      const screen = await visit('/');
      await click(findAll('[data-test-area-item]')[0]);
      await click(findAll('[data-test-competence-item]')[0]);
      await click(findAll('[data-test-skill-cell-link]')[0]);
      await clickByText('Version nl');

      // then
      const input = await screen.findByLabelText('Embed URL :');
      assert.strictEqual(input.value, 'https://mon-site.fr/my-nl-link.html');
    });

  });

  module('When interacting with an alternative', function(hooks) {
    hooks.beforeEach(function() {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC' });

      this.server.create('challenge', { id: 'recChallengeProto1', airtableId: 'airtableIdProto1', genealogy: 'Prototype 1', version: 1 });
      this.server.create('challenge', { id: 'recChallenge1', airtableId: 'airtableId1', embedURL: 'https://mon-site.fr/my-link.html?lang=fr', genealogy: 'Décliné 1', version: 1, instruction: 'Instruction de la déclinaison' });
      this.server.create('localized-challenge', { id: 'recChallenge1', challengeId: 'recChallenge1', locale: 'fr' });
      this.server.create('localized-challenge', { id: 'recChallenge1NL', challengeId: 'recChallenge1', locale: 'nl', defaultEmbedURL: 'https://mon-site.fr/my-link.html?lang=nl' });
      this.server.create('skill', { id: 'recSkill1', name: '@acquis2', challengeIds: ['recChallenge1', 'recChallengeProto1'] });
      this.server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
      this.server.create('theme', { id: 'recTheme1', name: 'theme1', rawTubeIds: ['recTube1'] });
      this.server.create('competence', {
        id: 'recCompetence1.1',
        title: 'Nom de compétence',
        code: 1,
        pixId: 'pixId recCompetence1.1',
        rawThemeIds: ['recTheme1'],
        rawTubeIds: ['recTube1'],
      });
      this.server.create('area', {
        id: 'recArea1',
        name: 'Nom du domaine',
        code: '1',
        competenceIds: ['recCompetence1.1'],
      });
      this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
      return authenticateSession();
    });

    test('should display a default embedUrl if is empty but not for primary', async function(assert) {
      // when
      const screen = await visit('/');
      await clickByText('Nom du domaine');
      await clickByText('1 Nom de compétence');
      await clickByText('@acquis2');
      await clickByText('Déclinaisons >>');
      await clickByText('Instruction de la déclinaison');
      await clickByText('Version nl');

      // then
      assert.dom(await screen.queryByText('https://mon-site.fr/my-link.html?lang=nl', { exact: false })).exists();
    });
  });
});

