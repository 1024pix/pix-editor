import {  beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import _ from 'lodash';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { thematicDatasource, tubeDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';

describe('Acceptance | Route | competence-overviews', () => {

  let user;
  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences/:id/overviews/challenges-production', () => {

    it.fails('should respond status 200 and overview of competence’s production challenges', async () => {
      // given
      const competenceId = 'recCompetence1';

      const airtableThematics = [
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic1', airtableId: 'recAirtableThematic1', index: 2, tubeIds: ['recTube1', 'recTube2', 'recTube3'] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic2', airtableId: 'recAirtableThematic2', index: 1, tubeIds: ['recTube4', 'recTube5'] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic3', airtableId: 'recAirtableThematic3', index: 3, tubeIds: [] })),
      ];

      const airtableThematicsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques')
        .query({
          fields: {
            '': thematicDatasource.usedFields,
          },
          filterByFormula: `{Competence (id persistant)} = "${competenceId}"`
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableThematics });

      databaseBuilder.factory.buildTranslation({
        key: `thematic.${airtableThematics[0].fields['id persistant']}.name`,
        locale: 'fr',
        value: 'Thématique 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: `thematic.${airtableThematics[1].fields['id persistant']}.name`,
        locale: 'fr',
        value: 'Thématique 2',
      });

      const airtableTubes = [
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({ id: 'recTube1', airtableId: 'recAirtableTube1', competenceId, name: '@tube1', index: 2 })),
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({ id: 'recTube2', airtableId: 'recAirtableTube2', competenceId, name: '@tube2', index: 1 })),
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({ id: 'recTube3', airtableId: 'recAirtableTube3', competenceId, name: '@tube3', index: 3 })),
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({ id: 'recTube4', airtableId: 'recAirtableTube4', competenceId, name: '@tube4', index: 1 })),
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({ id: 'recTube5', airtableId: 'recAirtableTube5', competenceId, name: '@tube5', index: 2 })),
      ];

      const airtableTubesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes')
        .query({
          fields: {
            '': tubeDatasource.usedFields,
          },
          filterByFormula: `{Competence (via Thematique) (id persistant)} = "${competenceId}"`
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableTubes });

      // FIXME skills
      // FIXME challenges

      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/competences/${competenceId}/overviews/challenges-production`,
        headers: generateAuthorizationHeader(user)
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data:{
          type: 'competence-overviews',
          id: `${competenceId}-challenges-production-fr`,
          attributes: {
            'thematic-overviews': [
              {
                airtableId: 'recAirtableThematic2',
                name: 'Thématique 2',
                tubeOverviews: [
                  {
                    airtableId: 'recAirtableTube4',
                    name: '@tube4',
                  },
                  {
                    airtableId: 'recAirtableTube5',
                    name: '@tube5',
                  },
                ],
              },
              {
                airtableId: 'recAirtableThematic1',
                name: 'Thématique 1',
                tubeOverviews: [
                  {
                    airtableId: 'recAirtableTube2',
                    name: '@tube2',
                  },
                  {
                    airtableId: 'recAirtableTube1',
                    name: '@tube1',
                  },
                  {
                    airtableId: 'recAirtableTube3',
                    name: '@tube3',
                  },
                ],
              },
            ],
          },
        },
      });

      // {
      //   id: 'recCompetence123-challenges-production-fr',
      //   thematicOverviews: [ // sorted by index
      //     {
      //       airtableId: 'rec654',
      //       name: 'theme',
      //       tubeOverviews: [ // sorted by index
      //         {
      //           airtableId: 'rec987',
      //           name: 'tube',
      //           skillOverviews: [
      //             null,
      //             null,
      //             {
      //               airtableId: 'rec147',
      //               name: '@skill3',
      //               prototypeId: 'rec258',
      //               validatedChallengesCount: 2,
      //               proposedChallengesCount: 3,
      //               isPrototypeDeclinable: true,
      //             },
      //             null,
      //             null,
      //             null,
      //             null,
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // }

      expect(airtableThematicsScope.isDone()).toBe(true);
      expect(airtableTubesScope.isDone()).toBe(true);
    });
  });
});
