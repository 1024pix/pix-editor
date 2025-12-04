import { clickByText, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pixeditor/models/challenge';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | expand-collapse-close-multipanels', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const skillId = 'skill1',
    skillName = '@tube1',
    prototypeId = 'prototype1';

  hooks.beforeEach(function () {
    window.localStorage.setItem('v2', 'true');
    this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence', {
      id: 'recCompetence1',
      code: '1.1',
      title: 'ma compétence',
      pixId: 'competence1',
    });
    this.server.create('competence-overview', {
      id: 'competence1:challenges-production',
      name: '1.1 ma compétence',
      airtableId: 'recCompetence1',
      thematicOverviews: [
        {
          id: 'thematic1',
          name: 'thematic name',
          tubeOverviews: [
            {
              id: 'tube1',
              name: '@tube',
              skillOverviews: [
                {
                  id: skillId,
                  name: skillName,
                  prototypeId,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 1,
                  validatedChallengesCount: 1,
                  airtableId: skillId,
                },
                null,
                null,
                null,
                null,
                null,
                null,
              ],
            },
          ],
        },
      ],
    });
    this.server.create('competence-overview', {
      id: 'competence1:challenges-production:nl',
      name: '1.1 ma compétence',
      airtableId: 'recCompetence1',
      thematicOverviews: [
        {
          id: 'thematic1',
          name: 'thematic name',
          tubeOverviews: [
            {
              id: 'tube1',
              name: '@tube',
              skillOverviews: [
                {
                  id: skillId,
                  name: skillName,
                  prototypeId,
                  isPrototypeDeclinable: true,
                  proposedChallengesCount: 0,
                  validatedChallengesCount: 1,
                },
                null,
                null,
                null,
                null,
                null,
                null,
              ],
            },
          ],
        },
      ],
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

  test('should correctly expand / collapse panels according to scenario', async function (assert) {
    // Grid only
    await visit('/v2/competences/recCompetence1/challenges-production');
    assert.dom('.competence-overview-grid').isVisible();
    assert.dom('.pix-table').isNotVisible();
    assert.dom('.challenge-view').isNotVisible();

    // Click on cell, display table
    await clickByText('@tube1');
    assert.dom('.competence-overview-grid').isVisible();
    assert.dom('.pix-table').isVisible();
    assert.dom('.challenge-view').isNotVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );

    // Close table
    await clickByText('Fermer la liste des épreuves');
    assert.dom('.competence-overview-grid').isVisible();
    assert.dom('.pix-table').isNotVisible();
    assert.dom('.challenge-view').isNotVisible();
    assert.strictEqual(currentURL(), '/v2/competences/recCompetence1/challenges-production');

    // Expand table
    await clickByText('@tube1');
    await clickByText('Agrandir la liste des épreuves');
    assert.dom('.competence-overview-grid').isNotVisible();
    assert.dom('.pix-table').isVisible();
    assert.dom('.challenge-view').isNotVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );

    // Collapse table
    await clickByText('Agrandir la liste des épreuves'); // #clown
    assert.dom('.competence-overview-grid').isVisible();
    assert.dom('.pix-table').isVisible();
    assert.dom('.challenge-view').isNotVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );

    // Click on details, display details and table
    await clickByText('Proto');
    assert.dom('.competence-overview-grid').isNotVisible();
    assert.dom('.pix-table').isVisible();
    assert.dom('.challenge-view').isVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges/challengeIdProto`,
    );

    // Close details
    await clickByText("Fermer l'épreuve");
    assert.dom('.competence-overview-grid').isVisible();
    assert.dom('.pix-table').isVisible();
    assert.dom('.challenge-view').isNotVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );

    // Expand details from collapsed table, then close back to collapsed table
    await clickByText('Proto');
    await clickByText("Agrandir l'épreuve");
    assert.dom('.competence-overview-grid').isNotVisible();
    assert.dom('.pix-table').isNotVisible();
    assert.dom('.challenge-view').isVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges/challengeIdProto`,
    );
    await clickByText("Fermer l'épreuve");
    assert.dom('.competence-overview-grid').isVisible();
    assert.dom('.pix-table').isVisible();
    assert.dom('.challenge-view').isNotVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );

    // Expand details from expanded table, then close back to expanded table
    await clickByText('Agrandir la liste des épreuves');
    await clickByText('Proto');
    await clickByText("Agrandir l'épreuve");
    assert.dom('.competence-overview-grid').isNotVisible();
    assert.dom('.pix-table').isNotVisible();
    assert.dom('.challenge-view').isVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges/challengeIdProto`,
    );
    await clickByText("Fermer l'épreuve");
    assert.dom('.competence-overview-grid').isNotVisible();
    assert.dom('.pix-table').isVisible();
    assert.dom('.challenge-view').isNotVisible();
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );
  });
});
