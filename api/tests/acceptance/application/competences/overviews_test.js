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
import { thematicDatasource } from '../../../../lib/infrastructure/datasources/airtable/thematic-datasource.js';

describe('Acceptance | Route | competence-overviews', () => {

  let user;
  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences/:id/overviews/challenges-production', () => {

    it('should respond status 200 and overview of competence’s production challenges', async () => {
      // given
      const competenceId = 'recCompetence1';

      const airtableThematics = [
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic1', airtableId: 'recAirtableThematic1', index:2 })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic2', airtableId: 'recAirtableThematic2', index:1 })),
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

      // FIXME tubes
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
              },
              {
                airtableId: 'recAirtableThematic1',
                name: 'Thématique 1',
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
    });
  });
});
