import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';
import * as config from '../../../lib/config.js';

describe('Acceptance | Route | areas', () => {
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

  describe('GET /areas', async () => {
    beforeEach(async () => {
      databaseBuilder.factory.buildFramework({ id: 'framework1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'framework1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'framework1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence3', index: '2.1', areaId: 'area2' });
      databaseBuilder.factory.buildCompetence({ id: 'competence4', index: '2.2', areaId: 'area2' });
      databaseBuilder.factory.buildArea({ id: 'area3', code: '3', frameworkId: 'framework1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence5', index: '3.1', areaId: 'area3' });
      databaseBuilder.factory.buildCompetence({ id: 'competence6', index: '3.2', areaId: 'area3' });
      databaseBuilder.factory.buildCompetence({ id: 'competence7', index: '3.3', areaId: 'area3' });
      databaseBuilder.factory.buildFramework({ id: 'framework2', name: 'Fmk 2' });
      databaseBuilder.factory.buildArea({ id: 'area4', code: '1', frameworkId: 'framework2' });
      databaseBuilder.factory.buildCompetence({ id: 'competence8', index: '1.1', areaId: 'area4' });
      databaseBuilder.factory.buildCompetence({ id: 'competence9', index: '1.2', areaId: 'area4' });

      databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'fr', value: 'Premier domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'en', value: 'First domain' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area2.title', locale: 'fr', value: 'Deuxième domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area2.title', locale: 'en', value: 'Second domain' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area3.title', locale: 'fr', value: 'Troisième domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area3.title', locale: 'en', value: 'Third domain' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area4.title', locale: 'fr', value: 'Quatrième domaine' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area4.title', locale: 'en', value: 'Fourth domain' });

      await databaseBuilder.commit();
    });

    it('should respond with status 200 and areas', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/areas',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'areas',
            id: 'area1',
            attributes: {
              'pix-id': 'area1',
              code: '1',
              'title-fr-fr': 'Premier domaine',
              'title-en-us': 'First domain',
              name: '1. Premier domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework1',
                },
              },
              competences: { data: [{ id: 'competence1', type: 'competences' }, { id: 'competence2', type: 'competences' }] },
            },
          },
          {
            type: 'areas',
            id: 'area4',
            attributes: {
              'pix-id': 'area4',
              code: '1',
              'title-fr-fr': 'Quatrième domaine',
              'title-en-us': 'Fourth domain',
              name: '1. Quatrième domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework2',
                },
              },
              competences: { data: [{ id: 'competence8', type: 'competences' }, { id: 'competence9', type: 'competences' }] },
            },
          },
          {
            type: 'areas',
            id: 'area2',
            attributes: {
              'pix-id': 'area2',
              code: '2',
              'title-fr-fr': 'Deuxième domaine',
              'title-en-us': 'Second domain',
              name: '2. Deuxième domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework1',
                },
              },
              competences: { data: [{ id: 'competence3', type: 'competences' }, { id: 'competence4', type: 'competences' }] },
            },
          },
          {
            type: 'areas',
            id: 'area3',
            attributes: {
              'pix-id': 'area3',
              code: '3',
              'title-fr-fr': 'Troisième domaine',
              'title-en-us': 'Third domain',
              name: '3. Troisième domaine',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework1',
                },
              },
              competences: {
                data: [
                  { id: 'competence5', type: 'competences' },
                  { id: 'competence6', type: 'competences' },
                  { id: 'competence7', type: 'competences' },
                ],
              },
            },
          },
        ],
      });
    });
  });

  describe('POST /areas', () => {
    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/areas',
          payload: {
            data: {
              type: 'areas',
              attributes: {
                'title-fr-fr': 'Mon domaine',
                'title-en-us': 'My domain',
              },
              relationships: {
                framework: {
                  data: {
                    type: 'frameworks',
                    id: 'framework2',
                  },
                },
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
          url: '/api/areas',
          payload: {
            data: {
              type: 'areas',
              attributes: {
                'title-fr-fr': 'Mon domaine',
                'title-en-us': 'My domain',
              },
              relationships: { framework: { data: null } },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    it('should respond with status 201 and created area', async () => {
      // given
      databaseBuilder.factory.buildFramework({
        id: 'framework1',
        name: 'Ref 1',
      });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'framework1',
      });
      databaseBuilder.factory.buildArea({
        id: 'area2',
        code: '2',
        frameworkId: 'framework1',
      });
      databaseBuilder.factory.buildFramework({
        id: 'framework2',
        name: 'Ref 2',
      });
      databaseBuilder.factory.buildArea({
        id: 'area4',
        code: '1',
        frameworkId: 'framework2',
      });
      await databaseBuilder.commit();

      const generateNewId = vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('area5');

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        payload: {
          data: {
            type: 'areas',
            attributes: {
              'title-fr-fr': 'Cinquième domaine',
              'title-en-us': 'Fifth domain',
            },
            relationships: {
              framework: {
                data: {
                  type: 'frameworks',
                  id: 'framework2',
                },
              },
            },
          },
        },
        url: '/api/areas',
        headers: generateAuthorizationHeader(adminUser),
      });

      // then
      expect(response.statusCode).toBe(201);

      expect(response.result).toEqual({
        data: {
          type: 'areas',
          id: 'area5',
          attributes: {
            'pix-id': 'area5',
            code: '2',
            'title-fr-fr': 'Cinquième domaine',
            'title-en-us': 'Fifth domain',
            name: '2. Cinquième domaine',
          },
          relationships: {
            framework: {
              data: {
                type: 'frameworks',
                id: 'framework2',
              },
            },
            competences: { data: [] },
          },
        },
      });

      expect(generateNewId).toHaveBeenCalledWith('area');

      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy('locale')).resolves.toStrictEqual(
        [{ key: 'area.area5.title', locale: 'en', value: 'Fifth domain' }, { key: 'area.area5.title', locale: 'fr', value: 'Cinquième domaine' }],
      );
    });
  });
});
