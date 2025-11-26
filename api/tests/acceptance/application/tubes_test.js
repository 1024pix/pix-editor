import { beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import * as idGenerator from '../../../lib/infrastructure/utils/id-generator.js';

describe('Application | Route | Tubes', () => {
  let editorUser, readonlyUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    readonlyUser = databaseBuilder.factory.buildReadonlyUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/tubes/{tubeAirtableId}', () => {
    describe('when provided id has not the right format', function() {
      it('should respond with a status 400', async function() {
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes/zouloulou',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when tube does not exist', function() {
      it('should respond with a status 404', async function() {
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes/tube1',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    it('should respond with status 200 and tube data', async () => {
      // given
      const tube = {
        id: 'tube1',
        name: '@test',
        index: 1,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillAirtableIds: ['skill1', 'skill2'],
        skillIds: ['skill1', 'skill2'],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: tube.competenceId, index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: tube.thematicId, competenceId: tube.competenceId });
      databaseBuilder.factory.buildTube(tube);
      tube.skillIds.forEach((id) => databaseBuilder.factory.buildSkill({ id, tubeId: tube.id }));

      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalTitle',
        locale: 'fr',
        value: 'Titre du tube',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalTitle',
        locale: 'en',
        value: 'Tube’s title',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalDescription',
        locale: 'fr',
        value: 'Description du tube',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalDescription',
        locale: 'en',
        value: 'Tube’s description',
      });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/tubes/tube1',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({
        data: {
          type: 'tubes',
          id: 'tube1',
          attributes: {
            'pix-id': 'tube1',
            name: '@test',
            index: 1,
            'practical-title-fr': 'Titre du tube',
            'practical-title-en': 'Tube’s title',
            'practical-description-fr': 'Description du tube',
            'practical-description-en': 'Tube’s description',
          },
          relationships: {
            competence: {
              data: {
                id: 'competence1',
                type: 'competences',
              },
            },
            theme: {
              data: {
                id: 'thematic1',
                type: 'themes',
              },
            },
            'raw-skills': {
              data: [
                {
                  id: 'skill1',
                  type: 'skills',
                },
                {
                  id: 'skill2',
                  type: 'skills',
                },
              ],
            },
          },
        },
      });
    });
  });

  describe('GET /api/tubes', () => {
    describe('when using no filters', () => {
      it('should respond with status 200 and tubes data', async () => {
        // given
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@test', index: 1, thematicId: 'thematic1' });
        databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
        databaseBuilder.factory.buildSkill({ id: 'skill2', tubeId: 'tube1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.2', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic2', competenceId: 'competence2' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@pouet', index: 2, thematicId: 'thematic2' });
        databaseBuilder.factory.buildSkill({ id: 'skill3', tubeId: 'tube2' });
        databaseBuilder.factory.buildSkill({ id: 'skill4', tubeId: 'tube2' });

        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalTitle',
          locale: 'fr',
          value: 'Titre premier tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalTitle',
          locale: 'en',
          value: 'First tube’s title',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalDescription',
          locale: 'fr',
          value: 'Description premier tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalDescription',
          locale: 'en',
          value: 'First tube’s description',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalTitle',
          locale: 'fr',
          value: 'Titre deuxième tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalTitle',
          locale: 'en',
          value: 'Second tube’s title',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalDescription',
          locale: 'fr',
          value: 'Description deuxième tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalDescription',
          locale: 'en',
          value: 'Second tube’s description',
        });

        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'tubes',
              id: 'tube1',
              attributes: {
                'pix-id': 'tube1',
                name: '@test',
                'practical-title-fr': 'Titre premier tube',
                'practical-title-en': 'First tube’s title',
                'practical-description-fr': 'Description premier tube',
                'practical-description-en': 'First tube’s description',
                index: 1,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence1',
                    type: 'competences',
                  },
                },
                theme: {
                  data: {
                    id: 'thematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'skill1',
                      type: 'skills',
                    },
                    {
                      id: 'skill2',
                      type: 'skills',
                    },
                  ],
                },
              },
            },
            {
              type: 'tubes',
              id: 'tube2',
              attributes: {
                'pix-id': 'tube2',
                name: '@pouet',
                'practical-title-fr': 'Titre deuxième tube',
                'practical-title-en': 'Second tube’s title',
                'practical-description-fr': 'Description deuxième tube',
                'practical-description-en': 'Second tube’s description',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence2',
                    type: 'competences',
                  },
                },
                theme: {
                  data: {
                    id: 'thematic2',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'skill3',
                      type: 'skills',
                    },
                    {
                      id: 'skill4',
                      type: 'skills',
                    },
                  ],
                },
              },
            },
          ],
        });
      });
    });

    describe('when filtering by ids', () => {
      it('should respond with status 200 and tubes data', async () => {
        // given
        const tubes = [
          {
            id: 'tube1',
            name: '@test',
            index: 1,
            competenceId: 'competence1',
            thematicId: 'thematic1',
            skillAirtableIds: ['skill1', 'skill2'],
            skillIds: ['skill1', 'skill2'],
          },
          {
            id: 'tube2',
            name: '@pouet',
            index: 2,
            competenceId: 'competence2',
            thematicId: 'thematic2',
            skillAirtableIds: ['skill3', 'skill4'],
            skillIds: ['skill3', 'skill4'],
          },
        ];

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.2', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic2', competenceId: 'competence2' });
        tubes.forEach((tube) => {
          databaseBuilder.factory.buildTube(tube);
          tube.skillIds.forEach((id) => databaseBuilder.factory.buildSkill({ id, tubeId: tube.id }));
        });

        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalTitle',
          locale: 'fr',
          value: 'Titre premier tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalTitle',
          locale: 'en',
          value: 'First tube’s title',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalDescription',
          locale: 'fr',
          value: 'Description premier tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalDescription',
          locale: 'en',
          value: 'First tube’s description',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalTitle',
          locale: 'fr',
          value: 'Titre deuxième tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalTitle',
          locale: 'en',
          value: 'Second tube’s title',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalDescription',
          locale: 'fr',
          value: 'Description deuxième tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube2.practicalDescription',
          locale: 'en',
          value: 'Second tube’s description',
        });

        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/tubes?filter[ids][]=tube1&filter[ids][]=tube2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'tubes',
              id: 'tube1',
              attributes: {
                'pix-id': 'tube1',
                name: '@test',
                'practical-title-fr': 'Titre premier tube',
                'practical-title-en': 'First tube’s title',
                'practical-description-fr': 'Description premier tube',
                'practical-description-en': 'First tube’s description',
                index: 1,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence1',
                    type: 'competences',
                  },
                },
                theme: {
                  data: {
                    id: 'thematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'skill1',
                      type: 'skills',
                    },
                    {
                      id: 'skill2',
                      type: 'skills',
                    },
                  ],
                },
              },
            },
            {
              type: 'tubes',
              id: 'tube2',
              attributes: {
                'pix-id': 'tube2',
                name: '@pouet',
                'practical-title-fr': 'Titre deuxième tube',
                'practical-title-en': 'Second tube’s title',
                'practical-description-fr': 'Description deuxième tube',
                'practical-description-en': 'Second tube’s description',
                index: 2,
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence2',
                    type: 'competences',
                  },
                },
                theme: {
                  data: {
                    id: 'thematic2',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'skill3',
                      type: 'skills',
                    },
                    {
                      id: 'skill4',
                      type: 'skills',
                    },
                  ],
                },
              },
            },
          ],
        });
      });
    });
  });

  describe('POST /api/tubes', async () => {
    describe('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tubes',
          payload: {
            data: {
              type: 'tubes',
              attributes: {
                name: '@test',
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence1',
                    type: 'competences',
                  },
                },
                theme: {
                  data: {
                    id: 'thematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': { data: [] },
              },
            },
          },
          headers: generateAuthorizationHeader(readonlyUser),
        });

        // then
        expect(response.statusCode).toBe(403);
      });
    });

    describe('when payload is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tubes',
          payload: {
            data: {
              type: 'sujets',
              attributes: {
                name: '@test',
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                competence: { data: null },
                theme: {
                  data: {
                    id: 'thematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': { data: [] },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('success', function() {
      beforeEach(async () => {
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'fmk1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', index: 0, thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', index: 1, thematicId: 'thematic1' });
        await databaseBuilder.commit();

        vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('tube3');
      });

      it('should respond with status 201 and created thematic', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/tubes',
          payload: {
            data: {
              type: 'tubes',
              attributes: {
                name: '@pouic',
                'practical-title-fr': 'Titre troisième tube',
                'practical-title-en': 'Third tube’s title',
                'practical-description-fr': 'Description troisième tube',
                'practical-description-en': 'Third tube’s description',
              },
              relationships: {
                competence: { data: null },
                theme: {
                  data: {
                    type: 'themes',
                    id: 'thematic1',
                  },
                },
                'raw-skills': { data: [] },
              },
            },
          },
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(201);
        expect(response.result).toEqual({
          data: {
            type: 'tubes',
            id: 'tube3',
            attributes: {
              'pix-id': 'tube3',
              name: '@pouic',
              'practical-title-fr': 'Titre troisième tube',
              'practical-title-en': 'Third tube’s title',
              'practical-description-fr': 'Description troisième tube',
              'practical-description-en': 'Third tube’s description',
              index: 2,
            },
            relationships: {
              competence: {
                data: {
                  id: 'competence1',
                  type: 'competences',
                },
              },
              theme: {
                data: {
                  type: 'themes',
                  id: 'thematic1',
                },
              },
              'raw-skills': { data: [] },
            },
          },
        });

        await expect(knex.select('*').from('tubes').orderBy('id')).resolves.toStrictEqual([
          {
            id: 'tube1',
            name: '@foo',
            index: 0,
            thematicId: 'thematic1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            id: 'tube2',
            name: '@bar',
            index: 1,
            thematicId: 'thematic1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            id: 'tube3',
            name: '@pouic',
            index: 2,
            thematicId: 'thematic1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(
          knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
        ).resolves.toStrictEqual([
          { key: 'tube.tube3.practicalDescription', locale: 'en', value: 'Third tube’s description' },
          { key: 'tube.tube3.practicalDescription', locale: 'fr', value: 'Description troisième tube' },
          { key: 'tube.tube3.practicalTitle', locale: 'en', value: 'Third tube’s title' },
          { key: 'tube.tube3.practicalTitle', locale: 'fr', value: 'Titre troisième tube' },
        ]);
      });
    });
  });

  describe('PATCH /api/tubes/{tubeAirtableId}', async () => {
    describe('when user has not the right to do the operation', function() {
      it('should respond with status 403', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tubes/tube1',
          payload: {
            data: {
              type: 'tubes',
              id: 'tube1',
              attributes: {
                name: '@test',
                index: 2,
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence1',
                    type: 'competences',
                  },
                },
                theme: {
                  data: {
                    id: 'thematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'skill1',
                      type: 'skills',
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

    describe('when the payload is not formatted correctly', function() {
      it('should respond with status 400', async function() {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tubes/tube1',
          payload: {
            data: {
              type: 'sujets',
              id: 'tube1',
              attributes: {
                name: '@test',
                index: 2,
                'practical-title-fr': 'Titre du tube',
                'practical-title-en': 'Tube’s title',
                'practical-description-fr': 'Description du tube',
                'practical-description-en': 'Tube’s description',
              },
              relationships: {
                competence: {
                  data: {
                    id: 'competence1',
                    type: 'competences',
                  },
                },
                theme: {
                  data: {
                    id: 'thematic1',
                    type: 'themes',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      id: 'skill1',
                      type: 'skills',
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

    describe('success', function() {
      beforeEach(async () => {
        const tube = {
          id: 'tube1',
          name: '@test',
          index: 1,
          competenceId: 'competence0',
          thematicId: 'thematic0',
          skillAirtableIds: ['skill1', 'skill2'],
          skillIds: ['skill1', 'skill2'],
        };

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence0', index: '1.0', areaId: 'area1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic0', index: 0, competenceId: 'competence0' });
        databaseBuilder.factory.buildTube(tube);
        tube.skillIds.forEach((id) => databaseBuilder.factory.buildSkill({ id, tubeId: tube.id }));
        await databaseBuilder.commit();

        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalTitle',
          locale: 'fr',
          value: 'Titre du tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalTitle',
          locale: 'en',
          value: 'Tube’s title',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalDescription',
          locale: 'fr',
          value: 'Description du tube',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'tube.tube1.practicalDescription',
          locale: 'en',
          value: 'Tube’s description',
        });

        databaseBuilder.factory.buildTranslation({
          key: 'thematic.thematic1.name',
          locale: 'fr',
          value: 'Nom de la thématique',
        });

        await databaseBuilder.commit();
      });

      it('should respond with status 200 and updated tube', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/tubes/tube1',
          payload: {
            data: {
              type: 'tubes',
              id: 'tube1',
              attributes: {
                'pix-id': 'tube1',
                name: '@pouet',
                index: 2,
                'practical-title-fr': 'Titre tube après',
                'practical-title-en': 'Tube’s title after',
                'practical-description-fr': 'Description tube après',
                'practical-description-en': 'Tube’s description after',
              },
              relationships: {
                theme: {
                  data: {
                    type: 'themes',
                    id: 'thematic1',
                  },
                },
                'raw-skills': {
                  data: [
                    {
                      type: 'skills',
                      id: 'skill1',
                    },
                    {
                      type: 'skills',
                      id: 'skill2',
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
            type: 'tubes',
            id: 'tube1',
            attributes: {
              'pix-id': 'tube1',
              name: '@pouet',
              index: 2,
              'practical-title-fr': 'Titre tube après',
              'practical-title-en': 'Tube’s title after',
              'practical-description-fr': 'Description tube après',
              'practical-description-en': 'Tube’s description after',
            },
            relationships: {
              competence: {
                data: {
                  type: 'competences',
                  id: 'competence1',
                },
              },
              theme: {
                data: {
                  type: 'themes',
                  id: 'thematic1',
                },
              },
              'raw-skills': {
                data: [
                  {
                    type: 'skills',
                    id: 'skill1',
                  },
                  {
                    type: 'skills',
                    id: 'skill2',
                  },
                ],
              },
            },
          },
        });

        await expect(knex.select('*').from('tubes')).resolves.toStrictEqual([
          {
            id: 'tube1',
            name: '@pouet',
            index: 2,
            thematicId: 'thematic1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(
          knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
        ).resolves.toStrictEqual([
          { key: 'thematic.thematic1.name', locale: 'fr', value: 'Nom de la thématique' },
          { key: 'tube.tube1.practicalDescription', locale: 'en', value: 'Tube’s description after' },
          { key: 'tube.tube1.practicalDescription', locale: 'fr', value: 'Description tube après' },
          { key: 'tube.tube1.practicalTitle', locale: 'en', value: 'Tube’s title after' },
          { key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'Titre tube après' },
        ]);
      });
    });
  });
});
