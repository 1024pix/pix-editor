import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';
import { Tutorial } from '../../../lib/domain/models/index.js';
import { tutorialDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import * as config from '../../../lib/config.js';

describe('Application | Route | Tutorials', () => {
  let editorUser, readonlyUser, originalPixApiUrlValue;

  beforeEach(async function () {
    originalPixApiUrlValue = config.pixApi.baseUrl;
    delete config.pixApi.baseUrl;
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  afterEach(function () {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('POST /api/tutorials', async () => {
    let airtableCreateTutorialScope;

    afterEach(async () => {
      await knex.delete().from('tutorials-tutorial_tags');
      await knex.delete().from('tutorials');
    });

    context('when user has not the right to do the operation', function () {
      it('should respond with status 403', async function () {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tutorials',
          payload: {
            data: {
              type: 'tutorials',
              attributes: {
                title: 'mon titre',
                duration: '12:01:02',
                source: 'Mon grenier',
                format: Tutorial.FORMATS.PDF,
                link: 'https://coucou.com',
                license: Tutorial.LICENSES.C,
                level: Tutorial.LEVELS.TWO,
                crush: true,
                language: 'fr',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    context('when payload is not formatted correctly', function () {
      it('should respond with status 400', async function () {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tutorials',
          payload: {
            data: {
              type: 'tutorials',
              attributes: {
                title: 'mon titre',
                duration: '01:02:01',
                source: 'Mon grenier',
                format: 'coucou maman',
                link: 'https://coucou.com',
                license: Tutorial.LICENSES.C,
                level: Tutorial.LEVELS.TWO,
                crush: true,
                language: 'fr',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('success', function () {
      it('should respond with status 201 and created tutorial', async () => {
        // given
        const generateNewId = vi.spyOn(idGenerator, 'generateNewId');
        generateNewId.mockReturnValue('tutorialId1');
        databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'title1' });
        databaseBuilder.factory.buildTag({ id: 'tagId2', title: 'title2' });
        await databaseBuilder.commit();

        const createdAirtableTutorial = airtableBuilder.factory.buildTutorial({
          id: 'tutorialId1',
          airtableId: 'tutorialAirtableId1',
          title: 'mon titre',
          format: Tutorial.FORMATS.PDF,
          duration: '12:01:02',
          source: 'Mon grenier',
          link: 'https://coucou.com',
          locale: 'fr',
          license: Tutorial.LICENSES.C,
          level: Tutorial.LEVELS.TWO,
          crush: true,
          tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
          tagIds: ['tagId1', 'tagId2'],
        });
        airtableCreateTutorialScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tutoriels/', {
            records: [
              {
                fields: {
                  'id persistant': 'tutorialId1',
                  Durée: '12:01:02',
                  Format: Tutorial.FORMATS.PDF,
                  Lien: 'https://coucou.com',
                  Source: 'Mon grenier',
                  Titre: 'mon titre',
                  Langue: 'fr',
                  License: Tutorial.LICENSES.C,
                  niveau: Tutorial.LEVELS.TWO,
                  CoupDeCoeur: 'YES',
                  Tags: ['tagAirtableId1', 'tagAirtableId2'],
                },
              },
            ],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [createdAirtableTutorial] });
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tutorials',
          payload: {
            data: {
              type: 'tutorials',
              attributes: {
                title: 'mon titre',
                duration: '12:01:02',
                source: 'Mon grenier',
                format: Tutorial.FORMATS.PDF,
                link: 'https://coucou.com',
                license: Tutorial.LICENSES.C,
                level: Tutorial.LEVELS.TWO,
                crush: true,
                language: 'fr',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(201);
        expect(response.result).toEqual({
          data: {
            type: 'tutorials',
            id: 'tutorialAirtableId1',
            attributes: {
              title: 'mon titre',
              duration: '12:01:02',
              source: 'Mon grenier',
              format: Tutorial.FORMATS.PDF,
              link: 'https://coucou.com',
              license: Tutorial.LICENSES.C,
              level: Tutorial.LEVELS.TWO,
              crush: true,
              language: 'fr',
              'pix-id': 'tutorialId1',
            },
            relationships: {
              tags: {
                data: [
                  {
                    type: 'tags',
                    id: 'tagAirtableId1',
                  },
                  {
                    type: 'tags',
                    id: 'tagAirtableId2',
                  },
                ],
              },
            },
          },
        });
        expect(airtableCreateTutorialScope.isDone()).toBe(true);

        await expect(knex('tutorials').select()).resolves.toStrictEqual([
          {
            id: 'tutorialId1',
            title: 'mon titre',
            duration: '12:01:02',
            source: 'Mon grenier',
            format: Tutorial.FORMATS.PDF,
            link: 'https://coucou.com',
            license: Tutorial.LICENSES.C,
            level: Tutorial.LEVELS.TWO,
            crush: true,
            locale: 'fr',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(knex('tutorials-tutorial_tags').select().orderBy('tutorialTagId')).resolves.toStrictEqual([
          {
            tutorialId: 'tutorialId1',
            tutorialTagId: 'tagId1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            tutorialId: 'tutorialId1',
            tutorialTagId: 'tagId2',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);
      });
    });
  });

  describe('GET /api/tutorials/{tutorialAirtableId}', async () => {
    let airtableGetTutorialScope;

    context('when param is not in the right format', function () {
      it('should respond with status 400', async function () {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tutorials/zouzou',
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('when tutorial does not exist', function () {
      it('should respond with status 404', async function () {
        // given
        const server = await createServer();
        airtableGetTutorialScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tutoriels/tutorialAirtableId')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tutorials/tutorialAirtableId',
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(404);
        expect(airtableGetTutorialScope.isDone()).toBe(true);
      });
    });

    context('success', function () {
      it('should respond with status 200 and tutorial', async () => {
        // given
        const tutorial = {
          id: 'tutorialId',
          airtableId: 'tutorialAirtableId',
          title: 'mon titre',
          format: Tutorial.FORMATS.PDF,
          duration: '12:01:02',
          source: 'Mon grenier',
          link: 'https://coucou.com',
          locale: 'fr',
          license: Tutorial.LICENSES.C,
          level: Tutorial.LEVELS.TWO,
          crush: true,
          tagIds: ['tagId1', 'tagId2'],
          tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
        };

        tutorial.tagIds.forEach((id) => databaseBuilder.factory.buildTag({ id, title: `${id} title` }));
        databaseBuilder.factory.buildTutorial(tutorial);
        await databaseBuilder.commit();

        const airtableTutorial = airtableBuilder.factory.buildTutorial(tutorial);
        airtableGetTutorialScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tutoriels/tutorialAirtableId')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, airtableTutorial);
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tutorials/tutorialAirtableId',
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(200);
        expect(response.result).toEqual({
          data: {
            type: 'tutorials',
            id: 'tutorialAirtableId',
            attributes: {
              title: 'mon titre',
              duration: '12:01:02',
              source: 'Mon grenier',
              format: Tutorial.FORMATS.PDF,
              link: 'https://coucou.com',
              license: Tutorial.LICENSES.C,
              level: Tutorial.LEVELS.TWO,
              crush: true,
              language: 'fr',
              'pix-id': 'tutorialId',
            },
            relationships: {
              tags: {
                data: [
                  {
                    type: 'tags',
                    id: 'tagAirtableId1',
                  },
                  {
                    type: 'tags',
                    id: 'tagAirtableId2',
                  },
                ],
              },
            },
          },
        });
        expect(airtableGetTutorialScope.isDone()).toBe(true);
      });
    });
  });

  describe('PATCH /api/tutorials/{tutorialAirtableId}', async () => {
    let airtableGetTutorialScope, airtableUpdateTutorialScope;

    context('when user has not the right to do the operation', function () {
      it('should respond with status 403', async function () {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                title: 'mon titre',
                duration: '12:01:02',
                source: 'Mon grenier',
                format: Tutorial.FORMATS.PDF,
                link: 'https://coucou.com',
                license: Tutorial.LICENSES.C,
                level: Tutorial.LEVELS.TWO,
                crush: true,
                language: 'fr',
                'pix-id': 'tutorialId',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    context('when payload is not formatted correctly', function () {
      it('should respond with status 400', async function () {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                title: 'mon titre',
                duration: '12:01:02',
                source: 'Mon grenier',
                format: Tutorial.FORMATS.PDF,
                link: 'yo les zamis',
                license: Tutorial.LICENSES.C,
                level: Tutorial.LEVELS.TWO,
                crush: true,
                language: 'fr',
                'pix-id': 'tutorialId',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('when tutorial does not exist', function () {
      it('should respond with status 404', async function () {
        // given
        const server = await createServer();
        airtableGetTutorialScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tutoriels/tutorialAirtableId')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                title: 'mon titre',
                duration: '12:01:02',
                source: 'Mon grenier',
                format: Tutorial.FORMATS.PDF,
                link: 'https://coucou.com',
                license: Tutorial.LICENSES.C,
                level: Tutorial.LEVELS.TWO,
                crush: true,
                language: 'fr',
                'pix-id': 'tutorialId',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
        expect(airtableGetTutorialScope.isDone()).toBe(true);
      });
    });

    context('success', function () {
      it('should respond with status 200 and updated tutorial', async () => {
        // given
        databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'title1' });
        databaseBuilder.factory.buildTag({ id: 'tagId2', title: 'title2' });
        databaseBuilder.factory.buildTag({ id: 'tagId3', title: 'title3' });

        const tutorial = {
          id: 'tutorialId',
          airtableId: 'tutorialAirtableId',
          title: 'mon titre old',
          format: Tutorial.FORMATS.FRISE,
          duration: '06:06:06',
          source: 'Mon grenier old',
          link: 'https://coucou.old',
          locale: 'nl',
          license: Tutorial.LICENSES.YOUTUBE,
          level: Tutorial.LEVELS.FOUR,
          crush: false,
          tagIds: ['tagId3'],
          tagAirtableIds: ['tagAirtableId3'],
        };

        databaseBuilder.factory.buildTutorial(tutorial);

        await databaseBuilder.commit();

        const originalAirtableTutorial = airtableBuilder.factory.buildTutorial(tutorial);
        airtableGetTutorialScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tutoriels/tutorialAirtableId')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, originalAirtableTutorial);
        const updatedAirtableTutorial = airtableBuilder.factory.buildTutorial({
          id: 'tutorialId',
          airtableId: 'tutorialAirtableId',
          title: 'mon titre',
          format: Tutorial.FORMATS.PDF,
          duration: '12:01:02',
          source: 'Mon grenier',
          link: 'https://coucou.com',
          locale: 'fr',
          license: Tutorial.LICENSES.C,
          level: Tutorial.LEVELS.TWO,
          crush: true,
          tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
          tagIds: ['tagId1', 'tagId2'],
        });
        airtableUpdateTutorialScope = nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/Tutoriels/', {
            records: [
              {
                fields: {
                  'id persistant': 'tutorialId',
                  Durée: '12:01:02',
                  Format: Tutorial.FORMATS.PDF,
                  Lien: 'https://coucou.com',
                  Source: 'Mon grenier',
                  Titre: 'mon titre',
                  Langue: 'fr',
                  License: Tutorial.LICENSES.C,
                  niveau: Tutorial.LEVELS.TWO,
                  CoupDeCoeur: 'YES',
                  Tags: ['tagAirtableId1', 'tagAirtableId2'],
                },
                id: 'tutorialAirtableId',
              },
            ],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [updatedAirtableTutorial] });
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                title: 'mon titre',
                duration: '12:01:02',
                source: 'Mon grenier',
                format: Tutorial.FORMATS.PDF,
                link: 'https://coucou.com',
                license: Tutorial.LICENSES.C,
                level: Tutorial.LEVELS.TWO,
                crush: true,
                language: 'fr',
                'pix-id': 'tutorialId',
              },
              relationships: {
                tags: {
                  data: [
                    {
                      type: 'tags',
                      id: 'tagAirtableId1',
                    },
                    {
                      type: 'tags',
                      id: 'tagAirtableId2',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);
        expect(response.result).toEqual({
          data: {
            type: 'tutorials',
            id: 'tutorialAirtableId',
            attributes: {
              title: 'mon titre',
              duration: '12:01:02',
              source: 'Mon grenier',
              format: Tutorial.FORMATS.PDF,
              link: 'https://coucou.com',
              license: Tutorial.LICENSES.C,
              level: Tutorial.LEVELS.TWO,
              crush: true,
              language: 'fr',
              'pix-id': 'tutorialId',
            },
            relationships: {
              tags: {
                data: [
                  {
                    type: 'tags',
                    id: 'tagAirtableId1',
                  },
                  {
                    type: 'tags',
                    id: 'tagAirtableId2',
                  },
                ],
              },
            },
          },
        });
        expect(airtableUpdateTutorialScope.isDone()).toBe(true);

        await expect(knex.select('*').from('tutorials')).resolves.toStrictEqual([
          {
            id: 'tutorialId',
            title: 'mon titre',
            format: Tutorial.FORMATS.PDF,
            duration: '12:01:02',
            source: 'Mon grenier',
            link: 'https://coucou.com',
            locale: 'fr',
            license: Tutorial.LICENSES.C,
            level: Tutorial.LEVELS.TWO,
            crush: true,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(knex('tutorials-tutorial_tags').select().orderBy('tutorialTagId')).resolves.toStrictEqual([
          {
            tutorialId: 'tutorialId',
            tutorialTagId: 'tagId1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            tutorialId: 'tutorialId',
            tutorialTagId: 'tagId2',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);
      });
    });
  });

  describe('GET /api/tutorials', async () => {
    let airtableSearchTutorialByTitleScope,
      airtableSearchTutorialByTagTitlesScope,
      airtableSearchTutorialBySourceScope,
      airtableGetManyTutorialsScope;

    context('when query param is not in the right format', function () {
      it('should respond with status 400', async function () {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tutorials?filter[title]=jenepeuxpas&filter[tagTitles][]=mettre&filter[tagTitles][]=lesdeuxfiltres',
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    context('success', function () {
      context('when searching by tutorial title', function () {
        it('should respond with status 200 and relevant tutorials, limited by 100 tutorials and sorted by title', async () => {
          // given
          const tutorials = [
            {
              id: 'tutorialId1',
              airtableId: 'tutorialAirtableId1',
              title: 'mon titre 1',
              format: Tutorial.FORMATS.PDF,
              duration: '12:01:02',
              source: 'Mon grenier 1',
              link: 'https://coucou1.com',
              locale: 'fr',
              license: Tutorial.LICENSES.C,
              level: Tutorial.LEVELS.ONE,
              crush: true,
              tagAirtableIds: ['tagAirtableId1'],
              tagIds: ['tagId1'],
            },
            {
              id: 'tutorialId2',
              airtableId: 'tutorialAirtableId2',
              title: 'mon titre 2',
              format: Tutorial.FORMATS.FRISE,
              duration: '12:50:50',
              source: 'Mon grenier 2',
              link: 'https://coucou2.com',
              locale: 'es',
              license: Tutorial.LICENSES.CCBYSA,
              level: Tutorial.LEVELS.TWO,
              crush: false,
              tagIds: [],
            },
          ];

          databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'tag 1' });
          tutorials.forEach(databaseBuilder.factory.buildTutorial);
          await databaseBuilder.commit();

          const airtableTutorials = tutorials.map(airtableBuilder.factory.buildTutorial);
          airtableSearchTutorialByTitleScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Tutoriels')
            .query({
              filterByFormula: 'FIND("mon ti", LOWER(Titre))',
              fields: { '': tutorialDatasource.usedFields },
              sort: [{ field: 'Titre', direction: 'asc' }],
              maxRecords: 100,
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, {
              records: airtableTutorials,
            });
          const server = await createServer();

          // when
          const response = await server.inject({
            method: 'GET',
            url: '/api/tutorials?filter[title]=Mon ti',
            headers: generateAuthorizationHeader(readonlyUser),
          });

          // then
          expect(response.statusCode).toBe(200);
          expect(response.result).toEqual({
            data: [
              {
                type: 'tutorials',
                id: 'tutorialAirtableId1',
                attributes: {
                  title: 'mon titre 1',
                  duration: '12:01:02',
                  source: 'Mon grenier 1',
                  format: Tutorial.FORMATS.PDF,
                  link: 'https://coucou1.com',
                  license: Tutorial.LICENSES.C,
                  level: Tutorial.LEVELS.ONE,
                  crush: true,
                  language: 'fr',
                  'pix-id': 'tutorialId1',
                },
                relationships: {
                  tags: {
                    data: [
                      {
                        type: 'tags',
                        id: 'tagAirtableId1',
                      },
                    ],
                  },
                },
              },
              {
                type: 'tutorials',
                id: 'tutorialAirtableId2',
                attributes: {
                  title: 'mon titre 2',
                  duration: '12:50:50',
                  source: 'Mon grenier 2',
                  format: Tutorial.FORMATS.FRISE,
                  link: 'https://coucou2.com',
                  license: Tutorial.LICENSES.CCBYSA,
                  level: Tutorial.LEVELS.TWO,
                  crush: false,
                  language: 'es',
                  'pix-id': 'tutorialId2',
                },
                relationships: {
                  tags: {
                    data: [],
                  },
                },
              },
            ],
          });
          expect(airtableSearchTutorialByTitleScope.isDone()).toBe(true);
        });
      });

      context('when searching by tutorial source', function () {
        it('should respond with status 200 and relevant tutorials, limited by 4 tutorials and sorted by title', async () => {
          // given
          const tutorials = [
            {
              id: 'tutorialId1',
              airtableId: 'tutorialAirtableId1',
              title: 'mon titre 1',
              format: Tutorial.FORMATS.PDF,
              duration: '12:01:02',
              source: 'Mon grenier 1',
              link: 'https://coucou1.com',
              locale: 'fr',
              license: Tutorial.LICENSES.C,
              level: Tutorial.LEVELS.ONE,
              crush: true,
              tagAirtableIds: ['tagAirtableId1'],
              tagIds: ['tagId1'],
            },
            {
              id: 'tutorialId2',
              airtableId: 'tutorialAirtableId2',
              title: 'mon titre 2',
              format: Tutorial.FORMATS.FRISE,
              duration: '12:50:50',
              source: 'Mon grenier 2',
              link: 'https://coucou2.com',
              locale: 'es',
              license: Tutorial.LICENSES.CCBYSA,
              level: Tutorial.LEVELS.TWO,
              crush: false,
              tagAirtableIds: [],
              tagIds: [],
            },
          ];

          databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'tag 1' });
          tutorials.forEach(databaseBuilder.factory.buildTutorial);
          await databaseBuilder.commit();

          const airtableTutorials = tutorials.map(airtableBuilder.factory.buildTutorial);
          airtableSearchTutorialBySourceScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Tutoriels')
            .query({
              filterByFormula: 'FIND("mon gren", LOWER(Source))',
              fields: { '': tutorialDatasource.usedFields },
              sort: [{ field: 'Titre', direction: 'asc' }],
              maxRecords: 4,
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, {
              records: airtableTutorials,
            });
          const server = await createServer();

          // when
          const response = await server.inject({
            method: 'GET',
            url: '/api/tutorials?filter[source]=Mon Gren',
            headers: generateAuthorizationHeader(readonlyUser),
          });

          // then
          expect(response.statusCode).toBe(200);
          expect(response.result).toEqual({
            data: [
              {
                type: 'tutorials',
                id: 'tutorialAirtableId1',
                attributes: {
                  title: 'mon titre 1',
                  duration: '12:01:02',
                  source: 'Mon grenier 1',
                  format: Tutorial.FORMATS.PDF,
                  link: 'https://coucou1.com',
                  license: Tutorial.LICENSES.C,
                  level: Tutorial.LEVELS.ONE,
                  crush: true,
                  language: 'fr',
                  'pix-id': 'tutorialId1',
                },
                relationships: {
                  tags: {
                    data: [
                      {
                        type: 'tags',
                        id: 'tagAirtableId1',
                      },
                    ],
                  },
                },
              },
              {
                type: 'tutorials',
                id: 'tutorialAirtableId2',
                attributes: {
                  title: 'mon titre 2',
                  duration: '12:50:50',
                  source: 'Mon grenier 2',
                  format: Tutorial.FORMATS.FRISE,
                  link: 'https://coucou2.com',
                  license: Tutorial.LICENSES.CCBYSA,
                  level: Tutorial.LEVELS.TWO,
                  crush: false,
                  language: 'es',
                  'pix-id': 'tutorialId2',
                },
                relationships: {
                  tags: {
                    data: [],
                  },
                },
              },
            ],
          });
          expect(airtableSearchTutorialBySourceScope.isDone()).toBe(true);
        });
      });

      context('when searching by tag titles', function () {
        it('should respond with status 200 and relevant tutorials, limited by 100 tutorials and sorted by title', async () => {
          // given
          const tutorials = [
            {
              id: 'tutorialId1',
              airtableId: 'tutorialAirtableId1',
              title: 'mon titre 1',
              format: Tutorial.FORMATS.PDF,
              duration: '12:01:02',
              source: 'Mon grenier 1',
              link: 'https://coucou1.com',
              locale: 'fr',
              license: Tutorial.LICENSES.C,
              level: Tutorial.LEVELS.ONE,
              crush: true,
              tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
              tagIds: ['tagId1', 'tagId2'],
            },
            {
              id: 'tutorialId2',
              airtableId: 'tutorialAirtableId2',
              title: 'mon titre 2',
              format: Tutorial.FORMATS.FRISE,
              duration: '12:50:50',
              source: 'Mon grenier 2',
              link: 'https://coucou2.com',
              locale: 'es',
              license: Tutorial.LICENSES.CCBYSA,
              level: Tutorial.LEVELS.TWO,
              crush: false,
              tagAirtableIds: ['tagAirtableId1', 'tagAirtableId3'],
              tagIds: ['tagId1', 'tagId3'],
            },
          ];

          databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'AWESOME YOUTUBE VIDEO' });
          databaseBuilder.factory.buildTag({ id: 'tagId2', title: 'yearlymotion' });
          databaseBuilder.factory.buildTag({ id: 'tagId3', title: 'monthlymotion' });
          tutorials.forEach(databaseBuilder.factory.buildTutorial);
          await databaseBuilder.commit();

          const airtableTutorials = tutorials.map(airtableBuilder.factory.buildTutorial);
          airtableSearchTutorialByTagTitlesScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Tutoriels')
            .query({
              filterByFormula: 'AND(FIND("lymotio", LOWER(Tags)),FIND("youtu", LOWER(Tags)))',
              fields: { '': tutorialDatasource.usedFields },
              sort: [{ field: 'Titre', direction: 'asc' }],
              maxRecords: 100,
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, {
              records: airtableTutorials,
            });
          const server = await createServer();

          // when
          const response = await server.inject({
            method: 'GET',
            url: '/api/tutorials?filter[tagTitles][]=lYmoTio&filter[tagTitles][]=youTu',
            headers: generateAuthorizationHeader(readonlyUser),
          });

          // then
          expect(response.statusCode).toBe(200);
          expect(response.result).toEqual({
            data: [
              {
                type: 'tutorials',
                id: 'tutorialAirtableId1',
                attributes: {
                  title: 'mon titre 1',
                  duration: '12:01:02',
                  source: 'Mon grenier 1',
                  format: Tutorial.FORMATS.PDF,
                  link: 'https://coucou1.com',
                  license: Tutorial.LICENSES.C,
                  level: Tutorial.LEVELS.ONE,
                  crush: true,
                  language: 'fr',
                  'pix-id': 'tutorialId1',
                },
                relationships: {
                  tags: {
                    data: [
                      {
                        type: 'tags',
                        id: 'tagAirtableId1',
                      },
                      {
                        type: 'tags',
                        id: 'tagAirtableId2',
                      },
                    ],
                  },
                },
              },
              {
                type: 'tutorials',
                id: 'tutorialAirtableId2',
                attributes: {
                  title: 'mon titre 2',
                  duration: '12:50:50',
                  source: 'Mon grenier 2',
                  format: Tutorial.FORMATS.FRISE,
                  link: 'https://coucou2.com',
                  license: Tutorial.LICENSES.CCBYSA,
                  level: Tutorial.LEVELS.TWO,
                  crush: false,
                  language: 'es',
                  'pix-id': 'tutorialId2',
                },
                relationships: {
                  tags: {
                    data: [
                      {
                        type: 'tags',
                        id: 'tagAirtableId1',
                      },
                      {
                        type: 'tags',
                        id: 'tagAirtableId3',
                      },
                    ],
                  },
                },
              },
            ],
          });
          expect(airtableSearchTutorialByTagTitlesScope.isDone()).toBe(true);
        });
      });

      context('when searching by ids', function () {
        it('should respond with status 200 and relevant tutorials', async () => {
          // given
          const tutorials = [
            {
              id: 'tutorialId1',
              airtableId: 'tutorialAirtableId1',
              title: 'mon titre 1',
              format: Tutorial.FORMATS.PDF,
              duration: '12:01:02',
              source: 'Mon grenier 1',
              link: 'https://coucou1.com',
              locale: 'fr',
              license: Tutorial.LICENSES.C,
              level: Tutorial.LEVELS.ONE,
              crush: true,
              tagAirtableIds: ['tagAirtableId1', 'tagAirtableId2'],
              tagIds: ['tagId1', 'tagId2'],
            },
            {
              id: 'tutorialId2',
              airtableId: 'tutorialAirtableId2',
              title: 'mon titre 2',
              format: Tutorial.FORMATS.FRISE,
              duration: '12:50:50',
              source: 'Mon grenier 2',
              link: 'https://coucou2.com',
              locale: 'es',
              license: Tutorial.LICENSES.CCBYSA,
              level: Tutorial.LEVELS.TWO,
              crush: false,
              tagAirtableIds: ['tagAirtableId1', 'tagAirtableId3'],
              tagIds: ['tagId1', 'tagId3'],
            },
          ];

          databaseBuilder.factory.buildTag({ id: 'tagId1', title: 'tag 1' });
          databaseBuilder.factory.buildTag({ id: 'tagId2', title: 'tag 2' });
          databaseBuilder.factory.buildTag({ id: 'tagId3', title: 'tag 3' });
          tutorials.forEach(databaseBuilder.factory.buildTutorial);
          await databaseBuilder.commit();

          const airtableTutorials = tutorials.map(airtableBuilder.factory.buildTutorial);
          airtableGetManyTutorialsScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Tutoriels')
            .query({
              filterByFormula: 'OR(RECORD_ID() = "tutorialId1", RECORD_ID() = "tutorialId2")',
              fields: { '': tutorialDatasource.usedFields },
              sort: [{ field: tutorialDatasource.sortField, direction: 'asc' }],
            })
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, {
              records: airtableTutorials,
            });
          const server = await createServer();

          // when
          const response = await server.inject({
            method: 'GET',
            url: '/api/tutorials?filter[ids][]=tutorialId1&filter[ids][]=tutorialId2',
            headers: generateAuthorizationHeader(readonlyUser),
          });

          // then
          expect(response.statusCode).toBe(200);
          expect(response.result).toEqual({
            data: [
              {
                type: 'tutorials',
                id: 'tutorialAirtableId1',
                attributes: {
                  title: 'mon titre 1',
                  duration: '12:01:02',
                  source: 'Mon grenier 1',
                  format: Tutorial.FORMATS.PDF,
                  link: 'https://coucou1.com',
                  license: Tutorial.LICENSES.C,
                  level: Tutorial.LEVELS.ONE,
                  crush: true,
                  language: 'fr',
                  'pix-id': 'tutorialId1',
                },
                relationships: {
                  tags: {
                    data: [
                      {
                        type: 'tags',
                        id: 'tagAirtableId1',
                      },
                      {
                        type: 'tags',
                        id: 'tagAirtableId2',
                      },
                    ],
                  },
                },
              },
              {
                type: 'tutorials',
                id: 'tutorialAirtableId2',
                attributes: {
                  title: 'mon titre 2',
                  duration: '12:50:50',
                  source: 'Mon grenier 2',
                  format: Tutorial.FORMATS.FRISE,
                  link: 'https://coucou2.com',
                  license: Tutorial.LICENSES.CCBYSA,
                  level: Tutorial.LEVELS.TWO,
                  crush: false,
                  language: 'es',
                  'pix-id': 'tutorialId2',
                },
                relationships: {
                  tags: {
                    data: [
                      {
                        type: 'tags',
                        id: 'tagAirtableId1',
                      },
                      {
                        type: 'tags',
                        id: 'tagAirtableId3',
                      },
                    ],
                  },
                },
              },
            ],
          });
          expect(airtableGetManyTutorialsScope.isDone()).toBe(true);
        });
      });
    });
  });
});
