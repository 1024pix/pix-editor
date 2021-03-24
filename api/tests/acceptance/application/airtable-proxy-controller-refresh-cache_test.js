const nock = require('nock');
const { expect, databaseBuilder, domainBuilder, generateAuthorizationHeader, airtableBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | airtable-proxy-controller-refresh-cache', () => {

  describe('POST /api/airtable/content/Competences', () => {
    const competenceDataObject = domainBuilder.buildCompetenceAirtableDataObject({ id: 'recCompetence' });
    const competence = airtableBuilder.factory.buildCompetence({
      id: 'recCompetence',
      areaId: [competenceDataObject.areaId],
      description: competenceDataObject.description,
      descriptionFrFr: competenceDataObject.descriptionFrFr,
      descriptionEnUs: competenceDataObject.descriptionEnUs,
      index: competenceDataObject.index,
      skillIds: competenceDataObject.skillIds,
      name: competenceDataObject.name,
      nameFrFr: competenceDataObject.nameFrFr,
      nameEnUs: competenceDataObject.nameEnUs,
      origin: competenceDataObject.origin,
    });
    const token = 'dummy-pix-api-token';

    let user;
    beforeEach(async function() {
      user = databaseBuilder.factory.buildUser({ name: 'User', trigram: 'ABC', access: 'admin', apiKey: '11b2cab8-050e-4165-8064-29a1e58d8997' });
      await databaseBuilder.commit();

    });
    afterEach(function() {
      nock.cleanAll();
    });

    it('should refresh cache of updated record in pix api', async () => {
      // Given
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': token });

      const apiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/recCompetence', competenceDataObject)
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(200);

      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Competences', competence)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, competence);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Competences',
        headers: generateAuthorizationHeader(user),
        payload: competence,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(competence);
      apiCacheScope.done();
    });

    it('should return 200 when refresh cache fails', async () => {
      // Given
      nock('https://api.test.pix.fr')
        .post('/api/token', { user: 'adminUser', password: '123' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': token });

      nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/recCompetence', competenceDataObject)
        .matchHeader('Authorization', `Bearer ${token}`)
        .reply(400);

      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Competences', competence)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, competence);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Competences',
        headers: generateAuthorizationHeader(user),
        payload: competence,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(competence);
    });

    it('should return 200 when Pix API authentication fails', async () => {
      // Given
      nock('https://api.test.pix.fr')
        .post('/api/token', { user: 'adminUser', password: '123' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(400);

      nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Competences', competence)
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, competence);
      const server = await createServer();

      // When
      const response = await server.inject({
        method: 'POST',
        url: '/api/airtable/content/Competences',
        headers: generateAuthorizationHeader(user),
        payload: competence,
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(competence);
    });
  });
});
