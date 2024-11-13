import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, find, findAll } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | competences | challenge-production', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence-overview', {
      id: 'competence1:challenges-production',
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
            validatedChallengesCount: 0,
          }, null, null, null, null, null, null],
        }],
      }],
    });

    return authenticateSession();
  });

  test('should visit challenge production v2', async function(assert) {
    // when
    const screen = await visit('/v2/competences/competence1/challenges-production');

    // then
    assert.ok(screen.getByText('@tube1'));
  });
});
