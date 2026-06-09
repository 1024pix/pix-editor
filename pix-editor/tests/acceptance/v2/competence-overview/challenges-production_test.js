import { clickByText, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallengeModel from 'pixeditor/models/localized-challenge';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | competences | challenge-production', function (hooks) {
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
      primaryLocales: ['fr-BE'],
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
      primaryLocales: ['fr-BE'],
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
      locales: ['fr-BE'],
    });

    this.server.create('challenge', {
      id: 'challengeIdProtoEn',
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      status: Challenge.STATUSES.VALIDE,
      instruction: 'Hello mum',
      locales: ['en'],
    });

    const attachment = this.server.create('attachment', {
      id: 'attachmentId',
      type: 'attachment',
      challengeId: 'challengeIdProto',
    });

    const localizedChallengeProduction = this.server.create('localized-challenge', {
      id: 'localizedChallengeIdProto',
      locale: 'nl',
      status: LocalizedChallengeModel.STATUSES.PAUSE,
      instruction: 'hallo mama',
      challenge: challengeProduction,
      embedURL: 'https://super-site.com',
      attachments: [attachment],
    });

    const challengeLocale = this.server.create('challenge-locale', {
      id: 'challengeLocaleId',
      locale: 'nl',
      localizedChallenge: localizedChallengeProduction,
    });

    challengeProduction.update({ challengeLocales: [challengeLocale] });

    skill.update({
      challengesProduction: [challengeProduction],
      localizedChallengesProduction: [localizedChallengeProduction],
    });

    return authenticateSession();
  });

  test('should visit challenge production v2', async function (assert) {
    // when
    const screen = await visit('/v2/competences/recCompetence1/challenges-production');

    // then
    assert.ok(screen.getByRole('heading', { name: '1.1 ma compétence' }));
    assert.ok(screen.getByRole('heading', { name: 'thematic name' }));
    assert.ok(screen.getByRole('heading', { name: '@tube' }));
    assert.ok(screen.getByText('@tube1'));
    assert.dom(screen.getByTitle("Nombre d'épreuves en production")).hasText('1');
    assert.dom(screen.getByTitle("Nombre d'épreuves en cours de construction")).hasText('(1)');
    await clickByText('Néerlandais');
    assert.ok(screen.getByText('@tube1'));
    assert.dom(screen.getByTitle("Nombre d'épreuves en production")).hasText('1');
    assert.dom(screen.queryByTitle("Nombre d'épreuves en cours de construction")).doesNotExist();
  });

  test('should display a challenge production list', async function (assert) {
    // when
    const screen = await visit('/v2/competences/recCompetence1/challenges-production');
    await clickByText('@tube1');

    // then
    assert.dom(screen.getByText('Coucou maman'));
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );
  });

  test('it should navigate to challenge view', async function (assert) {
    await visit('/v2/competences/recCompetence1/challenges-production');
    await clickByText('@tube1');
    await clickByText('Proto');

    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges/challengeIdProto`,
    );
    await clickByText("Fermer l'épreuve");
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges`,
    );
    await clickByText('Coucou maman');

    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/challenges/challengeIdProto`,
    );
  });

  test('should display a localized challenge production list', async function (assert) {
    // when
    const screen = await visit('/v2/competences/recCompetence1/challenges-production?locale=nl');

    await clickByText('@tube1');

    // then
    assert.dom(screen.queryByText('Hello mum')).doesNotExist();
    assert.dom(screen.getByText('hallo mama'));

    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges?locale=nl`,
    );
  });

  test('it should navigate to localized-challenge view', async function (assert) {
    await visit('/v2/competences/recCompetence1/challenges-production?locale=nl');
    await clickByText('@tube1');
    await clickByText('Proto');

    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
    );

    await clickByText("Fermer l'épreuve");
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges?locale=nl`,
    );
    await clickByText('hallo mama');
    assert.strictEqual(
      currentURL(),
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
    );
  });
});
