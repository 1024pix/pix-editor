import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import {
  challengeDatasource,
  competenceDatasource,
  skillDatasource,
  thematicDatasource,
  tubeDatasource,
} from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { Challenge, LocalizedChallenge, Skill } from '../../../../lib/domain/models/index.js';
import { LOCALE } from '../../../../lib/domain/constants.js';

describe('Acceptance | Route | competence-overviews', () => {
  let user;
  beforeEach(async function () {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences/:id/overviews/challenges-production', () => {
    let competenceId,
      airtableCompetencesScope,
      airtableThematicsScope,
      airtableTubesScope,
      airtableSkillsScope,
      airtableChallengesScope;

    beforeEach(async function () {
      competenceId = 'recCompetence1';

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: competenceId, index: '2.2', areaId: 'area1' });

      const airtableCompetences = [
        airtableBuilder.factory.buildCompetence(
          domainBuilder.buildCompetenceDatasourceObject({
            id: competenceId,
            airtableId: 'recAirtableCompetence1',
            index: '2.2',
            origin: 'Fmk 1',
            areaId: 'area1',
            thematicIds: ['recThematic1', 'recThematic2', 'recThematic3', 'recThematic4'],
            tubeIds: ['recTube1', 'recTube2', 'recTube3', 'recTube4', 'recTube5', 'recTube6'],
            skillIds: ['recSkill1', 'recSkill2', 'recSkill3', 'recSkill4', 'recSkill5'],
          }),
        ),
      ];
      databaseBuilder.factory.buildTranslation({
        key: 'competence.recCompetence1.name',
        locale: 'fr',
        value: 'Mon super titre',
      });

      airtableCompetencesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Competences')
        .query({
          fields: {
            '': competenceDatasource.usedFields,
          },
          filterByFormula: `OR("${competenceId}" = {id persistant})`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableCompetences });

      databaseBuilder.factory.buildThematic({ id: 'recThematic1', index: 2, competenceId });
      databaseBuilder.factory.buildThematic({ id: 'recThematic2', index: 1, competenceId });
      databaseBuilder.factory.buildThematic({ id: 'recThematic3', index: 3, competenceId });
      databaseBuilder.factory.buildThematic({ id: 'recThematic4', index: 4, competenceId });

      const airtableThematics = [
        airtableBuilder.factory.buildThematic(
          domainBuilder.buildThematicDatasourceObject({
            id: 'recThematic1',
            airtableId: 'recAirtableThematic1',
            index: 2,
            tubeIds: ['recTube1', 'recTube2', 'recTube3'],
            competenceId,
          }),
        ),
        airtableBuilder.factory.buildThematic(
          domainBuilder.buildThematicDatasourceObject({
            id: 'recThematic2',
            airtableId: 'recAirtableThematic2',
            index: 1,
            tubeIds: ['recTube4', 'recTube5'],
            competenceId,
          }),
        ),
        airtableBuilder.factory.buildThematic(
          domainBuilder.buildThematicDatasourceObject({
            id: 'recThematic3',
            airtableId: 'recAirtableThematic3',
            index: 3,
            tubeIds: null,
            competenceId,
          }),
        ),
        airtableBuilder.factory.buildThematic(
          domainBuilder.buildThematicDatasourceObject({
            id: 'recThematic4',
            airtableId: 'recAirtableThematic4',
            index: 4,
            tubeIds: ['recTube6'],
            competenceId,
          }),
        ),
      ];

      airtableThematicsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques')
        .query({
          fields: {
            '': thematicDatasource.usedFields,
          },
          filterByFormula: `{Competence (id persistant)} = "${competenceId}"`,
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

      const tubes = [
        {
          id: 'recTube1',
          airtableId: 'recAirtableTube1',
          competenceId,
          name: '@tube1',
          index: 2,
          thematicId: 'recThematic1',
          skillIds: ['recSkill1', 'recSkill2'],
        },
        {
          id: 'recTube2',
          airtableId: 'recAirtableTube2',
          competenceId,
          name: '@tube2',
          index: 1,
          thematicId: 'recThematic1',
          skillIds: ['recSkill3'],
        },
        {
          id: 'recTube3',
          airtableId: 'recAirtableTube3',
          competenceId,
          name: '@tube3',
          index: 3,
          thematicId: 'recThematic1',
          skillIds: [],
        },
        {
          id: 'recTube4',
          airtableId: 'recAirtableTube4',
          competenceId,
          name: '@tube4',
          index: 1,
          thematicId: 'recThematic2',
          skillIds: ['recSkill4'],
        },
        {
          id: 'recTube5',
          airtableId: 'recAirtableTube5',
          competenceId,
          name: '@tube5',
          index: 2,
          thematicId: 'recThematic2',
          skillIds: ['recSkill5'],
        },
        {
          id: 'recTube6',
          airtableId: 'recAirtableTube6',
          competenceId,
          name: '@tube6',
          index: 1,
          thematicId: 'recThematic4',
          skillIds: [],
        },
      ];

      tubes.forEach(databaseBuilder.factory.buildTube);

      const airtableTubes = tubes.map((tube) =>
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject(tube)),
      );

      airtableTubesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes')
        .query({
          fields: {
            '': tubeDatasource.usedFields,
          },
          filterByFormula: `{Competences (id persistant)} = "${competenceId}"`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableTubes });

      const skills = [
        {
          id: 'recSkill1',
          airtableId: 'recAirtableSkill1',
          name: '@tube14',
          level: 4,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube1',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          challengeIds: ['recChallenge1', 'recChallenge11', 'recChallenge12'],
        },
        {
          id: 'recSkill2',
          airtableId: 'recAirtableSkill2',
          name: '@tube13',
          level: 3,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube1',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          challengeIds: ['recChallenge2', 'recChallenge21'],
        },
        {
          id: 'recSkill3',
          airtableId: 'recAirtableSkill3',
          name: '@tube27',
          level: 7,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube2',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          challengeIds: ['recChallenge3', 'recChallenge31'],
        },
        {
          id: 'recSkill4',
          airtableId: 'recAirtableSkill4',
          name: '@tube41',
          level: 1,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube4',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          challengeIds: ['recChallenge4'],
        },
        {
          id: 'recSkill5',
          airtableId: 'recAirtableSkill5',
          name: '@tube56',
          level: 6,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube5',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          challengeIds: ['recChallenge5'],
        },
      ].map(domainBuilder.buildSkillDatasourceObject);

      skills.forEach(databaseBuilder.factory.buildSkill);

      const airtableSkills = skills.map((skill) =>
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill)),
      );

      airtableSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': skillDatasource.usedFields,
          },
          filterByFormula: `AND({Compétence (via Tube) (id persistant)} = "${competenceId}", {Status} = "${Skill.STATUSES.ACTIF}")`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

      const challenges = [
        {
          id: 'recChallenge1',
          airtableId: 'recAirtableChallenge1',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.FACILEMENT,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },
        {
          id: 'recChallenge11',
          airtableId: 'recAirtableChallenge11',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          locales: [LOCALE.FRENCH_FRANCE],
          competenceId,
        },
        {
          id: 'recChallenge2',
          airtableId: 'recAirtableChallenge2',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.NON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },

        {
          id: 'recChallenge3',
          airtableId: 'recAirtableChallenge3',
          skillId: 'recSkill3',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.FACILEMENT,
          version: 2,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },
        {
          id: 'recChallenge31',
          airtableId: 'recAirtableChallenge31',
          skillId: 'recSkill3',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
        },
        {
          id: 'recChallenge4',
          airtableId: 'recAirtableChallenge4',
          skillId: 'recSkill4',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.DIFFICILEMENT,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },

        {
          id: 'recChallenge5',
          airtableId: 'recAirtableChallenge5',
          skillId: 'recSkill5',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.NON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      challenges.forEach(databaseBuilder.factory.buildChallenge);

      const airtableChallenges = challenges.map(airtableBuilder.factory.buildChallenge);

      const englishChallenges = [
        {
          id: 'recChallenge12',
          airtableId: 'recAirtableChallenge12',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          locales: [LOCALE.ENGLISH_SPOKEN],
          competenceId,
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      englishChallenges.forEach(databaseBuilder.factory.buildChallenge);

      const airtableEnglishChallenges = englishChallenges.map(airtableBuilder.factory.buildChallenge);

      const noiseChallenges = [
        {
          id: 'recChallenge21',
          airtableId: 'recAirtableChallenge21',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.NON,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      noiseChallenges.forEach(databaseBuilder.factory.buildChallenge);

      const airtableNoiseChallenges = noiseChallenges.map(airtableBuilder.factory.buildChallenge);

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge1',
        challengeId: 'recChallenge1',
        locale: LOCALE.FRENCH_SPOKEN,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge11',
        challengeId: 'recChallenge11',
        locale: LOCALE.FRENCH_FRANCE,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge2',
        challengeId: 'recChallenge2',
        locale: LOCALE.FRENCH_SPOKEN,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge3',
        challengeId: 'recChallenge3',
        locale: LOCALE.FRENCH_SPOKEN,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge31',
        challengeId: 'recChallenge31',
        locale: LOCALE.FRENCH_SPOKEN,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge4',
        challengeId: 'recChallenge4',
        locale: LOCALE.FRENCH_SPOKEN,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge5',
        challengeId: 'recChallenge5',
        locale: LOCALE.FRENCH_SPOKEN,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge21',
        challengeId: 'recChallenge21',
        locale: LOCALE.FRENCH_SPOKEN,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge12',
        challengeId: 'recChallenge12',
        locale: LOCALE.ENGLISH_SPOKEN,
      });
      await databaseBuilder.commit();

      airtableChallengesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeDatasource.usedFields,
          },
          filterByFormula: `AND({Compétences (via tube) (id persistant)} = "${competenceId}", {acquis} != "@workbench", OR({Statut} = "${Challenge.STATUSES.PROPOSE}", {Statut} = "${Challenge.STATUSES.VALIDE}"))`,
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
          headers: generateAuthorizationHeader(user),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: {
            type: 'competence-overviews',
            id: `${competenceId}:challenges-production`,
            attributes: {
              'airtable-id': 'recAirtableCompetence1',
              name: '2.2 Mon super titre',
              'tubes-count': 4,
              'skills-count': 5,
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
                          id: 'recSkill4',
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
                          id: 'recSkill5',
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
                          id: 'recSkill3',
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
                          id: 'recSkill2',
                          airtableId: 'recAirtableSkill2',
                          name: '@tube13',
                          prototypeId: 'recChallenge2',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: false,
                        },
                        {
                          id: 'recSkill1',
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

        expect(airtableCompetencesScope.isDone()).toBe(true);
        expect(airtableThematicsScope.isDone()).toBe(true);
        expect(airtableTubesScope.isDone()).toBe(true);
        expect(airtableSkillsScope.isDone()).toBe(true);
        expect(airtableChallengesScope.isDone()).toBe(true);
      });
    });

    describe('with language filter set to english', () => {
      it('should respond status 200 and overview of competence’s production, localized and primary english challenges', async () => {
        // given
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'recChallenge3_en',
          challengeId: 'recChallenge3',
          status: LocalizedChallenge.STATUSES.PLAY,
          locale: LOCALE.ENGLISH_SPOKEN,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'recChallenge31_en',
          challengeId: 'recChallenge31',
          status: LocalizedChallenge.STATUSES.PAUSE,
          locale: LOCALE.ENGLISH_SPOKEN,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'recChallenge4_en',
          challengeId: 'recChallenge4',
          status: LocalizedChallenge.STATUSES.PAUSE,
          locale: LOCALE.ENGLISH_SPOKEN,
        });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/competences/${competenceId}/overviews/challenges-production?locale=en`,
          headers: generateAuthorizationHeader(user),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: {
            type: 'competence-overviews',
            id: `${competenceId}:challenges-production:en`,
            attributes: {
              'airtable-id': 'recAirtableCompetence1',
              name: '2.2 Mon super titre',
              'tubes-count': 4,
              'skills-count': 5,
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
                          id: 'recSkill4',
                          airtableId: 'recAirtableSkill4',
                          name: '@tube41',
                          prototypeId: 'recChallenge4',
                          validatedChallengesCount: 0,
                          proposedChallengesCount: 1,
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
                          id: 'recSkill5',
                          airtableId: 'recAirtableSkill5',
                          name: '@tube56',
                          prototypeId: 'recChallenge5',
                          validatedChallengesCount: 0,
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
                          id: 'recSkill3',
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
                          id: 'recSkill2',
                          airtableId: 'recAirtableSkill2',
                          name: '@tube13',
                          prototypeId: 'recChallenge2',
                          validatedChallengesCount: 0,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: false,
                        },
                        {
                          id: 'recSkill1',
                          airtableId: 'recAirtableSkill1',
                          name: '@tube14',
                          prototypeId: 'recChallenge1',
                          validatedChallengesCount: 1,
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

        expect(airtableCompetencesScope.isDone()).toBe(true);
        expect(airtableThematicsScope.isDone()).toBe(true);
        expect(airtableTubesScope.isDone()).toBe(true);
        expect(airtableSkillsScope.isDone()).toBe(true);
        expect(airtableChallengesScope.isDone()).toBe(true);
      });
    });
  });

  describe('GET /competences/:id/overviews/challenges-workbench', () => {
    let competenceId,
      airtableCompetencesScope,
      airtableThematicsScope,
      airtableTubesScope,
      airtableSkillsScope,
      airtableChallengesScope;

    beforeEach(async function () {
      competenceId = 'recCompetence1';

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: competenceId, index: '2.2', areaId: 'area1' });

      const airtableCompetences = [
        airtableBuilder.factory.buildCompetence(
          domainBuilder.buildCompetenceDatasourceObject({
            id: competenceId,
            airtableId: 'recAirtableCompetence1',
            index: '2.2',
            origin: 'Fmk 1',
            areaId: 'area1',
            thematicIds: ['recThematic1', 'recThematic2', 'recThematic3', 'recThematicWorkbench'],
            tubeIds: ['recTube1', 'recTube2', 'recTube3', 'recTube4', 'recTubeWorkbench'],
            skillIds: [
              'recSkill1',
              'recSkill2',
              'recSkill3',
              'recSkill4',
              'recSkill5',
              'recSkill6',
              'recSkill7',
              'recSkillWorkbench',
            ],
          }),
        ),
      ];
      databaseBuilder.factory.buildTranslation({
        key: 'competence.recCompetence1.name',
        locale: 'fr',
        value: 'Mon super titre',
      });

      airtableCompetencesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Competences')
        .query({
          fields: {
            '': competenceDatasource.usedFields,
          },
          filterByFormula: `OR("${competenceId}" = {id persistant})`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableCompetences });

      const thematics = [
        {
          id: 'recThematic1',
          airtableId: 'recAirtableThematic1',
          index: 2,
          tubeIds: ['recTube1', 'recTube2'],
          competenceId,
        },
        {
          id: 'recThematic2',
          airtableId: 'recAirtableThematic2',
          index: 1,
          tubeIds: ['recTube3', 'recTube4'],
          competenceId,
        },
        { id: 'recThematic3', airtableId: 'recAirtableThematic3', index: 3, tubeIds: null, competenceId },
        {
          id: 'recThematicWorkbench',
          airtableId: 'recAirtableThematicWorkbench',
          index: 4,
          tubeIds: ['recTubeWorkbench'],
          competenceId,
        },
      ];

      thematics.forEach(databaseBuilder.factory.buildThematic);

      const airtableThematics = thematics.map((thematic) =>
        airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject(thematic)),
      );

      airtableThematicsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Thematiques')
        .query({
          fields: {
            '': thematicDatasource.usedFields,
          },
          filterByFormula: `{Competence (id persistant)} = "${competenceId}"`,
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

      const tubes = [
        {
          id: 'recTube1',
          airtableId: 'recAirtableTube1',
          competenceId,
          name: '@tube1',
          index: 2,
          thematicId: 'recThematic1',
          skillIds: ['recSkill1', 'recSkill2'],
        },
        {
          id: 'recTube2',
          airtableId: 'recAirtableTube2',
          competenceId,
          name: '@tube2',
          index: 1,
          thematicId: 'recThematic1',
          skillIds: ['recSkill3', 'recSkill4', 'recSkill5'],
        },
        {
          id: 'recTube3',
          airtableId: 'recAirtableTube3',
          competenceId,
          name: '@tube3',
          index: 3,
          thematicId: 'recThematic2',
          skillIds: ['recSkill6', 'recSkill7'],
        },
        {
          id: 'recTube4',
          airtableId: 'recAirtableTube4',
          competenceId,
          name: '@tube4',
          index: 4,
          thematicId: 'recThematic2',
          skillIds: [],
        },
        {
          id: 'recTubeWorkbench',
          airtableId: 'recAirtableTubeWorkbench',
          competenceId,
          name: '@workbench',
          index: 5,
          thematicId: 'recThematicWorkbench',
          skillIds: ['recSkillWorkbench'],
        },
      ];

      tubes.forEach(databaseBuilder.factory.buildTube);

      const airtableTubes = tubes.map((tube) =>
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject(tube)),
      );

      airtableTubesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes')
        .query({
          fields: {
            '': tubeDatasource.usedFields,
          },
          filterByFormula: `{Competences (id persistant)} = "${competenceId}"`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableTubes });

      const skills = [
        {
          id: 'recSkill1',
          airtableId: 'recAirtableSkill1',
          name: '@tube14',
          level: 4,
          version: 1,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube1',
          challengeIds: ['recChallenge1'],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
        {
          id: 'recSkill2',
          airtableId: 'recAirtableSkill2',
          name: '@tube13',
          level: 3,
          version: 1,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube1',
          challengeIds: ['recChallenge2', 'recChallenge21'],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
        {
          id: 'recSkill3',
          airtableId: 'recAirtableSkill3',
          name: '@tube27',
          level: 7,
          version: 1,
          status: Skill.STATUSES.ARCHIVE,
          competenceId,
          tubeId: 'recTube2',
          challengeIds: ['recChallenge3'],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
        {
          id: 'recSkill4',
          airtableId: 'recAirtableSkill4',
          name: '@tube27',
          level: 7,
          version: 2,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube2',
          challengeIds: ['recChallenge4', 'recChallenge41'],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
        {
          id: 'recSkill5',
          airtableId: 'recAirtableSkill5',
          name: '@tube27',
          level: 7,
          version: 3,
          status: Skill.STATUSES.EN_CONSTRUCTION,
          competenceId,
          tubeId: 'recTube2',
          challengeIds: ['recChallenge5', 'recChallenge51'],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
        {
          id: 'recSkill6',
          airtableId: 'recAirtableSkill6',
          name: '@tube32',
          level: 2,
          version: 1,
          status: Skill.STATUSES.PERIME,
          competenceId,
          tubeId: 'recTube3',
          challengeIds: ['recChallenge6'],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
        {
          id: 'recSkill7',
          airtableId: 'recAirtableSkill7',
          name: '@tube35',
          level: 5,
          version: 1,
          status: Skill.STATUSES.EN_CONSTRUCTION,
          competenceId,
          tubeId: 'recTube3',
          challengeIds: [],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
        {
          id: 'recSkillWorkbench',
          airtableId: 'recAirtableSkillWorkbench',
          name: '@workbench',
          level: null,
          competenceId,
          tubeId: 'recTubeWorkbench',
          challengeIds: [],
          tutorialIds: [],
          learningMoreTutorialIds: [],
        },
      ].map(domainBuilder.buildSkillDatasourceObject);

      skills.forEach(databaseBuilder.factory.buildSkill);

      const airtableSkills = skills.map((skill) =>
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill)),
      );

      airtableSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': skillDatasource.usedFields,
          },
          filterByFormula: `{Compétence (via Tube) (id persistant)} = "${competenceId}"`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

      const challenges = [
        {
          id: 'recChallenge1',
          airtableId: 'recAirtableChallenge1',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },

        {
          id: 'recChallenge2',
          airtableId: 'recAirtableChallenge2',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },
        {
          id: 'recChallenge21',
          airtableId: 'recAirtableChallenge21',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
        },

        {
          id: 'recChallenge3',
          airtableId: 'recAirtableChallenge3',
          skillId: 'recSkill3',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.ARCHIVE,
          competenceId,
        },

        {
          id: 'recChallenge4',
          airtableId: 'recAirtableChallenge4',
          skillId: 'recSkill4',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.PERIME,
          competenceId,
        },
        {
          id: 'recChallenge41',
          airtableId: 'recAirtableChallenge41',
          skillId: 'recSkill4',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 2,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
        },

        {
          id: 'recChallenge5',
          airtableId: 'recAirtableChallenge5',
          skillId: 'recSkill5',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.PERIME,
          competenceId,
        },
        {
          id: 'recChallenge51',
          airtableId: 'recAirtableChallenge51',
          skillId: 'recSkill5',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
        },

        {
          id: 'recChallenge6',
          airtableId: 'recAirtableChallenge6',
          skillId: 'recSkill6',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.PERIME,
          competenceId,
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      challenges.forEach(databaseBuilder.factory.buildChallenge);

      const airtableChallenges = challenges.map(airtableBuilder.factory.buildChallenge);

      challenges.forEach((challenge) =>
        databaseBuilder.factory.buildLocalizedChallenge({ id: challenge.id, challengeId: challenge.id }),
      );

      await databaseBuilder.commit();

      airtableChallengesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': challengeDatasource.usedFields,
          },
          filterByFormula: `AND({Compétences (via tube) (id persistant)} = "${competenceId}", {acquis} != "${Skill.WORKBENCH_NAME}", {Généalogie} = "${Challenge.GENEALOGIES.PROTOTYPE}")`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableChallenges });
    });

    it('should respond status 200 and overview of competence’s workbench challenges', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/competences/${competenceId}/overviews/challenges-workbench`,
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'competence-overviews',
          id: `${competenceId}:challenges-workbench`,
          attributes: {
            'airtable-id': 'recAirtableCompetence1',
            name: '2.2 Mon super titre',
            'tubes-count': 3,
            'skills-count': 5,
            'thematic-overviews': [
              {
                airtableId: 'recAirtableThematic2',
                name: 'Thématique 2',
                tubeOverviews: [
                  {
                    airtableId: 'recAirtableTube3',
                    name: '@tube3',
                    skillOverviews: [
                      null,
                      {
                        airtableId: 'recAirtableSkill6',
                        name: '@tube32',
                        validatedChallengesCount: 0,
                        proposedChallengesCount: 0,
                        archivedChallengesCount: 0,
                        obsoleteChallengesCount: 1,
                      },
                      null,
                      null,
                      {
                        airtableId: 'recAirtableSkill7',
                        name: '@tube35',
                        validatedChallengesCount: 0,
                        proposedChallengesCount: 0,
                        archivedChallengesCount: 0,
                        obsoleteChallengesCount: 0,
                      },
                      null,
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
                        airtableId: 'recAirtableSkill5',
                        name: '@tube27',
                        validatedChallengesCount: 1,
                        proposedChallengesCount: 1,
                        archivedChallengesCount: 1,
                        obsoleteChallengesCount: 2,
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
                        validatedChallengesCount: 1,
                        proposedChallengesCount: 1,
                        archivedChallengesCount: 0,
                        obsoleteChallengesCount: 0,
                      },
                      {
                        airtableId: 'recAirtableSkill1',
                        name: '@tube14',
                        validatedChallengesCount: 1,
                        proposedChallengesCount: 0,
                        archivedChallengesCount: 0,
                        obsoleteChallengesCount: 0,
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

      expect(airtableCompetencesScope.isDone()).toBe(true);
      expect(airtableThematicsScope.isDone()).toBe(true);
      expect(airtableTubesScope.isDone()).toBe(true);
      expect(airtableSkillsScope.isDone()).toBe(true);
      expect(airtableChallengesScope.isDone()).toBe(true);
    });
  });
});
