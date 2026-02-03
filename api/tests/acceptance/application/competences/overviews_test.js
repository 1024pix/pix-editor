import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Challenge, LocalizedChallenge, Skill } from '../../../../lib/domain/models/index.js';
import { LOCALE } from '../../../../lib/domain/constants.js';

describe('Acceptance | Route | competence-overviews', () => {
  let user;
  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /competences/:id/overviews/challenges-production', () => {
    let competenceId;

    beforeEach(async function() {
      competenceId = 'recCompetence1';

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: competenceId, index: '2.2', areaId: 'area1' });

      databaseBuilder.factory.buildTranslation({
        key: 'competence.recCompetence1.name',
        locale: 'fr',
        value: 'Mon super titre',
      });

      databaseBuilder.factory.buildThematic({ id: 'recThematic1', index: 2, competenceId });
      databaseBuilder.factory.buildThematic({ id: 'recThematic2', index: 1, competenceId });
      databaseBuilder.factory.buildThematic({ id: 'recThematic3', index: 3, competenceId });
      databaseBuilder.factory.buildThematic({ id: 'recThematic4', index: 4, competenceId });

      databaseBuilder.factory.buildTranslation({
        key: 'thematic.recThematic1.name',
        locale: 'fr',
        value: 'Thématique 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.recThematic2.name',
        locale: 'fr',
        value: 'Thématique 2',
      });

      const tubes = [
        {
          id: 'recTube1',
          competenceId,
          name: '@tube1',
          index: 2,
          thematicId: 'recThematic1',
          skillIds: ['recSkill1', 'recSkill2'],
        },
        {
          id: 'recTube2',
          competenceId,
          name: '@tube2',
          index: 1,
          thematicId: 'recThematic1',
          skillIds: ['recSkill3'],
        },
        {
          id: 'recTube3',
          competenceId,
          name: '@tube3',
          index: 3,
          thematicId: 'recThematic1',
          skillIds: [],
        },
        {
          id: 'recTube4',
          competenceId,
          name: '@tube4',
          index: 1,
          thematicId: 'recThematic2',
          skillIds: ['recSkill4'],
        },
        {
          id: 'recTube5',
          competenceId,
          name: '@tube5',
          index: 2,
          thematicId: 'recThematic2',
          skillIds: ['recSkill5'],
        },
        {
          id: 'recTube6',
          competenceId,
          name: '@tube6',
          index: 1,
          thematicId: 'recThematic4',
          skillIds: [],
        },
      ];

      tubes.forEach(databaseBuilder.factory.buildTube);

      const skills = [
        {
          id: 'recSkill1',
          name: '@tube14',
          level: 4,
          status: Skill.STATUSES.ACTIF,
          competenceId,
          tubeId: 'recTube1',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          challengeIds: [
            'recChallenge1',
            'recChallenge11',
            'recChallenge12',
          ],
        },
        {
          id: 'recSkill2',
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

      const localizedFrameworkTubes = [
        { tubeId: 'recTube1', maxLevel: 3, locale: 'en' },
        { tubeId: 'recTube2', maxLevel: 8, locale: 'en' },
        { tubeId: 'recTube3', maxLevel: 8, locale: 'en' },
        { tubeId: 'recTube4', maxLevel: 8, locale: 'en' },
        { tubeId: 'recTube6', maxLevel: 8, locale: 'en' },
      ];
      localizedFrameworkTubes.forEach(databaseBuilder.factory.buildLocalizedFrameworkTubes);

      const challenges = [
        {
          id: 'recChallenge1',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.FACILEMENT,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [],
          isQualityOk: true,
        },
        {
          id: 'recChallenge11',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          locales: [LOCALE.FRENCH_FRANCE],
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge2',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.NON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [],
          isQualityOk: true,
        },
        {
          id: 'recChallenge3',
          skillId: 'recSkill3',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.FACILEMENT,
          version: 2,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [],
          isQualityOk: true,
        },
        {
          id: 'recChallenge31',
          skillId: 'recSkill3',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge4',
          skillId: 'recSkill4',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.DIFFICILEMENT,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [],
          isQualityOk: false,
        },
        {
          id: 'recChallenge5',
          skillId: 'recSkill5',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.NON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [],
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      challenges.forEach(databaseBuilder.factory.buildChallenge);

      const englishChallenges = [
        {
          id: 'recChallenge12',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          locales: [LOCALE.ENGLISH_SPOKEN],
          competenceId,
          files: [],
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      englishChallenges.forEach(databaseBuilder.factory.buildChallenge);

      const noiseChallenges = [
        {
          id: 'recChallenge21',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          declinable: Challenge.DECLINABLES.NON,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
          files: [],
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      noiseChallenges.forEach(databaseBuilder.factory.buildChallenge);

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'recChallenge1',
        challengeId: 'recChallenge1',
        locale: LOCALE.FRENCH_SPOKEN,
        toRephrase: true,
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
              'airtable-id': 'recCompetence1',
              name: '2.2 Mon super titre',
              'tubes-count': 4,
              'skills-count': 5,
              'thematic-overviews': [
                {
                  airtableId: 'recThematic2',
                  name: 'Thématique 2',
                  tubeOverviews: [
                    {
                      airtableId: 'recTube4',
                      name: '@tube4',
                      skillOverviews: [
                        {
                          id: 'recSkill4',
                          airtableId: 'recSkill4',
                          name: '@tube41',
                          prototypeId: 'recChallenge4',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: true,
                          isPrototypeQualityOk: false,
                          isPrototypeToRephrase: false,
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
                      airtableId: 'recTube5',
                      name: '@tube5',
                      skillOverviews: [
                        null,
                        null,
                        null,
                        null,
                        null,
                        {
                          id: 'recSkill5',
                          airtableId: 'recSkill5',
                          name: '@tube56',
                          prototypeId: 'recChallenge5',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: false,
                          isPrototypeQualityOk: false,
                          isPrototypeToRephrase: false,
                        },
                        null,
                      ],
                    },
                  ],
                },
                {
                  airtableId: 'recThematic1',
                  name: 'Thématique 1',
                  tubeOverviews: [
                    {
                      airtableId: 'recTube2',
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
                          airtableId: 'recSkill3',
                          name: '@tube27',
                          prototypeId: 'recChallenge3',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 1,
                          isPrototypeDeclinable: true,
                          isPrototypeQualityOk: true,
                          isPrototypeToRephrase: false,
                        },
                      ],
                    },
                    {
                      airtableId: 'recTube1',
                      name: '@tube1',
                      skillOverviews: [
                        null,
                        null,
                        {
                          id: 'recSkill2',
                          airtableId: 'recSkill2',
                          name: '@tube13',
                          prototypeId: 'recChallenge2',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: false,
                          isPrototypeQualityOk: true,
                          isPrototypeToRephrase: false,
                        },
                        {
                          id: 'recSkill1',
                          airtableId: 'recSkill1',
                          name: '@tube14',
                          prototypeId: 'recChallenge1',
                          validatedChallengesCount: 3,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: true,
                          isPrototypeQualityOk: true,
                          isPrototypeToRephrase: true,
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
      });
    });

    describe('with language filter set to english', () => {
      beforeEach(async () => {
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
      });

      it('should respond status 200 and overview of competence’s production, localized and primary english challenges', async () => {
        // given
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
              'airtable-id': 'recCompetence1',
              name: '2.2 Mon super titre',
              'tubes-count': 2,
              'skills-count': 2,
              'thematic-overviews': [
                {
                  airtableId: 'recThematic1',
                  name: 'Thématique 1',
                  tubeOverviews: [
                    {
                      airtableId: 'recTube2',
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
                          airtableId: 'recSkill3',
                          name: '@tube27',
                          prototypeId: 'recChallenge3',
                          validatedChallengesCount: 1,
                          proposedChallengesCount: 1,
                          isPrototypeDeclinable: true,
                          isPrototypeQualityOk: true,
                          isPrototypeToRephrase: false,
                        },
                      ],
                    },
                    {
                      airtableId: 'recTube1',
                      name: '@tube1',
                      skillOverviews: [
                        null,
                        null,
                        {
                          id: 'recSkill2',
                          airtableId: 'recSkill2',
                          name: '@tube13',
                          prototypeId: 'recChallenge2',
                          validatedChallengesCount: 0,
                          proposedChallengesCount: 0,
                          isPrototypeDeclinable: false,
                          isPrototypeQualityOk: true,
                          isPrototypeToRephrase: false,
                        },
                        null,
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
      });
    });
  });

  describe('GET /competences/:id/overviews/challenges-workbench', () => {
    let competenceId;

    beforeEach(async function() {
      competenceId = 'recCompetence1';

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: competenceId, index: '2.2', areaId: 'area1' });

      databaseBuilder.factory.buildTranslation({
        key: 'competence.recCompetence1.name',
        locale: 'fr',
        value: 'Mon super titre',
      });

      const thematics = [
        {
          id: 'recThematic1',
          index: 2,
          tubeIds: ['recTube1', 'recTube2'],
          competenceId,
        },
        {
          id: 'recThematic2',
          index: 1,
          tubeIds: ['recTube3', 'recTube4'],
          competenceId,
        },
        { id: 'recThematic3', index: 3, tubeIds: null, competenceId },
        {
          id: 'recThematicWorkbench',
          index: 4,
          tubeIds: ['recTubeWorkbench'],
          competenceId,
        },
      ];

      thematics.forEach(databaseBuilder.factory.buildThematic);

      databaseBuilder.factory.buildTranslation({
        key: 'thematic.recThematic1.name',
        locale: 'fr',
        value: 'Thématique 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.recThematic2.name',
        locale: 'fr',
        value: 'Thématique 2',
      });

      const tubes = [
        {
          id: 'recTube1',
          competenceId,
          name: '@tube1',
          index: 2,
          thematicId: 'recThematic1',
          skillIds: ['recSkill1', 'recSkill2'],
        },
        {
          id: 'recTube2',
          competenceId,
          name: '@tube2',
          index: 1,
          thematicId: 'recThematic1',
          skillIds: [
            'recSkill3',
            'recSkill4',
            'recSkill5',
          ],
        },
        {
          id: 'recTube3',
          competenceId,
          name: '@tube3',
          index: 3,
          thematicId: 'recThematic2',
          skillIds: ['recSkill6', 'recSkill7'],
        },
        {
          id: 'recTube4',
          competenceId,
          name: '@tube4',
          index: 4,
          thematicId: 'recThematic2',
          skillIds: [],
        },
        {
          id: 'recTubeWorkbench',
          competenceId,
          name: '@workbench',
          index: 5,
          thematicId: 'recThematicWorkbench',
          skillIds: ['recSkillWorkbench'],
        },
      ];

      tubes.forEach(databaseBuilder.factory.buildTube);

      const skills = [
        {
          id: 'recSkill1',
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

      const challenges = [
        {
          id: 'recChallenge1',
          skillId: 'recSkill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [{ fileId: 'attachment1', localizedChallengeId: 'recChallenge1' }],
        },
        {
          id: 'recChallenge2',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge21',
          skillId: 'recSkill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge3',
          skillId: 'recSkill3',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.ARCHIVE,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge4',
          skillId: 'recSkill4',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.PERIME,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge41',
          skillId: 'recSkill4',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 2,
          status: Challenge.STATUSES.VALIDE,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge5',
          skillId: 'recSkill5',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.PERIME,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge51',
          skillId: 'recSkill5',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 2,
          status: Challenge.STATUSES.PROPOSE,
          competenceId,
          files: [],
        },
        {
          id: 'recChallenge6',
          skillId: 'recSkill6',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          version: 1,
          status: Challenge.STATUSES.PERIME,
          competenceId,
          files: [],
        },
      ].map(domainBuilder.buildChallengeDatasourceObject);

      challenges.forEach(databaseBuilder.factory.buildChallenge);

      challenges.forEach((challenge) => {
        databaseBuilder.factory.buildLocalizedChallenge({ id: challenge.id, challengeId: challenge.id });
        challenge.files?.map(({ fileId }) =>
          databaseBuilder.factory.buildAttachment(
            domainBuilder.buildAttachmentDatasourceObject({
              id: fileId,
              challengeId: challenge.id,
              localizedChallengeId: challenge.id,
            }),
          ),
        );
      });

      await databaseBuilder.commit();
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
            'airtable-id': 'recCompetence1',
            name: '2.2 Mon super titre',
            'tubes-count': 3,
            'skills-count': 5,
            'thematic-overviews': [
              {
                airtableId: 'recThematic2',
                name: 'Thématique 2',
                tubeOverviews: [
                  {
                    airtableId: 'recTube3',
                    name: '@tube3',
                    skillOverviews: [
                      null,
                      {
                        airtableId: 'recSkill6',
                        name: '@tube32',
                        validatedChallengesCount: 0,
                        proposedChallengesCount: 0,
                        archivedChallengesCount: 0,
                        obsoleteChallengesCount: 1,
                      },
                      null,
                      null,
                      {
                        airtableId: 'recSkill7',
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
                airtableId: 'recThematic1',
                name: 'Thématique 1',
                tubeOverviews: [
                  {
                    airtableId: 'recTube2',
                    name: '@tube2',
                    skillOverviews: [
                      null,
                      null,
                      null,
                      null,
                      null,
                      null,
                      {
                        airtableId: 'recSkill5',
                        name: '@tube27',
                        validatedChallengesCount: 1,
                        proposedChallengesCount: 1,
                        archivedChallengesCount: 1,
                        obsoleteChallengesCount: 2,
                      },
                    ],
                  },
                  {
                    airtableId: 'recTube1',
                    name: '@tube1',
                    skillOverviews: [
                      null,
                      null,
                      {
                        airtableId: 'recSkill2',
                        name: '@tube13',
                        validatedChallengesCount: 1,
                        proposedChallengesCount: 1,
                        archivedChallengesCount: 0,
                        obsoleteChallengesCount: 0,
                      },
                      {
                        airtableId: 'recSkill1',
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
    });
  });
});
