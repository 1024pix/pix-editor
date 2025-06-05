import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';
import { Tutorial } from '../../../lib/domain/models/index.js';
import { tutorialDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import * as config from '../../../lib/config.js';

describe('Application | Route | Tutorials', () => {
  let editorUser, readonlyUser, originalPixApiUrlValue;

  beforeEach(async function() {
    originalPixApiUrlValue = config.pixApi.baseUrl;
    delete config.pixApi.baseUrl;
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('POST /api/tutorials', async () => {
    let airtableCreateTutorialScope;

    context('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
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
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': true,
                'language': 'fr',
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

    context('when payload is not formatted correctly', function() {
      it('should respond with status 400', async function() {
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
                'title': 'mon titre',
                'duration': '99:99:99',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': true,
                'language': 'fr',
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

    context('success', function() {
      it('should respond with status 201 and created tutorial', async () => {
        // given
        const generateNewId = vi.spyOn(idGenerator, 'generateNewId');
        generateNewId.mockReturnValue('tutorialId1');
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
        });
        airtableCreateTutorialScope = nock('https://api.airtable.com')
          .post('/v0/airtableBaseValue/Tutoriels/', {
            records: [{
              fields: {
                'id persistant': 'tutorialId1',
                'Durée': '12:01:02',
                'Format': Tutorial.FORMATS.PDF,
                'Lien': 'https://coucou.com',
                'Source': 'Mon grenier',
                'Titre': 'mon titre',
                'Langue': 'fr',
                'License': Tutorial.LICENSES.C,
                'niveau': Tutorial.LEVELS.TWO,
                'CoupDeCoeur': 'YES',
                'Tags': ['tagAirtableId1', 'tagAirtableId2'],
              },
            }],
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
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': true,
                'language': 'fr',
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
              'title': 'mon titre',
              'duration': '12:01:02',
              'source': 'Mon grenier',
              'format': Tutorial.FORMATS.PDF,
              'link': 'https://coucou.com',
              'license': Tutorial.LICENSES.C,
              'level': Tutorial.LEVELS.TWO,
              'crush': true,
              'language': 'fr',
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
      });
    });
  });

  describe('GET /api/tutorials/{tutorialAirtableId}', async () => {
    let airtableGetTutorialScope;

    context('when param is not in the right format', function() {
      it('should respond with status 400', async function() {
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

    context('when tutorial does not exist', function() {
      it('should respond with status 404', async function() {
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

    context('success', function() {
      it('should respond with status 200 and tutorial', async () => {
        // given
        const airtableTutorial = airtableBuilder.factory.buildTutorial({
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
        });
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
              'title': 'mon titre',
              'duration': '12:01:02',
              'source': 'Mon grenier',
              'format': Tutorial.FORMATS.PDF,
              'link': 'https://coucou.com',
              'license': Tutorial.LICENSES.C,
              'level': Tutorial.LEVELS.TWO,
              'crush': true,
              'language': 'fr',
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

  describe('PUT /api/tutorials/{tutorialAirtableId}', async () => {
    let airtableGetTutorialScope, airtableUpdateTutorialScope;

    context('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PUT',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': true,
                'language': 'fr',
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

    context('when payload is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PUT',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'yo les zamis',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': true,
                'language': 'fr',
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

    context('when tutorial does not exist', function() {
      it('should respond with status 404', async function() {
        // given
        const server = await createServer();
        airtableGetTutorialScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tutoriels/tutorialAirtableId')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        // when
        const response = await server.inject({
          method: 'PUT',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': true,
                'language': 'fr',
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

    context('success', function() {
      it('should respond with status 200 and updated tutorial', async () => {
        // given
        const originalAirtableTutorial = airtableBuilder.factory.buildTutorial({
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
          tagAirtableIds: ['tagAirtableId3'],
        });
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
        });
        airtableUpdateTutorialScope = nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/Tutoriels/', {
            records: [{
              fields: {
                'id persistant': 'tutorialId',
                'Durée': '12:01:02',
                'Format': Tutorial.FORMATS.PDF,
                'Lien': 'https://coucou.com',
                'Source': 'Mon grenier',
                'Titre': 'mon titre',
                'Langue': 'fr',
                'License': Tutorial.LICENSES.C,
                'niveau': Tutorial.LEVELS.TWO,
                'CoupDeCoeur': 'YES',
                'Tags': ['tagAirtableId1', 'tagAirtableId2'],
              },
              id: 'tutorialAirtableId',
            }],
          })
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [updatedAirtableTutorial] });
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PUT',
          url: '/api/tutorials/tutorialAirtableId',
          payload: {
            data: {
              type: 'tutorials',
              id: 'tutorialAirtableId',
              attributes: {
                'title': 'mon titre',
                'duration': '12:01:02',
                'source': 'Mon grenier',
                'format': Tutorial.FORMATS.PDF,
                'link': 'https://coucou.com',
                'license': Tutorial.LICENSES.C,
                'level': Tutorial.LEVELS.TWO,
                'crush': true,
                'language': 'fr',
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
              'title': 'mon titre',
              'duration': '12:01:02',
              'source': 'Mon grenier',
              'format': Tutorial.FORMATS.PDF,
              'link': 'https://coucou.com',
              'license': Tutorial.LICENSES.C,
              'level': Tutorial.LEVELS.TWO,
              'crush': true,
              'language': 'fr',
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
      });
    });
  });

  describe('GET /api/tutorials', async () => {
    let airtableSearchTutorialByTitleScope, airtableSearchTutorialByTagTitlesScope, airtableSearchTutorialBySourceScope;

    context('when query param is not in the right format', function() {
      it('should respond with status 400', async function() {
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

    context('success', function() {
      context('when searching by tutorial title', function() {
        it('should respond with status 200 and relevant tutorials, limited by 100 tutorials and sorted by title', async () => {
          // given
          const airtableTutorials = [
            airtableBuilder.factory.buildTutorial({
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
            }),
            airtableBuilder.factory.buildTutorial({
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
            }),
          ];
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
                  'title': 'mon titre 1',
                  'duration': '12:01:02',
                  'source': 'Mon grenier 1',
                  'format': Tutorial.FORMATS.PDF,
                  'link': 'https://coucou1.com',
                  'license': Tutorial.LICENSES.C,
                  'level': Tutorial.LEVELS.ONE,
                  'crush': true,
                  'language': 'fr',
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
                  'title': 'mon titre 2',
                  'duration': '12:50:50',
                  'source': 'Mon grenier 2',
                  'format': Tutorial.FORMATS.FRISE,
                  'link': 'https://coucou2.com',
                  'license': Tutorial.LICENSES.CCBYSA,
                  'level': Tutorial.LEVELS.TWO,
                  'crush': false,
                  'language': 'es',
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

      context('when searching by tutorial source', function() {
        it('should respond with status 200 and relevant tutorials, limited by 4 tutorials and sorted by title', async () => {
          // given
          const airtableTutorials = [
            airtableBuilder.factory.buildTutorial({
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
            }),
            airtableBuilder.factory.buildTutorial({
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
            }),
          ];
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
                  'title': 'mon titre 1',
                  'duration': '12:01:02',
                  'source': 'Mon grenier 1',
                  'format': Tutorial.FORMATS.PDF,
                  'link': 'https://coucou1.com',
                  'license': Tutorial.LICENSES.C,
                  'level': Tutorial.LEVELS.ONE,
                  'crush': true,
                  'language': 'fr',
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
                  'title': 'mon titre 2',
                  'duration': '12:50:50',
                  'source': 'Mon grenier 2',
                  'format': Tutorial.FORMATS.FRISE,
                  'link': 'https://coucou2.com',
                  'license': Tutorial.LICENSES.CCBYSA,
                  'level': Tutorial.LEVELS.TWO,
                  'crush': false,
                  'language': 'es',
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

      context('when searching by tag titles', function() {
        it('should respond with status 200 and relevant tutorials, limited by 100 tutorials and sorted by title', async () => {
          // given
          const airtableTutorials = [
            airtableBuilder.factory.buildTutorial({
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
            }),
            airtableBuilder.factory.buildTutorial({
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
            }),
          ];
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
                  'title': 'mon titre 1',
                  'duration': '12:01:02',
                  'source': 'Mon grenier 1',
                  'format': Tutorial.FORMATS.PDF,
                  'link': 'https://coucou1.com',
                  'license': Tutorial.LICENSES.C,
                  'level': Tutorial.LEVELS.ONE,
                  'crush': true,
                  'language': 'fr',
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
                  'title': 'mon titre 2',
                  'duration': '12:50:50',
                  'source': 'Mon grenier 2',
                  'format': Tutorial.FORMATS.FRISE,
                  'link': 'https://coucou2.com',
                  'license': Tutorial.LICENSES.CCBYSA,
                  'level': Tutorial.LEVELS.TWO,
                  'crush': false,
                  'language': 'es',
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
    });
  });
});
