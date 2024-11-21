import { clickByText, visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | competences | challenge-production', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    window.localStorage.setItem('version-toggle', 'true');
    this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence-overview', {
      id: 'competence1:challenges-production',
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

    return authenticateSession();
  });

  test('should visit challenge production v2', async function(assert) {
    // when
    const screen = await visit('/v2/competences/competence1/challenges-production');

    // then
    assert.ok(screen.getByRole('heading', { name: '1.1 ma compétence' }));
    assert.ok(screen.getByRole('heading', { name: 'thematic name' }));
    assert.ok(screen.getByRole('heading', { name: 'thematic name' }));
    assert.ok(screen.getByRole('heading', { name: '@tube' }));
    assert.ok(screen.getByText('@tube1'));
    assert.dom(screen.getByTitle('Nombre d\'épreuves en production')).hasText('1');
    assert.dom(screen.getByTitle('Nombre d\'épreuves en cours de construction')).hasText('(1)');
    await clickByText('Néerlandais');
    assert.ok(screen.getByText('@tube1'));
    assert.dom(screen.getByTitle('Nombre d\'épreuves en production')).hasText('1');
    assert.dom(screen.queryByTitle('Nombre d\'épreuves en cours de construction')).doesNotExist();
  });
});
