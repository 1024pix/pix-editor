import { beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Acceptance | Route | competences', () => {
  let editorUser, adminUser;
  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    adminUser = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences', async () => {
    beforeEach(async () => {
      const competences = [
        {
          id: 'competence1',
          airtableId: 'competence1',
          index: '1.1',
          areaAirtableId: 'area1',
          areaId: 'area1',
          origin: 'Pix',
          thematicAirtableIds: ['thematic1', 'thematic2'],
          thematicIds: ['thematic1', 'thematic2'],
          tubeAirtableIds: [
            'tube1',
            'tube2',
            'tube3',
            'tube4',
            'tube5',
          ],
          tubeIds: [
            'tube1',
            'tube2',
            'tube3',
            'tube4',
            'tube5',
          ],
          skillAirtableIds: [],
          skillIds: [],
        },
        {
          id: 'competence11',
          airtableId: 'competence11',
          index: '1.1',
          areaAirtableId: 'area11',
          areaId: 'area11',
          origin: 'Pix Junior',
          thematicAirtableIds: ['thematic11', 'thematic12'],
          thematicIds: ['thematic11', 'thematic12'],
          tubeAirtableIds: [
            'tube11',
            'tube12',
            'tube13',
          ],
          tubeIds: [
            'tube11',
            'tube12',
            'tube13',
          ],
          skillAirtableIds: [],
          skillIds: [],
        },
        {
          id: 'competence2',
          airtableId: 'competence2',
          index: '1.2',
          areaAirtableId: 'area1',
          areaId: 'area1',
          origin: 'Pix',
          thematicAirtableIds: ['thematic3'],
          thematicIds: ['thematic3'],
          tubeAirtableIds: ['tube6', 'tube7'],
          tubeIds: ['tube6', 'tube7'],
          skillAirtableIds: [],
          skillIds: [],
        },
        {
          id: 'competence12',
          airtableId: 'competence12',
          index: '1.2',
          areaAirtableId: 'area11',
          areaId: 'area11',
          origin: 'Pix Junior',
          thematicAirtableIds: ['thematic13', 'thematic14'],
          thematicIds: ['thematic13', 'thematic14'],
          tubeAirtableIds: [
            'tube14',
            'tube15',
            'tube16',
            'tube17',
          ],
          tubeIds: [
            'tube14',
            'tube15',
            'tube16',
            'tube17',
          ],
          skillAirtableIds: [],
          skillIds: [],
        },
        {
          id: 'competence3',
          airtableId: 'competence3',
          index: '2.1',
          areaAirtableId: 'area2',
          areaId: 'area2',
          origin: 'Pix',
          thematicAirtableIds: ['thematic4', 'thematic5'],
          thematicIds: ['thematic4', 'thematic5'],
          tubeAirtableIds: ['tube8', 'tube9'],
          tubeIds: ['tube8', 'tube9'],
          skillAirtableIds: [],
          skillIds: [],
        },
      ];

      databaseBuilder.factory.buildFramework({ id: 'pix', name: 'Pix' });
      databaseBuilder.factory.buildFramework({ id: 'junior', name: 'Pix Junior' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'pix' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'pix' });
      databaseBuilder.factory.buildArea({ id: 'area11', code: '1', frameworkId: 'junior' });
      competences.forEach((competence) => {
        databaseBuilder.factory.buildCompetence(competence);
        competence.thematicIds.forEach((id) =>
          databaseBuilder.factory.buildThematic({ id, competenceId: competence.id }),
        );
        competence.tubeIds.forEach((id, index) =>
          databaseBuilder.factory.buildTube({
            id,
            name: `@${id}`,
            thematicId: competence.thematicIds[index % competence.thematicIds.length],
          }),
        );
      });

      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.name',
        locale: 'fr',
        value: 'Première compétence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.name',
        locale: 'en',
        value: 'First competence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.description',
        locale: 'fr',
        value: 'C’est la première',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.description',
        locale: 'en',
        value: 'It’s the first one',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence11.name',
        locale: 'fr',
        value: 'Première compétence junior',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence11.name',
        locale: 'en',
        value: 'First junior competence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence11.description',
        locale: 'fr',
        value: 'C’est la première pour les juniors',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence11.description',
        locale: 'en',
        value: 'It’s the first one for juniors',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.name',
        locale: 'fr',
        value: 'Deuxième compétence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.name',
        locale: 'en',
        value: 'Second competence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.description',
        locale: 'fr',
        value: 'C’est la deuxième',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.description',
        locale: 'en',
        value: 'It’s the second one',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence12.name',
        locale: 'fr',
        value: 'Deuxième compétence junior',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence12.name',
        locale: 'en',
        value: 'Second junior competence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence12.description',
        locale: 'fr',
        value: 'C’est la deuxième pour les juniors',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence12.description',
        locale: 'en',
        value: 'It’s the second one for juniors',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence3.name',
        locale: 'fr',
        value: 'Troisième compétence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence3.name',
        locale: 'en',
        value: 'Third competence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence3.description',
        locale: 'fr',
        value: 'C’est la troisième',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence3.description',
        locale: 'en',
        value: 'It’s the third one',
      });

      await databaseBuilder.commit();
    });

    it('should respond with status 200 and competences', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/competences',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: [
          {
            type: 'competences',
            id: 'competence1',
            attributes: {
              'pix-id': 'competence1',
              code: '1.1',
              title: 'Première compétence',
              'title-en': 'First competence',
              description: 'C’est la première',
              'description-en': 'It’s the first one',
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'area1',
                },
              },
              'raw-themes': { data: [{ id: 'thematic1', type: 'themes' }, { id: 'thematic2', type: 'themes' }] },
              'raw-tubes': {
                data: [
                  { id: 'tube1', type: 'tubes' },
                  { id: 'tube2', type: 'tubes' },
                  { id: 'tube3', type: 'tubes' },
                  { id: 'tube4', type: 'tubes' },
                  { id: 'tube5', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competence11',
            attributes: {
              'pix-id': 'competence11',
              code: '1.1',
              title: 'Première compétence junior',
              'title-en': 'First junior competence',
              description: 'C’est la première pour les juniors',
              'description-en': 'It’s the first one for juniors',
              source: 'Pix Junior',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'area11',
                },
              },
              'raw-themes': { data: [{ id: 'thematic11', type: 'themes' }, { id: 'thematic12', type: 'themes' }] },
              'raw-tubes': {
                data: [
                  { id: 'tube11', type: 'tubes' },
                  { id: 'tube12', type: 'tubes' },
                  { id: 'tube13', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competence2',
            attributes: {
              'pix-id': 'competence2',
              code: '1.2',
              title: 'Deuxième compétence',
              'title-en': 'Second competence',
              description: 'C’est la deuxième',
              'description-en': 'It’s the second one',
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'area1',
                },
              },
              'raw-themes': { data: [{ id: 'thematic3', type: 'themes' }] },
              'raw-tubes': { data: [{ id: 'tube6', type: 'tubes' }, { id: 'tube7', type: 'tubes' }] },
            },
          },
          {
            type: 'competences',
            id: 'competence12',
            attributes: {
              'pix-id': 'competence12',
              code: '1.2',
              title: 'Deuxième compétence junior',
              'title-en': 'Second junior competence',
              description: 'C’est la deuxième pour les juniors',
              'description-en': 'It’s the second one for juniors',
              source: 'Pix Junior',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'area11',
                },
              },
              'raw-themes': { data: [{ id: 'thematic13', type: 'themes' }, { id: 'thematic14', type: 'themes' }] },
              'raw-tubes': {
                data: [
                  { id: 'tube14', type: 'tubes' },
                  { id: 'tube15', type: 'tubes' },
                  { id: 'tube16', type: 'tubes' },
                  { id: 'tube17', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'competence3',
            attributes: {
              'pix-id': 'competence3',
              code: '2.1',
              title: 'Troisième compétence',
              'title-en': 'Third competence',
              description: 'C’est la troisième',
              'description-en': 'It’s the third one',
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'area2',
                },
              },
              'raw-themes': { data: [{ id: 'thematic4', type: 'themes' }, { id: 'thematic5', type: 'themes' }] },
              'raw-tubes': { data: [{ id: 'tube8', type: 'tubes' }, { id: 'tube9', type: 'tubes' }] },
            },
          },
        ],
      });
    });
  });

  describe('GET /competences/{competenceAirtableid}', async () => {
    let competence;

    beforeEach(async () => {
      competence = {
        id: 'competence2',
        airtableId: 'competence2',
        index: '1.2',
        areaId: 'area1',
        areaAirtableId: 'area1',
        origin: 'Pix',
        thematicAirtableIds: ['thematic3'],
        thematicIds: ['thematic3'],
        tubeAirtableIds: ['tube6', 'tube7'],
        tubeIds: ['tube6', 'tube7'],
        skillAirtableIds: [],
        skillIds: [],
      };

      databaseBuilder.factory.buildFramework({ id: 'pix', name: 'Pix' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'pix' });
      databaseBuilder.factory.buildCompetence(competence);
      competence.thematicIds.forEach((id) =>
        databaseBuilder.factory.buildThematic({ id, competenceId: competence.id }),
      );
      competence.tubeIds.forEach((id, index) =>
        databaseBuilder.factory.buildTube({
          id,
          name: `@${id}`,
          thematicId: competence.thematicIds[index % competence.thematicIds.length],
        }),
      );

      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.name',
        locale: 'fr',
        value: 'Deuxième compétence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.name',
        locale: 'en',
        value: 'Second competence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.description',
        locale: 'fr',
        value: 'C’est la deuxième',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.description',
        locale: 'en',
        value: 'It’s the second one',
      });

      await databaseBuilder.commit();
    });

    describe('when competence is unknown', () => {
      it('should respond with status 404', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/competences/competence404',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    it('should respond with status 200 and competence', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/competences/${competence.id}`,
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'competences',
          id: 'competence2',
          attributes: {
            'pix-id': 'competence2',
            code: '1.2',
            title: 'Deuxième compétence',
            'title-en': 'Second competence',
            description: 'C’est la deuxième',
            'description-en': 'It’s the second one',
            source: 'Pix',
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'area1',
              },
            },
            'raw-themes': { data: [{ id: 'thematic3', type: 'themes' }] },
            'raw-tubes': { data: [{ id: 'tube6', type: 'tubes' }, { id: 'tube7', type: 'tubes' }] },
          },
        },
      });
    });
  });

  describe('POST /competences', async () => {
    let generateNewId;
    let pixApiCompetenceCacheScope;
    let pixApiThematicCacheScope;
    // FIXME pixApiTubeCacheScope
    // FIXME pixApiSkillCacheScope

    beforeEach(async () => {
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Pix' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence3', index: '2.1', areaId: 'area2' });

      generateNewId = vi.spyOn(idGenerator, 'generateNewId');
      generateNewId.mockImplementation((prefix) => {
        switch (prefix) {
          case 'competence':
            return 'competence4';
          case 'thematic':
            return 'thematic1';
          case 'tube':
            return 'tube1';
          case 'skill':
            return 'skill1';
        }
      });

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: pixApiToken })
        .persist();

      pixApiCompetenceCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/competence4', {
          id: 'competence4',
          index: '2.2',
          areaId: 'area2',
          skillIds: [],
          thematicIds: ['thematic1'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Quatrième compétence',
            en: 'Fourth competence',
          },
          description_i18n: {
            fr: 'C’est la quatrième',
            en: 'It’s the fourth one',
          },
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);

      pixApiThematicCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/thematics/thematic1', {
          id: 'thematic1',
          name_i18n: {
            fr: 'workbench_2_2',
            en: null,
          },
          index: 0,
          competenceId: 'competence4',
          tubeIds: ['tube1'],
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);

      await databaseBuilder.commit();
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/competences',
          payload: {
            data: {
              type: 'competences',
              attributes: { title: 'Quatrième compétence' },
              relationships: { area: { data: null } },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/competences',
          payload: {
            data: {
              type: 'competences',
              attributes: { title: 'Quatrième compétence' },
              relationships: {
                area: {
                  data: {
                    type: 'areas',
                    id: 'area2',
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

    it('should respond with status 201 and created competence', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/competences',
        payload: {
          data: {
            type: 'competences',
            attributes: {
              title: 'Quatrième compétence',
              'title-en': 'Fourth competence',
              description: 'C’est la quatrième',
              'description-en': 'It’s the fourth one',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'area2',
                },
              },
            },
          },
        },
        headers: generateAuthorizationHeader(adminUser),
      });

      // then
      expect(response.statusCode).toBe(201);

      expect(response.result).toEqual({
        data: {
          type: 'competences',
          id: 'competence4',
          attributes: {
            'pix-id': 'competence4',
            code: '2.2',
            title: 'Quatrième compétence',
            'title-en': 'Fourth competence',
            description: 'C’est la quatrième',
            'description-en': 'It’s the fourth one',
            source: 'Pix',
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'area2',
              },
            },
            'raw-themes': { data: [{ id: 'thematic1', type: 'themes' }] },
            'raw-tubes': { data: [{ id: 'tube1', type: 'tubes' }] },
          },
        },
      });

      expect(generateNewId).toHaveBeenCalledWith('competence');
      expect(generateNewId).toHaveBeenCalledWith('thematic');
      expect(generateNewId).toHaveBeenCalledWith('tube');
      expect(generateNewId).toHaveBeenCalledWith('skill');

      await expect(knex.select('*').from('competences').orderBy('index')).resolves.toStrictEqual([{ id: 'competence3', index: '2.1', areaId: 'area2', createdAt: expect.any(Date), updatedAt: expect.any(Date) }, { id: 'competence4', index: '2.2', areaId: 'area2', createdAt: expect.any(Date), updatedAt: expect.any(Date) }]);

      await expect(knex.select('*').from('thematics')).resolves.toStrictEqual([
        {
          id: 'thematic1',
          index: 0,
          competenceId: 'competence4',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(knex.select('*').from('tubes')).resolves.toStrictEqual([
        {
          id: 'tube1',
          name: '@workbench',
          index: null,
          thematicId: 'thematic1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(knex.select('*').from('skills')).resolves.toStrictEqual([
        {
          id: 'skill1',
          description: "Acquis pour l'atelier de la compétence 2.2 Pix",
          descriptionStatus: null,
          hintStatus: null,
          internationalisation: null,
          level: null,
          status: null,
          version: null,
          tubeId: 'tube1',
          activatedAt: null,
          archivedAt: null,
          obsoletedAt: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([
        { key: 'competence.competence4.description', locale: 'en', value: 'It’s the fourth one' },
        { key: 'competence.competence4.description', locale: 'fr', value: 'C’est la quatrième' },
        { key: 'competence.competence4.name', locale: 'en', value: 'Fourth competence' },
        { key: 'competence.competence4.name', locale: 'fr', value: 'Quatrième compétence' },
        { key: 'thematic.thematic1.name', locale: 'fr', value: 'workbench_2_2' },
        { key: 'tube.tube1.practicalTitle', locale: 'fr', value: "Tube pour l'atelier de la compétence 2.2 Pix" },
      ]);

      expect(pixApiCompetenceCacheScope.isDone()).toBe(true);
      expect(pixApiThematicCacheScope.isDone()).toBe(true);
    });
  });

  describe('PATCH /competences/{id}', async () => {
    let pixApiCacheScope, competence;

    beforeEach(async () => {
      competence = {
        id: 'competence4',
        index: '2.2',
        areaId: 'area2',
        origin: 'Pix',
        thematicIds: ['thematic9'],
        tubeIds: ['tube8', 'tube9'],
        skillIds: [
          'skill7',
          'skill8',
          'skill9',
        ],
      };

      databaseBuilder.factory.buildFramework({ id: 'pix', name: 'Pix' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'pix' });
      databaseBuilder.factory.buildCompetence(competence);
      competence.thematicIds.forEach((id) =>
        databaseBuilder.factory.buildThematic({ id, competenceId: competence.id }),
      );
      competence.tubeIds.forEach((id, index) =>
        databaseBuilder.factory.buildTube({
          id,
          name: `@${id}`,
          thematicId: competence.thematicIds[index % competence.thematicIds.length],
        }),
      );
      competence.skillIds.forEach((id, index) =>
        databaseBuilder.factory.buildSkill({ id, tubeId: competence.tubeIds[index % competence.tubeIds.length] }),
      );

      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence4.name',
        locale: 'fr',
        value: 'Quatrième compétence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence4.name',
        locale: 'en',
        value: 'Fourth competence',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence4.description',
        locale: 'fr',
        value: 'C’est la quatrième',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence4.description',
        locale: 'en',
        value: 'It’s the fourth one',
      });

      await databaseBuilder.commit();

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: pixApiToken });
      pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/competences/competence4', {
          id: 'competence4',
          index: '2.2',
          areaId: 'area2',
          skillIds: [
            'skill7',
            'skill8',
            'skill9',
          ],
          thematicIds: ['thematic9'],
          origin: 'Pix',
          name_i18n: {
            fr: '4ème compétence',
            en: '4th competence',
          },
          description_i18n: {
            fr: 'C’est la 4ème',
            en: null,
          },
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
    });

    describe('when payload is NOT valid', () => {
      it('should respond with status 400', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/competences/${competence.id}`,
          payload: {
            data: {
              type: 'competences',
              attributes: { title: 1234 },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(400);
      });
    });

    describe('when user is NOT admin', () => {
      it('should respond with status 403', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/competences/${competence.id}`,
          payload: {
            data: {
              type: 'competences',
              id: 'competence4',
              attributes: {
                'pix-id': 'competence4',
                code: '2.2',
                title: '4ème compétence',
                'title-en': '4th competence',
                description: 'C’est la 4ème',
                'description-en': 'It’s the 4th one',
                source: 'Pix',
              },
              relationships: {
                area: {
                  data: {
                    type: 'areas',
                    id: 'area2',
                  },
                },
                'raw-themes': {
                  data: [
                    {
                      type: 'themes',
                      id: 'thematic9',
                    },
                  ],
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'tube8',
                    },
                    {
                      type: 'tubes',
                      id: 'tube9',
                    },
                  ],
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

    describe('when competence is unknown', () => {
      it('should respond with status 404', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/competences/competence404',
          payload: {
            data: {
              type: 'competences',
              id: 'competence404',
              attributes: {
                'pix-id': 'competence404',
                code: '2.2',
                title: '4ème compétence',
                'title-en': '4th competence',
                description: 'C’est la 4ème',
                'description-en': 'It’s the 4th one',
                source: 'Pix',
              },
              relationships: {
                area: {
                  data: {
                    type: 'areas',
                    id: 'area2',
                  },
                },
                'raw-themes': {
                  data: [
                    {
                      type: 'themes',
                      id: 'thematic9',
                    },
                  ],
                },
                'raw-tubes': {
                  data: [
                    {
                      type: 'tubes',
                      id: 'tube8',
                    },
                    {
                      type: 'tubes',
                      id: 'tube9',
                    },
                  ],
                },
              },
            },
          },
          headers: generateAuthorizationHeader(adminUser),
        });

        // then
        expect(response.statusCode).toBe(404);
      });
    });

    it('should respond with status 200 and updated competence', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/competences/${competence.id}`,
        payload: {
          data: {
            type: 'competences',
            id: 'competence4',
            attributes: {
              'pix-id': 'competence4',
              code: '2.2',
              title: '4ème compétence',
              'title-en': '4th competence',
              description: 'C’est la 4ème',
              'description-en': null,
              source: 'Pix',
            },
            relationships: {
              area: {
                data: {
                  type: 'areas',
                  id: 'area2',
                },
              },
              'raw-themes': {
                data: [
                  {
                    type: 'themes',
                    id: 'thematic9',
                  },
                ],
              },
              'raw-tubes': {
                data: [
                  {
                    type: 'tubes',
                    id: 'tube8',
                  },
                  {
                    type: 'tubes',
                    id: 'tube9',
                  },
                ],
              },
            },
          },
        },
        headers: generateAuthorizationHeader(adminUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'competences',
          id: 'competence4',
          attributes: {
            'pix-id': 'competence4',
            code: '2.2',
            title: '4ème compétence',
            'title-en': '4th competence',
            description: 'C’est la 4ème',
            'description-en': null,
            source: 'Pix',
          },
          relationships: {
            area: {
              data: {
                type: 'areas',
                id: 'area2',
              },
            },
            'raw-themes': {
              data: [
                {
                  type: 'themes',
                  id: 'thematic9',
                },
              ],
            },
            'raw-tubes': {
              data: [
                {
                  type: 'tubes',
                  id: 'tube8',
                },
                {
                  type: 'tubes',
                  id: 'tube9',
                },
              ],
            },
          },
        },
      });

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([
        { key: 'competence.competence4.description', locale: 'fr', value: 'C’est la 4ème' },
        { key: 'competence.competence4.name', locale: 'en', value: '4th competence' },
        { key: 'competence.competence4.name', locale: 'fr', value: '4ème compétence' },
      ]);

      expect(pixApiCacheScope.isDone()).toBe(true);
    });
  });
});
