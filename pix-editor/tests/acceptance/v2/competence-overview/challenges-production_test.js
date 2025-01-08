import { clickByText, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pixeditor/models/challenge';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | competences | challenge-production', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const skillId = 'skill1', skillName = '@tube1', prototypeId = 'prototype1';

  hooks.beforeEach(function() {
    window.localStorage.setItem('v2', 'true');
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
            id: skillId,
            name: skillName,
            prototypeId,
            isPrototypeDeclinable: true,
            proposedChallengesCount: 1,
            validatedChallengesCount: 1,
            airtableId: skillId,
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
            id: skillId,
            name: skillName,
            prototypeId,
            isPrototypeDeclinable: true,
            proposedChallengesCount: 0,
            validatedChallengesCount: 1,
          }, null, null, null, null, null, null],
        }],
      }],
    });
    const skill = this.server.create('skill', {
      id: skillId,
      name: skillName,
      pixId: skillId,
    });
    const challengeProduction = this.server.create('challenge', {
      id: 'challengeIdProto',
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      status: Challenge.STATUSES.VALIDE,
      instruction: 'Coucou maman',
      locales: ['fr'],
    });
    skill.update({ challengesProduction: [challengeProduction] });

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

  test('should display a challenge production list', async function(assert) {
    // given
    this.server.create('challenge', { id: prototypeId, status: 'validé', version: 1, alternativeVersion: null, genealogy: 'Prototype 1', instruction: 'instruction' });
    this.server.create('skill', { id: skillId, challengeIds: [prototypeId] });

    // when
    const screen = await visit('/v2/competences/competence1/challenges-production');
    await clickByText('@tube1');

    // then
    assert.dom(screen.getByText('instruction'));
    assert.strictEqual(currentURL(), `/v2/competences/competence1/challenges-production/skills/${skillId}/challenges`);
  });
});
