import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { competenceDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';

describe('Acceptance | Route | competences', () => {

  let editorUser;
  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences', async () => {
    let airtableCompetencesScope;

    beforeEach(async () => {
      const airtableCompetences = [
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence1',
          airtableId: 'recCompetence1',
          index: '1.1',
          areaAirtableId: 'recArea1',
          origin: 'Pix',
          thematicAirtableIds: ['recThematic1', 'recThematic2'],
          tubeAirtableIds: ['recTube1', 'recTube2', 'recTube3', 'recTube4', 'recTube5'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence11',
          airtableId: 'recCompetence11',
          index: '1.1',
          areaAirtableId: 'recArea11',
          origin: 'Pix Junior',
          thematicAirtableIds: ['recThematic11', 'recThematic12'],
          tubeAirtableIds: ['recTube11', 'recTube12', 'recTube13'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence2',
          airtableId: 'recCompetence2',
          index: '1.2',
          areaAirtableId: 'recArea1',
          origin: 'Pix',
          thematicAirtableIds: ['recThematic3'],
          tubeAirtableIds: ['recTube6', 'recTube7'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence12',
          airtableId: 'recCompetence12',
          index: '1.2',
          areaAirtableId: 'recArea11',
          origin: 'Pix Junior',
          thematicAirtableIds: ['recThematic13', 'recThematic14'],
          tubeAirtableIds: ['recTube14', 'recTube15', 'recTube16', 'recTube17'],
        })),
        airtableBuilder.factory.buildCompetence(domainBuilder.buildCompetenceDatasourceObject({
          id: 'competence3',
          airtableId: 'recCompetence3',
          index: '2.1',
          areaAirtableId: 'recArea2',
          origin: 'Pix',
          thematicAirtableIds: ['recThematic4', 'recThematic5'],
          tubeAirtableIds: ['recTube8', 'recTube9'],
        })),
      ];

      airtableCompetencesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Competences')
        .query({
          fields: { '': competenceDatasource.usedFields },
          sort: [{ field: competenceDatasource.sortField, direction: 'asc' }]
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableCompetences });

      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.name', locale: 'fr', value: 'Première compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.name', locale: 'en', value: 'First competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.description', locale: 'fr', value: 'C’est la première' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.description', locale: 'en', value: 'It’s the first one' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.name', locale: 'fr', value: 'Première compétence junior' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.name', locale: 'en', value: 'First junior competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.description', locale: 'fr', value: 'C’est la première pour les juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence11.description', locale: 'en', value: 'It’s the first one for juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.name', locale: 'fr', value: 'Deuxième compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.name', locale: 'en', value: 'Second competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.description', locale: 'fr', value: 'C’est la deuxième' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence2.description', locale: 'en', value: 'It’s the second one' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.name', locale: 'fr', value: 'Deuxième compétence junior' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.name', locale: 'en', value: 'Second junior competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.description', locale: 'fr', value: 'C’est la deuxième pour les juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence12.description', locale: 'en', value: 'It’s the second one for juniors' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.name', locale: 'fr', value: 'Troisième compétence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.name', locale: 'en', value: 'Third competence' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.description', locale: 'fr', value: 'C’est la troisième' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence3.description', locale: 'en', value: 'It’s the third one' });

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
            id: 'recCompetence1',
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
                  id: 'recArea1',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic1', type: 'themes' },
                  { id: 'recThematic2', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube1', type: 'tubes' },
                  { id: 'recTube2', type: 'tubes' },
                  { id: 'recTube3', type: 'tubes' },
                  { id: 'recTube4', type: 'tubes' },
                  { id: 'recTube5', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence11',
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
                  id: 'recArea11',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic11', type: 'themes' },
                  { id: 'recThematic12', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube11', type: 'tubes' },
                  { id: 'recTube12', type: 'tubes' },
                  { id: 'recTube13', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence2',
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
                  id: 'recArea1',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic3', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube6', type: 'tubes' },
                  { id: 'recTube7', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence12',
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
                  id: 'recArea11',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic13', type: 'themes' },
                  { id: 'recThematic14', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube14', type: 'tubes' },
                  { id: 'recTube15', type: 'tubes' },
                  { id: 'recTube16', type: 'tubes' },
                  { id: 'recTube17', type: 'tubes' },
                ],
              },
            },
          },
          {
            type: 'competences',
            id: 'recCompetence3',
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
                  id: 'recArea2',
                },
              },
              'raw-themes': {
                data: [
                  { id: 'recThematic4', type: 'themes' },
                  { id: 'recThematic5', type: 'themes' },
                ],
              },
              'raw-tubes': {
                data: [
                  { id: 'recTube8', type: 'tubes' },
                  { id: 'recTube9', type: 'tubes' },
                ],
              },
            },
          },
        ],
      });

      expect(airtableCompetencesScope.isDone()).toBe(true);
    });
  });
});
