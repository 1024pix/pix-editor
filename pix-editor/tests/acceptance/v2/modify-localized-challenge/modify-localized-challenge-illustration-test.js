import { clickByText, visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallengeModel from 'pixeditor/models/localized-challenge';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupApplicationTest } from '../../../setup-application-rendering';

module('Acceptance | V2 | Modify-Localized-Challenge-Illustration', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const skillId = 'skill1', skillName = '@tube1', prototypeId = 'prototype1';
  let storageServiceStub, store;

  hooks.beforeEach(function() {
    class StorageServiceStub extends Service {
      uploadFile() { }
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

    const attachment = this.server.create('attachment', { id: 'attachmentId', type: 'attachment', challengeId: 'challengeIdProto' });

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

    skill.update({ challengesProduction: [challengeProduction], localizedChallengesProduction: [localizedChallengeProduction] });

    return authenticateSession();
  });

  test('adding illustration', async function(assert) {
    // given
    const file = new File([], 'challenge-illustration.png', { type: 'image/png' });
    sinon.stub(storageServiceStub, 'uploadFile').resolves({ url: 'data:,', filename: 'attachment-name' });

    // when
    const screen = await visit(`/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`);
    await clickByText('Modifier');
    await selectFiles(screen.getByLabelText('Choisir une image'), file);
    await clickByText('Enregistrer');

    const attachments = await store.peekAll('attachment');

    // then
    assert.dom(screen.getByText('Épreuve mise à jour')).exists();
    assert.ok(storageServiceStub.uploadFile.calledOnce);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments.length, 2);
  });

  test('replace illustration', async function(assert) {
    // given
    const illustrationA = new File([], 'challenge-illustrationA.png', { type: 'image/png' });
    const illustrationB = new File([], 'challenge-illustrationB.png', { type: 'image/png' });

    const uploadFileStub = sinon.stub(storageServiceStub, 'uploadFile');
    uploadFileStub.withArgs({ file: sinon.match({ file: illustrationA }) }).resolves({ url: 'data-illustrationA:,', filename: 'illustration-nameA' });
    uploadFileStub.withArgs({ file: sinon.match({ file: illustrationB }) }).resolves({ url: 'data-illustrationB:,', filename: 'illustration-nameB' });

    // when
    // adding illustrationA
    const screen = await visit(`/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`);
    await clickByText('Modifier');
    await selectFiles(screen.getByLabelText('Choisir une image'), illustrationA);
    await clickByText('Enregistrer');

    // replace illustrationA with illustrationB
    await clickByText('Modifier');
    await selectFiles(screen.getByLabelText('Choisir une image'), illustrationB);
    await clickByText('Enregistrer');

    const attachments = store.peekAll('attachment').slice();

    // then
    assert.ok(uploadFileStub.calledTwice);
    assert.ok(attachments.every((record) => !record.isNew));
    assert.strictEqual(attachments.length, 2);
    assert.ok(attachments.find(({ url }) => url === 'data-illustrationB:,'));
  });

  test('delete illustration', async function(assert) {
    // given
    this.server.create('attachment', { id: 'recAttachment1', type: 'illustration', challengeId: 'challengeIdProto', localizedChallengeId: 'localizedChallengeIdProto' });

    // when
    await visit(`/v2/competences/recCompetence1/challenges-production/skills/${skillId}/localized-challenges/localizedChallengeIdProto?locale=nl`);

    await clickByText('Modifier');
    await clickByText('Supprimer l\'image');

    await clickByText('Enregistrer');

    const attachments = await store.peekAll('attachment');

    // then
    assert.strictEqual(attachments.length, 1);
    assert.ok(attachments.every((record) => !record.isDeleted));
  });
});
