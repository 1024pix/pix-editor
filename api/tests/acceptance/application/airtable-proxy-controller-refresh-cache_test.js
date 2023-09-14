import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  inputOutputDataBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | airtable-proxy-controller-refresh-cache', () => {

  afterEach(async function() {
    try {
      expect(nock.isDone()).to.be.true;
    } finally {
      await knex('translations').truncate();
    }
  });

  describe('POST /api/airtable/content/Competences', () => {
    let expectedCompetence;
    let competenceToRefresh;
    let airtableRawCompetence;
    const token = 'dummy-pix-api-token';

    let user;
    beforeEach(async function() {
      nock('https://api.airtable.com')
        .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .optionally()
        .reply(404);

      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const competence = domainBuilder.buildCompetenceDatasourceObject({ id: 'recCompetence' });
      airtableRawCompetence = airtableBuilder.factory.buildCompetence(competence);
      expectedCompetence = {
        ...competence,
        name_i18n: {
          fr: 'vive la baguette',
          en: 'The baguette!',
        },
        description_i18n: {
          fr: null,
          en: null,
        },
      };
      competenceToRefresh = inputOutputDataBuilder.factory.buildCompetence(expectedCompetence);
    });

    it('should refresh cache of updated record in pix api', async () => {
      // Given
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': token });
      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/recCompetence', expectedCompetence)
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200);

      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Competences', airtableRawCompetence)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableRawCompetence);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Competences',
        headers: generateAuthorizationHeader(user),
        payload: competenceToRefresh,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(competenceToRefresh);
      apiCacheScope.done();
    });

    it('should return 200 when refresh cache fails', async () => {
      // Given
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': token });

      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/recCompetence', expectedCompetence)
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(400);

      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Competences', airtableRawCompetence)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableRawCompetence);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Competences',
        headers: generateAuthorizationHeader(user),
        payload: competenceToRefresh,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(competenceToRefresh);
      apiCacheScope.done();
    });

    it('should return 200 when Pix API authentication fails', async () => {
      // Given
      const apiTokenScope = nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(400);

      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Competences', airtableRawCompetence)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableRawCompetence);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Competences',
        headers: generateAuthorizationHeader(user),
        payload: competenceToRefresh,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(competenceToRefresh);
      apiTokenScope.done();
    });
  });

  describe('POST /api/airtable/content/Epreuves', () => {
    const challengeDataObject = domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge' });
    const challenge = airtableBuilder.factory.buildChallenge(challengeDataObject);
    const expectedChallenge = domainBuilder.buildChallengeForRelease(challengeDataObject);
    const attachment = airtableBuilder.factory.buildAttachment({
      id: '1',
      type: 'illustration',
      url: 'http://example.com/my-illustration',
      alt: 'my alt',
      challengeId: 'recChallenge'
    });
    const token = 'dummy-pix-api-token';

    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

    });

    it('should refresh cache of updated record in pix api', async () => {
      // Given
      const expectedChallengePayload = {
        ...expectedChallenge,
        illustrationUrl: 'http://example.com/my-illustration',
        illustrationAlt: 'my alt',
      };

      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Epreuves', challenge)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, challenge);

      const attachmentsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query({ filterByFormula: '{challengeId persistant} = \'recChallenge\'' })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [attachment] });

      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': token });

      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/challenges/recChallenge', expectedChallengePayload)
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200);

      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Epreuves',
        headers: generateAuthorizationHeader(user),
        payload: challenge,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(challenge);
      attachmentsScope.done();
      apiCacheScope.done();
    });
  });

});
