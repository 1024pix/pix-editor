import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { omit } from 'lodash';
import nock from 'nock';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  inputOutputDataBuilder,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller | create attachment translations', () => {
  beforeEach(() => {
    nock('https://api.test.pix.fr').post(/.*/).reply(200);

    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);
  });

  afterEach(async () => {
    try {
      expect(nock.isDone()).to.be.true;
    } finally {
      await knex('translations').truncate();
    }
  });

  describe('POST /api/airtable/content/Attachments', () => {
    let airtableRawChallenge;
    let airtableRawAttachment;
    let attachmentToSave;
    let user;

    beforeEach(async function() {

      user = databaseBuilder.factory.buildAdminUser();
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallengeId',
        challengeId: 'recChallengeId',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: localizedChallenge.id,
        attachmentId: 'mon_id_persistant'
      });

      await databaseBuilder.commit();

      const attachment = domainBuilder.buildAttachmentDatasourceObject({
        id: 'mon_id_persistant',
        alt: 'Alt en français',
        challengeId: localizedChallenge.challengeId,
        localizedChallengeId: localizedChallenge.id,
      });

      const challenge = domainBuilder.buildChallengeDatasourceObject({
        id: localizedChallenge.challengeId,
      });
      airtableRawChallenge = airtableBuilder.factory.buildChallenge({
        ...challenge,
        files: [{
          fileId: 'mon_id_persistant',
          localizedChallengeId: localizedChallenge.id,
        }]
      });
      airtableRawAttachment = airtableBuilder.factory.buildAttachment(attachment);
      airtableRawAttachment.fields.alt = attachment.alt;
      attachmentToSave = inputOutputDataBuilder.factory.buildAttachment(attachment);
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Epreuves')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .query(true)
          .reply(200, {
            records: [airtableRawChallenge],
          });

        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Attachments')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .query(true)
          .reply(200, {
            records: [airtableRawAttachment],
          });

        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Attachments', omit(airtableRawAttachment, ['fields.createdAt']))
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableRawAttachment);

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Attachments',
          headers: generateAuthorizationHeader(user),
          payload: attachmentToSave,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select().orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }]);

        expect(translations).to.deep.equal([{
          key: 'challenge.recChallengeId.illustrationAlt',
          locale: 'fr',
          value: 'Alt en français'
        }]);
      });
    });
  });

  describe('PATCH /api/airtable/content/Attachments', () => {
    let airtableRawChallenge;
    let airtableRawAttachment;
    let attachmentToUpdate;
    let user;

    beforeEach(async function() {

      user = databaseBuilder.factory.buildAdminUser();
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallengeId',
        challengeId: 'recChallengeId',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: localizedChallenge.id,
        attachmentId: 'mon_id_persistant'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.recChallengeId.illustrationAlt',
        locale: 'fr',
        value: 'Alt en français'
      });

      await databaseBuilder.commit();

      const attachment = domainBuilder.buildAttachmentDatasourceObject({
        id: 'mon_id_persistant',
        alt: 'Alt modifié en français',
        challengeId: localizedChallenge.challengeId,
        localizedChallengeId: localizedChallenge.id,
      });

      const challenge = domainBuilder.buildChallengeDatasourceObject({
        id: localizedChallenge.challengeId,
      });
      airtableRawChallenge = airtableBuilder.factory.buildChallenge({
        ...challenge,
        files: [{
          fileId: 'mon_id_persistant',
          localizedChallengeId: localizedChallenge.id,
        }]
      });
      airtableRawAttachment = airtableBuilder.factory.buildAttachment(attachment);
      airtableRawAttachment.fields.alt = attachment.alt;
      attachmentToUpdate = inputOutputDataBuilder.factory.buildAttachment(attachment);
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Epreuves')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .query(true)
          .reply(200, {
            records: [airtableRawChallenge],
          });

        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Attachments')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .query(true)
          .reply(200, {
            records: [airtableRawAttachment],
          });

        nock('https://api.airtable.com')
          .patch(`/v0/airtableBaseValue/Attachments/${attachmentToUpdate.id}`, omit(airtableRawAttachment, ['fields.createdAt']))
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableRawAttachment);

        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/airtable/content/Attachments/${attachmentToUpdate.id}`,
          headers: generateAuthorizationHeader(user),
          payload: attachmentToUpdate,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select().orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }]);

        expect(translations).to.deep.equal([{
          key: 'challenge.recChallengeId.illustrationAlt',
          locale: 'fr',
          value: 'Alt modifié en français'
        }]);
      });
    });
  });
});

describe('Acceptance | Controller | airtable-proxy-controller | retrieve attachment translations', () => {

  afterEach(() => {
    expect(nock.isDone()).to.be.true;
  });

  afterEach(function() {
    return knex('translations').truncate();
  });

  describe('GET /api/airtable/content/Attachments', () => {
    let airtableAttachment;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'mon_localized_challenge_id',
        challengeId: 'mon_challenge_id_persistant'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.mon_challenge_id_persistant.illustrationAlt',
        locale: 'fr',
        value: 'la trad de mon illustration',
      });
      airtableAttachment = airtableBuilder.factory.buildAttachment({
        id: 'mon_attachment_id_persistant',
        challengeId: 'mon_challenge_id_persistant',
        localizedChallengeId: 'mon_localized_challenge_id',
        type: 'image',
        url: '/une/url',
      });
      await databaseBuilder.commit();
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and read translations to the PG table', async () => {
        // Given
        const expectedAttachment = inputOutputDataBuilder.factory.buildAttachment({
          id: 'mon_attachment_id_persistant',
          challengeId: 'mon_challenge_id_persistant',
          localizedChallengeId: 'mon_localized_challenge_id',
          type: 'image',
          url: '/une/url',
          alt: 'la trad de mon illustration',
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Attachments')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [omit(airtableAttachment, 'fields.createdAt')] });
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Attachments',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({ records: [expectedAttachment] });
      });
    });
  });

  describe('GET /api/airtable/content/Attachments/id', () => {
    let airtableAttachment;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'mon_localized_challenge_id',
        challengeId: 'mon_challenge_id_persistant'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.mon_challenge_id_persistant.illustrationAlt',
        locale: 'fr',
        value: 'la trad de mon illustration',
      });
      airtableAttachment = airtableBuilder.factory.buildAttachment({
        id: 'mon_attachment_id_persistant',
        challengeId: 'mon_challenge_id_persistant',
        localizedChallengeId: 'mon_localized_challenge_id',
        type: 'image',
        url: '/une/url',
      });
      await databaseBuilder.commit();
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and read translations to the PG table', async () => {
        // Given
        const expectedAttachment = inputOutputDataBuilder.factory.buildAttachment({
          id: 'mon_attachment_id_persistant',
          challengeId: 'mon_challenge_id_persistant',
          localizedChallengeId: 'mon_localized_challenge_id',
          type: 'image',
          url: '/une/url',
          alt: 'la trad de mon illustration',
        });
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Attachments/mon_attachment_id_persistant')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, omit(airtableAttachment, 'fields.createdAt'));
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'GET',
          url: '/api/airtable/content/Attachments/mon_attachment_id_persistant',
          headers: generateAuthorizationHeader(user)
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedAttachment);
      });
    });
  });
});
