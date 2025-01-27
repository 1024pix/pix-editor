import { clickByText, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | navigation-primary-localized', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    window.localStorage.setItem('v2', 'true');
    this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence', { id: 'recCompetence1', pixId: 'competence1', rawTubeIds: [], rawThemeIds: [], code: '1.1', title: 'ma compétence' });
    this.server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });

    this.server.create('competence-overview', {
      id: 'competence1:challenges-production',
      airtableId: 'recCompetence1',
      name: '1.1 ma compétence',
      thematicOverviews: [{
        id: 'thematic1',
        name: 'thematic name',
        tubeOverviews: [{
          id: 'tube1',
          name: '@tube',
          skillOverviews: [{
            id: 'skill1',
            name: '@tube1',
            prototypeId: 'prototype1',
            isPrototypeDeclinable: true,
            proposedChallengesCount: 1,
            validatedChallengesCount: 1,
          }, null, null, null, null, null, null],
        }],
      }],
    });
    this.server.create('competence-overview', {
      id: 'competence1:challenges-production:fr',
      airtableId: 'recCompetence1',
      name: '1.1 ma compétence',
      thematicOverviews: [{
        id: 'thematic1',
        name: 'thematic name',
        tubeOverviews: [{
          id: 'tube1',
          name: '@tube',
          skillOverviews: [{
            id: 'skill1',
            name: '@tube1',
            prototypeId: 'prototype1',
            isPrototypeDeclinable: true,
            proposedChallengesCount: 1,
            validatedChallengesCount: 1,
          }, null, null, null, null, null, null],
        }],
      }],
    });
    this.server.create('competence-overview', {
      id: 'competence1:challenges-production:nl',
      airtableId: 'recCompetence1',
      name: '1.1 ma compétence',
      thematicOverviews: [{
        id: 'thematic1',
        name: 'thematic name',
        tubeOverviews: [{
          id: 'tube1',
          name: '@tube',
          skillOverviews: [{
            id: 'skill1',
            name: '@tube1',
            prototypeId: 'prototype1',
            isPrototypeDeclinable: true,
            proposedChallengesCount: 0,
            validatedChallengesCount: 1,
          }, null, null, null, null, null, null],
        }],
      }],
    });
    const skill = this.server.create('skill', {
      id: 'skill1',
      name: '@tube1',
      pixId: 'skill1',
    });
    const challengeProduction = this.server.create('challenge', {
      id: 'challengeIdProto',
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      status: Challenge.STATUSES.VALIDE,
      instruction: 'Coucou maman',
      locales: ['fr'],
    });
    const localizedChallengeProductionFr = this.server.create('localized-challenge', {
      id: 'challengeIdProto',
      challenge: challengeProduction,
      instruction: 'Coucou maman',
      locale: 'fr',
      status: LocalizedChallenge.STATUSES.PLAY,
    });
    const localizedChallengeProductionNl = this.server.create('localized-challenge', {
      id: 'challengeIdProtoNL',
      challenge: challengeProduction,
      instruction: 'Hallo mama',
      locale: 'nl',
      status: LocalizedChallenge.STATUSES.PAUSE,
    });
    skill.update({ challengesProduction: [challengeProduction], localizedChallengesProduction: [localizedChallengeProductionFr, localizedChallengeProductionNl] });

    return authenticateSession();
  });

  test('should navigate from primary to some locale back and forth seamlessly', async function(assert) {
    // First we are on the primary
    const screen = await visit('/v2/competences/recCompetence1/challenges-production/skills/skill1/challenges');
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production/skills/skill1/challenges');
    assert.dom(screen.getByText('Coucou maman'));
    assert.dom(screen.queryByText('Source')).doesNotExist();

    // Then we go to FR
    await clickByText('Choix de la langue');
    await clickByText('Français');
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production/skills/skill1/localized-challenges?locale=fr');
    assert.dom(screen.getByText('Coucou maman'));
    assert.dom(screen.queryByText('Source')).exists();

    // Then we go to NL
    await clickByText('Choix de la langue');
    await clickByText('Néerlandais');
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production/skills/skill1/localized-challenges?locale=nl');
    assert.dom(screen.getByText('Hallo mama'));
    assert.dom(screen.queryByText('Source')).exists();

    // Then back to primary
    await clickByText('Choix de la langue');
    await clickByText('Langue source');
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production/skills/skill1/challenges');
    assert.dom(screen.getByText('Coucou maman'));
    assert.dom(screen.queryByText('Source')).doesNotExist();
  });
});
