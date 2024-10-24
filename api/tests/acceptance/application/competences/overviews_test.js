import {  beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import {
  skillDatasource,
  thematicDatasource,
  tubeDatasource
} from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { Skill } from '../../../../lib/domain/models/Skill.js';

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
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic1', airtableId: 'recAirtableThematic1', index: 2, tubeIds: ['recTube1', 'recTube2', 'recTube3'] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic2', airtableId: 'recAirtableThematic2', index: 1, tubeIds: ['recTube4', 'recTube5'] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic3', airtableId: 'recAirtableThematic3', index: 3, tubeIds: [] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic4', airtableId: 'recAirtableThematic4', index: 4, tubeIds: ['recTube6'] })),
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
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({ id: 'recTube6', airtableId: 'recAirtableTube6', competenceId, name: '@tube6', index: 1 })),
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

      const airtableSkills = [
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({ id: 'recSkill1', airtableId: 'recAirtableSkill1', name: '@tube14', level: 4, status: Skill.STATUSES.ACTIF, competenceId, tubeId: 'recTube1' })),
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({ id: 'recSkill2', airtableId: 'recAirtableSkill2', name: '@tube13', level: 3, status: Skill.STATUSES.ACTIF, competenceId, tubeId: 'recTube1' })),
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({ id: 'recSkill3', airtableId: 'recAirtableSkill3', name: '@tube27', level: 7, status: Skill.STATUSES.ACTIF, competenceId, tubeId: 'recTube2' })),
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({ id: 'recSkill4', airtableId: 'recAirtableSkill4', name: '@tube41', level: 1, status: Skill.STATUSES.ACTIF, competenceId, tubeId: 'recTube4' })),
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({ id: 'recSkill5', airtableId: 'recAirtableSkill5', name: '@tube56', level: 6, status: Skill.STATUSES.ACTIF, competenceId, tubeId: 'recTube5' })),
      ];

      const airtableSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': skillDatasource.usedFields,
          },
          filterByFormula: `{Compétence (via Tube) (id persistant)} = "${competenceId}"`
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

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
                    skillOverviews: [
                      {
                        airtableId: 'recAirtableSkill4',
                        name: '@tube41',
                      },
                      null,
                      null,
                      null,
                      null,
                      null,
                      null,
                    ],
                  },
                  {
                    airtableId: 'recAirtableTube5',
                    name: '@tube5',
                    skillOverviews: [
                      null,
                      null,
                      null,
                      null,
                      null,
                      {
                        airtableId: 'recAirtableSkill5',
                        name: '@tube56',
                      },
                      null,
                    ],
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
                    skillOverviews: [
                      null,
                      null,
                      null,
                      null,
                      null,
                      null,
                      {
                        airtableId: 'recAirtableSkill3',
                        name: '@tube27',
                      },
                    ],
                  },
                  {
                    airtableId: 'recAirtableTube1',
                    name: '@tube1',
                    skillOverviews: [
                      null,
                      null,
                      {
                        airtableId: 'recAirtableSkill2',
                        name: '@tube13',
                      },
                      {
                        airtableId: 'recAirtableSkill1',
                        name: '@tube14',
                      },
                      null,
                      null,
                      null,
                    ],
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
      expect(airtableSkillsScope.isDone()).toBe(true);
    });
  });
});
