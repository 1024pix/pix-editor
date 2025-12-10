import { clickByText, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, find } from '@ember/test-helpers';
import { setupMirage } from 'pix-editor/tests/test-support/setup-mirage';
import { selectFiles } from 'ember-file-upload/test-support';
import { runTask } from 'ember-lifeline';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pix-editor/models/challenge';
import LocalizedChallengeModel from 'pix-editor/models/localized-challenge';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | V2 | Modify-Localized-Challenge-Attachment', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const skillId = 'skill1',
    skillName = '@tube1',
    prototypeId = 'prototype1';
  let storageServiceStub, store;

  hooks.beforeEach(function () {
    class StorageServiceStub extends Service {
      uploadFile() {}
    }
    this.owner.register('service:storage', StorageServiceStub);
    storageServiceStub = this.owner.lookup('service:storage');
    store = this.owner.lookup('service:store');

    window.localStorage.setItem('v2', 'true');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('competence', {
      id: 'recCompetence1',
      code: '1.1',
      title: 'ma compétence',
      pixId: 'competence1',
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

    this.server.create('attachment', { id: 'attachmentId', type: 'attachment', challengeId: 'challengeIdProto' });

    const localizedChallengeProduction = this.server.create('localized-challenge', {
      id: 'localizedChallengeIdProto',
      locale: 'nl',
      status: LocalizedChallengeModel.STATUSES.PAUSE,
      instruction: 'hallo mama',
      challenge: challengeProduction,
      embedURL: 'https://super-site.com',
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

  test('it should add attachments', async function (assert) {
    // given
    const file1 = new File([], 'challenge-attachment1.png', { type: 'image/png' });
    const file2 = new File([], 'challenge-attachment2.png', { type: 'image/png' });

    const uploadFileStub = sinon.stub(storageServiceStub, 'uploadFile');

    uploadFileStub
      .withArgs({ file: sinon.match({ file: file1 }), filename: 'challenge-attachment1.png', isAttachment: true })
      .resolves({ url: 'data:,', filename: 'challenge-attachment1' });
    uploadFileStub
      .withArgs({ file: sinon.match({ file: file2 }), filename: 'challenge-attachment2.png', isAttachment: true })
      .resolves({ url: 'data:,', filename: 'challenge-attachment2' });

    // when
    const screen = await visit(
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
    );
    await clickByText('Modifier');

    await selectFiles(screen.getByLabelText('Ajouter un fichier...'), file1);
    await selectFiles(screen.getByLabelText('Ajouter un fichier...'), file2);
    await clickByText('Enregistrer');

    const dialog = screen.getByLabelText('Enregistrer les modifications');
    await click(within(dialog).getByText('Oui'));

    const attachments = await store.peekAll('attachment');

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.ok(storageServiceStub.uploadFile.calledTwice);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments.length, 3);
  });

  test('it should delete attachment', async function (assert) {
    // given
    this.server.create('attachment', {
      id: 'attachmentId1',
      filename: 'attachmentName1',
      type: 'attachment',
      challengeId: 'challengeIdProto',
      localizedChallengeId: 'localizedChallengeIdProto',
    });

    // when
    const screen = await visit(
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
    );
    await clickByText('Modifier');
    await clickByText('Supprimer la pièce jointe attachmentName1');

    await clickByText('Enregistrer');

    const dialog = screen.getByLabelText('Enregistrer les modifications');
    await click(within(dialog).getByText('Oui'));

    const attachments = await store.peekAll('attachment');

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.strictEqual(attachments.length, 1);
    assert.ok(attachments.every((record) => !record.isDeleted));
  });

  test('it should cancel adding an attachment', async function (assert) {
    // given
    this.server.create('attachment', {
      id: 'attachmentId',
      type: 'attachment',
      filename: 'attachmentName',
      challengeId: 'challengeIdProto',
      localizedChallengeId: 'localizedChallengeIdProto',
    });

    // when
    const screen = await visit(
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
    );
    await clickByText('Modifier');
    await clickByText('Supprimer la pièce jointe attachmentName');

    const cancelButton = await screen.findByRole('button', { name: "Annuler l'édition" });
    await click(cancelButton);

    const attachments = await store.peekAll('attachment');

    // then
    assert.dom(screen.getByText('Modification annulée')).exists();
    assert.strictEqual(attachments.length, 1);
    assert.ok(attachments.every((record) => !record.isDeleted));
  });

  test('it should rename attachment baseName', async function (assert) {
    // given
    this.server.create('attachment', {
      id: 'attachmentId1',
      filename: 'attachmentName1.csv',
      type: 'attachment',
      challengeId: 'challengeIdProto',
      localizedChallengeId: 'localizedChallengeIdProto',
    });
    // when
    const screen = await visit(
      `/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`,
    );
    await clickByText('Modifier');
    await fillByLabel('Nom :', 'newName');
    await clickByText('Enregistrer');

    const dialog = screen.getByLabelText('Enregistrer les modifications');
    await click(within(dialog).getByText('Oui'));

    // then
    const attachment = await store.findRecord('attachment', 'attachmentId1');

    assert.strictEqual(attachment.filename, 'newName.csv');
    assert.notOk(attachment.isNew);
  });
});
