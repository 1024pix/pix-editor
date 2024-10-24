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
  challengeDatasource,
  skillDatasource,
  thematicDatasource,
  tubeDatasource
} from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { Challenge, Skill } from '../../../../lib/domain/models/index.js';
import { LOCALE } from '../../../../lib/domain/constants.js';

describe('Acceptance | Route | competence-overviews', () => {

  let user;
  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences/:id/overviews/challenges-production', () => {
    let competenceId, airtableThematicsScope, airtableTubesScope, airtableSkillsScope, airtableChallengesScope;

    beforeEach(async function() {
      competenceId = 'recCompetence1';

      const airtableThematics = [
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic1', airtableId: 'recAirtableThematic1', index: 2, tubeIds: ['recTube1', 'recTube2', 'recTube3'] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic2', airtableId: 'recAirtableThematic2', index: 1, tubeIds: ['recTube4', 'recTube5'] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic3', airtableId: 'recAirtableThematic3', index: 3, tubeIds: [] })),
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject({ id: 'recThematic4', airtableId: 'recAirtableThematic4', index: 4, tubeIds: ['recTube6'] })),
      ];

      airtableThematicsScope = nock('https://api.airtable.com')
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

      airtableTubesScope = nock('https://api.airtable.com')
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

      airtableSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': skillDatasource.usedFields,
          },
          filterByFormula: `AND({Compétence (via Tube) (id persistant)} = "${competenceId}", {Status} = "${Skill.STATUSES.ACTIF}")`
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

      const airtableChallenges = [
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge1', airtableId: 'recAirtableChallenge1', skillId: 'recSkill1', genealogy: Challenge.GENEALOGIES.PROTOTYPE, declinable: Challenge.DECLINABLES.FACILEMENT, version: 1, status: Challenge.STATUSES.VALIDE, competenceId })),
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge11', airtableId: 'recAirtableChallenge11', skillId: 'recSkill1', genealogy: Challenge.GENEALOGIES.DECLINAISON, version: 1, status: Challenge.STATUSES.VALIDE, locales: [LOCALE.FRENCH_FRANCE], competenceId })),
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge2', airtableId: 'recAirtableChallenge2', skillId: 'recSkill2', genealogy: Challenge.GENEALOGIES.PROTOTYPE, declinable: Challenge.DECLINABLES.NON, version: 1, status: Challenge.STATUSES.VALIDE, competenceId })),
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge3', airtableId: 'recAirtableChallenge3', skillId: 'recSkill3', genealogy: Challenge.GENEALOGIES.PROTOTYPE, declinable: Challenge.DECLINABLES.FACILEMENT, version: 2, status: Challenge.STATUSES.VALIDE, competenceId })),
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge31', airtableId: 'recAirtableChallenge31', skillId: 'recSkill3', genealogy: Challenge.GENEALOGIES.DECLINAISON, version: 2, status: Challenge.STATUSES.PROPOSE, competenceId })),
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge4', airtableId: 'recAirtableChallenge4', skillId: 'recSkill4', genealogy: Challenge.GENEALOGIES.PROTOTYPE, declinable: Challenge.DECLINABLES.DIFFICILEMENT, version: 1, status: Challenge.STATUSES.VALIDE, competenceId })),
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge5', airtableId: 'recAirtableChallenge5', skillId: 'recSkill5', genealogy: Challenge.GENEALOGIES.PROTOTYPE, declinable: Challenge.DECLINABLES.NON, version: 1, status: Challenge.STATUSES.VALIDE, competenceId })),
      ];

      const airtableEnglishChallenges = [
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge12', airtableId: 'recAirtableChallenge12', skillId: 'recSkill1', genealogy: Challenge.GENEALOGIES.DECLINAISON, version: 1, status: Challenge.STATUSES.VALIDE, locales: [LOCALE.ENGLISH_SPOKEN], competenceId }))
      ];

      const airtableNoiseChallenges = [
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge21', airtableId: 'recAirtableChallenge21', skillId: 'recSkill2', genealogy: Challenge.GENEALOGIES.PROTOTYPE, declinable: Challenge.DECLINABLES.NON, version: 2, status: Challenge.STATUSES.PROPOSE, competenceId })),
        airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge22', airtableId: 'recAirtableChallenge22', skillId: 'recSkill22', genealogy: Challenge.GENEALOGIES.PROTOTYPE, declinable: Challenge.DECLINABLES.NON, version: 1, status: Challenge.STATUSES.PROPOSE, competenceId })),
      ];

      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge1', challengeId: 'recChallenge1', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge11', challengeId: 'recChallenge11', locale: LOCALE.FRENCH_FRANCE });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge2', challengeId: 'recChallenge2', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge3', challengeId: 'recChallenge3', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge31', challengeId: 'recChallenge31', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge4', challengeId: 'recChallenge4', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge5', challengeId: 'recChallenge5', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge21', challengeId: 'recChallenge21', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge22', challengeId: 'recChallenge22', locale: LOCALE.FRENCH_SPOKEN });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'recChallenge12', challengeId: 'recChallenge12', locale: LOCALE.ENGLISH_SPOKEN });
      await databaseBuilder.commit();

      airtableChallengesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeDatasource.usedFields,
          },
          filterByFormula: `AND({Compétences (via tube) (id persistant)} = "${competenceId}", {acquis} != "@workbench", OR({Statut} = "${Challenge.STATUSES.PROPOSE}", {Statut} = "${Challenge.STATUSES.VALIDE}"))`
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [...airtableChallenges, ...airtableNoiseChallenges, ...airtableEnglishChallenges] });

    });
    describe('without language filter', () => {
      it('should respond status 200 and overview of competence’s production challenges that are primary', async () => {
      // given
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
                          prototypeId: 'recChallenge4',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: true,
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
                          prototypeId: 'recChallenge5',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: false,
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
                          prototypeId: 'recChallenge3',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 1,
                          isPrototypeDeclinable: true,
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
                          prototypeId: 'recChallenge2',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: false,
                        },
                        {
                          airtableId: 'recAirtableSkill1',
                          name: '@tube14',
                          prototypeId: 'recChallenge1',
                          validatedChallengesCount: 3,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: true,
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

        expect(airtableThematicsScope.isDone()).toBe(true);
        expect(airtableTubesScope.isDone()).toBe(true);
        expect(airtableSkillsScope.isDone()).toBe(true);
        expect(airtableChallengesScope.isDone()).toBe(true);
      });
    });
  });
});
