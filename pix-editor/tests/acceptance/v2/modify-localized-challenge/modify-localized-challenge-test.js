import { clickByText, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallengeModel from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';

import { waitForSelectToBeClosed } from 'pixeditor/tests/helpers/wait-for-select-to-be-closed';
import { setupApplicationTest } from '../../../setup-application-rendering';
import { selectFiles } from 'ember-file-upload/test-support';
import sinon from 'sinon';

module('Acceptance | v2 | Modify-Localized-Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const skillId = 'skill1',
    skillName = '@tube1',
    prototypeId = 'prototype1';
  let store;

  hooks.beforeEach(function () {
    window.localStorage.setItem('v2', 'true');
    store = this.owner.lookup('service:store');
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
      locales: ['fr'],
    });

    const localizedChallengeProduction = this.server.create('localized-challenge', {
      id: 'localizedChallengeIdProto',
      locale: 'nl',
      status: LocalizedChallengeModel.STATUSES.PAUSE,
      instruction: 'hallo mama',
      challenge: challengeProduction,
      embedURL: 'https://super-site.com',
      geography: 'FR',
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
    this.server.create('area', {
      id: 'recArea1',
      name: '1. Information et données',
      code: '1',
      competenceIds: ['recCompetence1'],
    });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix', areaIds: ['recArea1'] });
    return authenticateSession();
  });

  test('it should modify attributes in localized challenge', async function (assert) {
    // when
    const store = this.owner.lookup('service:store');

    const screen = await visit('/');
    await click(await screen.findByRole('button', { name: '1. Information et données' }));
    await click(screen.getByRole('link', { name: '1.1 ma compétence' }));

    await clickByText('Choix de la langue');
    await click(await screen.findByRole('option', { name: 'Néerlandais' }));
    await waitForSelectToBeClosed(screen);
    await clickByText('@tube1');
    await clickByText('Proto');

    await clickByText('Modifier');
    await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
    await fillByLabel(
      "URLs externes nécessaires à la résolution de l'épreuve",
      'https://mon-url.com\ninvalideUrl\nhttps://mon-url.fr',
    );
    await fillByLabel('Embed URL', 'https://mon-autre-embed-url.com');
    await clickByText('Géographie');
    await click(await screen.findByRole('option', { name: 'Japon' }));
    await waitForSelectToBeClosed(screen);
    await clickByText('Enregistrer');

    const dialog = screen.getByLabelText('Enregistrer les modifications');
    await click(within(dialog).getByText('Oui'));

    // then
    const localizedChallenge = await store.peekRecord('localized-challenge', 'localizedChallengeIdProto');

    assert.deepEqual(localizedChallenge.urlsToConsult, ['https://mon-url.com', 'https://mon-url.fr']);
    assert.strictEqual(localizedChallenge.embedURL, 'https://mon-autre-embed-url.com');
    assert.strictEqual(localizedChallenge.geography, 'JP');

    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.notOk(localizedChallenge.hasDirtyAttributes);
  });

  module('when edition is cancel on button press', function () {
    test('it should rollback modified attributes', async function (assert) {
      // given
      this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'challengeIdProto' });
      this.server.create('attachment', { id: 'recAttachment2', type: 'attachment', challengeId: 'challengeIdProto' });

      const file1 = new File([], 'challenge-illustration.png', { type: 'image/png' });
      const file2 = new File([], 'challenge-attachment2.csv', { type: 'text/csv' });

      // when
      const screen = await visit(
        `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
      );
      await clickByText('Modifier');
      await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
      await fillByLabel("URLs externes nécessaires à la résolution de l'épreuve", 'https://mon-url.com');
      await fillByLabel('Embed URL', 'https://mon-autre-embed-url.com');
      await clickByText('Géographie');
      await click(await screen.findByRole('option', { name: 'Japon' }));
      await waitForSelectToBeClosed(screen);

      await selectFiles(screen.getByLabelText('Choisir une image'), file1);
      await selectFiles(screen.getByLabelText('Ajouter un fichier...'), file2);

      await click(screen.getByRole('button', { name: "Annuler l'édition" }));

      // then
      const localizedChallenge = await store.peekRecord('localized-challenge', 'localizedChallengeIdProto');
      const attachments = await store.peekAll('attachment');

      assert.notOk(localizedChallenge.urlsToConsult);
      assert.deepEqual(localizedChallenge.embedURL, 'https://super-site.com');
      assert.strictEqual(localizedChallenge.geography, 'FR');
      assert.strictEqual(attachments.length, 2);
    });
  });

  module('when user navigate to an other page', function (hooks) {
    let originalWindowConfirm, confirmStub;
    hooks.beforeEach(function () {
      originalWindowConfirm = window.confirm;
      confirmStub = sinon.stub(window, 'confirm');
    });

    hooks.afterEach(function () {
      window.confirm = originalWindowConfirm;
    });

    module('#on confirm leaving', function (hooks) {
      hooks.beforeEach(function () {
        confirmStub.returns(true);
      });

      test('it should rollback modified attributes', async function (assert) {
        // given
        this.server.create('attachment', {
          id: 'recAttachment1',
          type: 'illustration',
          challengeId: 'challengeIdProto',
        });
        this.server.create('attachment', { id: 'recAttachment2', type: 'attachment', challengeId: 'challengeIdProto' });

        const file1 = new File([], 'challenge-illustration.png', { type: 'image/png' });
        const file2 = new File([], 'challenge-attachment2.csv', { type: 'text/csv' });

        // when
        const screen = await visit(
          `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
        );
        await clickByText('Modifier');
        await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
        await fillByLabel("URLs externes nécessaires à la résolution de l'épreuve", 'https://mon-url.com');
        await fillByLabel('Embed URL', 'https://mon-autre-embed-url.com');
        await clickByText('Géographie');
        await click(await screen.findByRole('option', { name: 'Japon' }));
        await waitForSelectToBeClosed(screen);

        await selectFiles(screen.getByLabelText('Choisir une image'), file1);
        await selectFiles(screen.getByLabelText('Ajouter un fichier...'), file2);

        await click(await screen.findByRole('button', { name: "Fermer l'épreuve" }));

        // then
        const localizedChallenge = await store.peekRecord('localized-challenge', 'localizedChallengeIdProto');
        const attachments = await store.peekAll('attachment');

        assert.notOk(localizedChallenge.urlsToConsult);
        assert.deepEqual(localizedChallenge.embedURL, 'https://super-site.com');
        assert.strictEqual(localizedChallenge.geography, 'FR');
        assert.strictEqual(attachments.length, 2);
      });
    });

    module('#on cancel leaving', function (hooks) {
      hooks.beforeEach(function () {
        confirmStub.returns(false);
      });

      test('it should cancel navigation', async function (assert) {
        // given
        this.server.create('attachment', {
          id: 'recAttachment1',
          type: 'illustration',
          challengeId: 'challengeIdProto',
        });
        this.server.create('attachment', { id: 'recAttachment2', type: 'attachment', challengeId: 'challengeIdProto' });

        const file1 = new File([], 'challenge-illustration.png', { type: 'image/png' });
        const file2 = new File([], 'challenge-attachment2.csv', { type: 'text/csv' });

        // when
        const screen = await visit(
          `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
        );
        await clickByText('Modifier');
        await clickByText("Ajouter des URLs nécessaires à la résolution de l'épreuve");
        await fillByLabel("URLs externes nécessaires à la résolution de l'épreuve", 'https://mon-url.com');
        await fillByLabel('Embed URL', 'https://mon-autre-embed-url.com');
        await clickByText('Géographie');
        await click(await screen.findByRole('option', { name: 'Japon' }));
        await waitForSelectToBeClosed(screen);

        await selectFiles(screen.getByLabelText('Choisir une image'), file1);
        await selectFiles(screen.getByLabelText('Ajouter un fichier...'), file2);

        await click(await screen.findByRole('button', { name: "Fermer l'épreuve" }));

        // then
        const localizedChallenge = await store.peekRecord('localized-challenge', 'localizedChallengeIdProto');
        const attachments = await store.peekAll('attachment');

        assert.deepEqual(localizedChallenge.urlsToConsult, ['https://mon-url.com']);
        assert.strictEqual(localizedChallenge.embedURL, 'https://mon-autre-embed-url.com');
        assert.strictEqual(localizedChallenge.geography, 'JP');
        assert.strictEqual(attachments.length, 4);
      });
    });
  });
});
