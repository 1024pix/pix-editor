import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pixeditor/models/challenge';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | fetch-translations', function (hooks) {
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

  module('when not filtering by language', function () {
    test('should not display fetch translations button', async function (assert) {
      await visit('/v2/competences/recCompetence1/challenges-production');
      assert.dom('.competence-overview-actions__fetch').isNotVisible();
    });
  });

  module('when filtering by language', function () {
    test('should display fetch translations button', async function (assert) {
      await visit('/v2/competences/recCompetence1/challenges-production?locale=nl');
      assert.dom('.competence-overview-actions__fetch').isVisible();
    });

    test('fetch button should work', async function (assert) {
      const screen = await visit('/v2/competences/recCompetence1/challenges-production?locale=nl');
      await click(screen.getByRole('button', { name: 'Récupérer les traductions' }));
      assert.dom(await screen.findByText('Téléchargement des traductions depuis Phrase effectué.')).exists();
    });
  });
});
