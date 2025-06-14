import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader, } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { frameworkDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import * as config from '../../../lib/config.js';

describe('Acceptance | Route | frameworks', () => {
  let editorUser, adminUser, originalPixApiUrlValue;

  beforeEach(async function() {
    originalPixApiUrlValue = config.pixApi.baseUrl;
    delete config.pixApi.baseUrl;
    editorUser = databaseBuilder.factory.buildEditorUser();
    adminUser = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('GET /frameworks', () => {
    let airtableFrameworksScope;

    beforeEach(async () => {
      const airtableFrameworks = [
        airtableBuilder.factory.buildFramework(domainBuilder.buildFrameworkDatasourceObject({
          id: 'framework1',
          name: 'Pix',
          areaIds: ['area1', 'area2'],
        })),
        airtableBuilder.factory.buildFramework(domainBuilder.buildFrameworkDatasourceObject({
          id: 'framework3',
          name: 'Poux',
          areaIds: ['area8', 'area7', 'area6'],
        })),
        airtableBuilder.factory.buildFramework(domainBuilder.buildFrameworkDatasourceObject({
          id: 'framework2',
          name: 'Paix',
          areaIds: ['area4', 'area3', 'area5'],
        })),
        airtableBuilder.factory.buildFramework(domainBuilder.buildFrameworkDatasourceObject({
          id: 'framework4',
          name: 'Prix',
          areaIds: null,
        })),
      ];

      airtableFrameworksScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Referentiel')
        .query({
          fields: { '': frameworkDatasource.usedFields },
          sort: [{ field: frameworkDatasource.sortField, direction: 'asc' }]
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableFrameworks });
    });

    it('should respond with status 200 and frameworks', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/frameworks',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'frameworks',
            id: 'framework1',
            attributes: {
              name: 'Pix',
            },
            relationships: {
              areas: {
                data: [
                  { id: 'area1', type: 'areas' },
                  { id: 'area2', type: 'areas' },
                ],
              },
            },
          },
          {
            type: 'frameworks',
            id: 'framework3',
            attributes: {
              name: 'Poux',
            },
            relationships: {
              areas: {
                data: [
                  { id: 'area8', type: 'areas' },
                  { id: 'area7', type: 'areas' },
                  { id: 'area6', type: 'areas' },
                ],
              },
            },
          },
          {
            type: 'frameworks',
            id: 'framework2',
            attributes: {
              name: 'Paix',
            },
            relationships: {
              areas: {
                data: [
                  { id: 'area4', type: 'areas' },
                  { id: 'area3', type: 'areas' },
                  { id: 'area5', type: 'areas' },
                ],
              },
            },
          },
          {
            type: 'frameworks',
            id: 'framework4',
            attributes: {
              name: 'Prix',
            },
            relationships: {
              areas: {
                data: null,
              },
            },
          },
        ],
      });

      expect(airtableFrameworksScope.isDone()).toBe(true);
    });
  });

  describe('POST /frameworks', () => {
    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/frameworks',
          payload: {
            data: {
              type: 'frameworks',
              attributes: {
                name: 'Mon framework',
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/frameworks',
          payload: {
            data: {
              type: 'frameworks',
              attributes: {
                name: null,
              },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    it('should respond with status 201 and created framework', async () => {
      // given
      const airtableFramework = airtableBuilder.factory.buildFramework(domainBuilder.buildFrameworkDatasourceObject({
        id: 'framework4',
        name: 'Prix',
        areaIds: null,
      }));

      const airtableFrameworksScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Referentiel/', {
          records: [{
            fields: {
              Nom: 'Prix',
            },
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableFramework] });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        payload: {
          data: {
            type: 'frameworks',
            attributes: {
              name: 'Prix',
            },
          },
        },
        url: '/api/frameworks',
        headers: generateAuthorizationHeader(adminUser),
      });

      // then
      expect(response.statusCode).toBe(201);
      expect(response.result).toEqual({
        data: {
          type: 'frameworks',
          id: 'framework4',
          attributes: {
            name: 'Prix',
          },
          relationships: {
            areas: {
              data: null,
            },
          },
        },
      });
      expect(airtableFrameworksScope.isDone()).toBe(true);
    });
  });
});
