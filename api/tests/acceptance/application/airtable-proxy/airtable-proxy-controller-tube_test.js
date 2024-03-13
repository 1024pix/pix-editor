import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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

describe('Acceptance | Controller | airtable-proxy-controller | create tube translations', () => {
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

  describe('POST /api/airtable/content/Tubes', () => {
    let airtableRawTube;
    let tubeToSave;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
      const tube = domainBuilder.buildTubeDatasourceObject({ id: 'mon_id_persistant' });
      airtableRawTube = airtableBuilder.factory.buildTube(tube);
      tubeToSave = inputOutputDataBuilder.factory.buildTube({
        ...tube,
        practicalTitle_i18n: {
          fr: 'Outils d\'accès au web',
          en: 'Tools for web',
        },
        practicalDescription_i18n: {
          fr: 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
          en: 'Identify a web browser and a search engine, know how the search engine works',
        },
      });
    });

    describe('nominal cases', () => {
      it('should proxy request to airtable and add translations to the PG table', async () => {
        // Given
        nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tubes', airtableRawTube)
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableRawTube);
        const server = await createServer();

        // When
        const response = await server.inject({
          method: 'POST',
          url: '/api/airtable/content/Tubes',
          headers: generateAuthorizationHeader(user),
          payload: tubeToSave,
        });

        // Then
        expect(response.statusCode).to.equal(200);
        const translations = await knex('translations').select().orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }]);

        expect(translations).to.deep.equal([{
          key: 'tube.mon_id_persistant.practicalDescription',
          locale: 'en',
          value: 'Identify a web browser and a search engine, know how the search engine works'
        }, {
          key: 'tube.mon_id_persistant.practicalDescription',
          locale: 'fr',
          value: 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche'
        }, {
          key: 'tube.mon_id_persistant.practicalTitle',
          locale: 'en',
          value: 'Tools for web'
        }, {
          key: 'tube.mon_id_persistant.practicalTitle',
          locale: 'fr',
          value: 'Outils d\'accès au web'
        }]);
      });
    });
  });
});
