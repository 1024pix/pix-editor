import { clickByText, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | navigation-v1-v2', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
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
    this.server.create('challenge', { id: 'prototype1', airtableId: 'airtableRecChallenge1', instruction: 'instructionsChallenge1' });
    this.server.create('skill', { id: 'skill1', challengeIds: ['prototype1'], level: 1 });
    return authenticateSession();
  });

  test('should navigate to v2 route if v2 is enabled', async function(assert) {
    // when
    await visit('/');

    // then
    await clickByText('V2');
    await clickByText('1. Information et données');
    await clickByText('1.1 ma compétence');

    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production');
  });

  test('should upgrade route to v2 when toggling v2 on upgradable v1 route', async function(assert) {
    // when
    await visit('/competence/recCompetence1/prototypes?view=production');
    await clickByText('V2');

    // then
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production');
  });

  test('should downgrade route to v1 when toggling v1 on a v2 route', async function(assert) {
    // when
    await visit('/');
    await clickByText('V2');
    await visit('/v2/competences/recCompetence1/challenges-production');
    await clickByText('V2');

    // then
    assert.strictEqual(currentURL(), '/competence/recCompetence1/prototypes?view=production');
  });

  test('should remember selected language when switching from/to v2', async function(assert) {
    // when
    await visit('/competence/recCompetence1/prototypes?view=production&languageFilter=nl');
    await clickByText('V2');

    // then
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production?locale=nl');
  });

  test('should move to v2 of the selected challenge', async function(assert) {
    // when
    await visit('/competence/recCompetence1/prototypes/prototype1?view=production');
    await clickByText('V2');

    // then
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production/skills/skill1/challenges');
  });
});
