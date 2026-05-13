import { beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';

import { databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../../test-helper';
import { createServer } from '../../../../server';
import { Challenge, LocalizedChallenge, Skill } from '../../../../lib/domain/models';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Application | Route | Skills', () => {
  let editorUser;

  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/skills/{skillId}/challenges-production', () => {
    it('returns the primary challenges list', async function() {
      // given
      const server = await createServer();
      const skillId = 'skill1';
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: skillId, tubeId: 'tube1' });

      const challengeProtoPerime = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoPerimeId',
        version: 1,
        alternativeVersion: null,
        status: Challenge.STATUSES.PERIME,
        skillId,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoPerime);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoPerimeId',
        challengeId: 'challengeProtoPerimeId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
      });
      const challengeProtoPerimeDecliPerime = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoPerimeDecliPerimeId',
        version: 1,
        alternativeVersion: 1,
        status: Challenge.STATUSES.PERIME,
        skillId,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoPerimeDecliPerime);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoPerimeDecliPerimeId',
        challengeId: 'challengeProtoPerimeDecliPerimeId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
      });
      const challengeProtoPropose = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoProposeId',
        version: 2,
        alternativeVersion: null,
        status: Challenge.STATUSES.PROPOSE,
        skillId,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoPropose);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoProposeId',
        challengeId: 'challengeProtoProposeId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
      });
      const challengeProtoProposeDecliPropose = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoProposeDecliProposeId',
        version: 2,
        alternativeVersion: 1,
        status: Challenge.STATUSES.PROPOSE,
        skillId,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoProposeDecliPropose);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoProposeDecliProposeId',
        challengeId: 'challengeProtoProposeDecliProposeId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
      });
      const challengeProtoArchive = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoArchiveId',
        version: 3,
        alternativeVersion: null,
        status: Challenge.STATUSES.ARCHIVE,
        skillId,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoArchive);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoArchiveId',
        challengeId: 'challengeProtoArchiveId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
      });
      const challengeProtoArchiveDecliArchive = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoArchiveDecliArchiveId',
        version: 3,
        alternativeVersion: 1,
        status: Challenge.STATUSES.ARCHIVE,
        skillId,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoArchiveDecliArchive);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoArchiveDecliArchiveId',
        challengeId: 'challengeProtoArchiveDecliArchiveId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
      });
      const challengeProtoValide = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoValideId',
        version: 4,
        alternativeVersion: null,
        status: Challenge.STATUSES.VALIDE,
        skillId,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoValide);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoValideId',
        challengeId: 'challengeProtoValideId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
        embedUrl: 'http://example.com/protovalide.html',
        geography: 'BR',
        urlsToConsult: ['URL PROTO VALIDE'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: false,
        toRephrase: false,
      });
      const challengeProtoValideDecliValide = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoValideDecliValideId',
        version: 4,
        alternativeVersion: 4,
        status: Challenge.STATUSES.VALIDE,
        skillId,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        competenceId: 'competence1',
        files: [],
      });
      databaseBuilder.factory.buildChallenge(challengeProtoValideDecliValide);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoValideDecliValideId',
        challengeId: 'challengeProtoValideDecliValideId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
        embedUrl: 'http://example.com/declivalide.html',
        geography: 'NZ',
        urlsToConsult: ['URL DECLI VALIDE'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: true,
        toRephrase: true,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeProtoValideId',
        challengeId: 'challengeProtoValideId',
        locale: 'nl',
        status: LocalizedChallenge.STATUSES.PLAY,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/skills/${skillId}/challenges-production`,
        headers: {
          ...generateAuthorizationHeader(editorUser),
          host: 'host.site',
        },
      });

      // Then
      expect(response.statusCode).to.equal(200);
      const returnedChallengeIds = response.result.data.map((item) => item.id);
      expect(returnedChallengeIds).toStrictEqual(['challengeProtoValideId', 'challengeProtoValideDecliValideId']);
    });
  });

  describe('GET /api/skills', () => {
    describe('with no filters', () => {
      beforeEach(async () => {
        const skills = [
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill1',
            airtableId: 'skill1',
            createdAt: '2025-01-06T13:50:47Z',
            description: 'premier acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            level: 4,
            name: '@skill4',
            pixValue: 1.5,
            status: Skill.STATUSES.ACTIF,
            version: 1,
            tubeId: 'tube1',
            tubeAirtableId: 'tube1',
            tutorialIds: ['tuto1'],
            tutorialAirtableIds: ['tuto1'],
            learningMoreTutorialIds: ['tuto2', 'tuto3'],
            learningMoreTutorialAirtableIds: ['tuto2', 'tuto3'],
            challengeIds: ['challenge1', 'challenge2'],
            competenceId: 'competence1',
          }),
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill2',
            airtableId: 'skill2',
            createdAt: '2025-01-06T13:51:04Z',
            description: 'deuxième acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.PROPOSE,
            hintStatus: Skill.HINT_STATUSES.PROPOSE,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            level: 3,
            name: '@acquis3',
            pixValue: 1.8,
            status: Skill.STATUSES.EN_CONSTRUCTION,
            version: 2,
            tubeId: 'tube2',
            tubeAirtableId: 'tube2',
            tutorialIds: ['tuto2'],
            tutorialAirtableIds: ['tuto2'],
            learningMoreTutorialIds: ['tuto3', 'tuto4'],
            learningMoreTutorialAirtableIds: ['tuto3', 'tuto4'],
            challengeIds: [
              'challenge3',
              'challenge4',
              'challenge5',
            ],
            competenceId: 'competence1',
          }),
        ];

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@skill', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@acquis', thematicId: 'thematic1' });

        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto1', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto2', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto3', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto4', tagIds: [] }));

        skills.forEach((skill) => {
          databaseBuilder.factory.buildSkill(skill);
          skill.challengeIds.forEach((id, index) => {
            const genealogy = index === 0 ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON;
            return databaseBuilder.factory.buildChallenge(domainBuilder.buildChallenge({ id, skillId: skill.id, genealogy }));
          });
        });

        databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'fr', value: 'Un indice' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'en', value: 'A clue' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill2.hint', locale: 'fr', value: 'Un autre indice' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill2.hint', locale: 'en', value: 'An other clue' });

        await databaseBuilder.commit();
      });

      it('should respond with status 200 and skills', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/skills',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'skills',
              id: 'skill1',
              attributes: {
                'pix-id': 'skill1',
                clue: 'Un indice',
                'clue-en': 'A clue',
                'clue-status': 'Validé',
                'created-at': new Date('2025-01-06T13:50:47Z'),
                description: 'premier acquis',
                'description-status': 'Validé',
                i18n: 'France',
                level: 4,
                name: '@skill4',
                status: 'actif',
                version: 1,
              },
              relationships: {
                challenges: {
                  data: [
                    {
                      id: 'challenge1',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge2',
                      type: 'challenges',
                    },
                  ],
                },
                tube: {
                  data: {
                    id: 'tube1',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'tuto2',
                      type: 'tutorials',
                    },
                    {
                      id: 'tuto3',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'tuto1',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': { links: { related: '/api/skills/skill1/challenges-production' } },
              },
            },
            {
              type: 'skills',
              id: 'skill2',
              attributes: {
                'pix-id': 'skill2',
                clue: 'Un autre indice',
                'clue-en': 'An other clue',
                'clue-status': 'Proposé',
                'created-at': new Date('2025-01-06T13:51:04Z'),
                description: 'deuxième acquis',
                'description-status': 'Proposé',
                i18n: 'Monde',
                level: 3,
                name: '@acquis3',
                status: 'en construction',
                version: 2,
              },
              relationships: {
                challenges: {
                  data: [
                    {
                      id: 'challenge3',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge4',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge5',
                      type: 'challenges',
                    },
                  ],
                },
                tube: {
                  data: {
                    id: 'tube2',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'tuto3',
                      type: 'tutorials',
                    },
                    {
                      id: 'tuto4',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'tuto2',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': { links: { related: '/api/skills/skill2/challenges-production' } },
              },
            },
          ],
        });
      });
    });

    describe('with ids filter', () => {
      beforeEach(async () => {
        const skill1 = domainBuilder.buildSkillDatasourceObject({
          id: 'skill1',
          airtableId: 'skill1',
          createdAt: '2025-01-06T13:50:47Z',
          description: 'premier acquis',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          level: 4,
          name: '@skill4',
          pixValue: 1.5,
          status: Skill.STATUSES.ACTIF,
          version: 1,
          tubeId: 'tube1',
          tubeAirtableId: 'tube1',
          tutorialIds: ['tuto1'],
          tutorialAirtableIds: ['tuto1'],
          learningMoreTutorialIds: ['tuto2', 'tuto3'],
          learningMoreTutorialAirtableIds: ['tuto2', 'tuto3'],
          challengeIds: ['challenge1', 'challenge2'],
          competenceId: 'competence1',
        });
        const skill2 = domainBuilder.buildSkillDatasourceObject({
          id: 'skill2',
          airtableId: 'skill2',
          createdAt: '2025-01-06T13:51:04Z',
          description: 'deuxième acquis',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.PROPOSE,
          hintStatus: Skill.HINT_STATUSES.PROPOSE,
          internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
          level: 3,
          name: '@skill3',
          pixValue: 1.8,
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: 2,
          tubeId: 'tube2',
          tubeAirtableId: 'tube2',
          tutorialIds: ['tuto2'],
          tutorialAirtableIds: ['tuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          learningMoreTutorialAirtableIds: ['tuto3', 'tuto4'],
          challengeIds: [
            'challenge3',
            'challenge4',
            'challenge5',
          ],
          competenceId: 'competence1',
        });

        databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'fr', value: 'Un indice' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'en', value: 'A clue' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill2.hint', locale: 'fr', value: 'Un autre indice' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill2.hint', locale: 'en', value: 'An other clue' });

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@skill', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@skill', thematicId: 'thematic1' });
        [
          'tuto1',
          'tuto2',
          'tuto3',
          'tuto4',
        ].forEach((tutorialId) => {
          databaseBuilder.factory.buildTutorial(
            domainBuilder.buildTutorialDatasourceObject({
              id: tutorialId,
              tagIds: [],
            }),
          );
        });
        databaseBuilder.factory.buildSkill(skill1);
        databaseBuilder.factory.buildSkill(skill2);
        skill1.challengeIds.forEach((challengeId, index) => {
          databaseBuilder.factory.buildChallenge(
            domainBuilder.buildChallengeDatasourceObject({
              id: challengeId,
              skillId: skill1.id,
              genealogy: index === 0 ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON,
            }),
          );
        });

        skill2.challengeIds.forEach((challengeId, index) => {
          databaseBuilder.factory.buildChallenge(
            domainBuilder.buildChallengeDatasourceObject({
              id: challengeId,
              skillId: skill2.id,
              genealogy: index === 0 ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON,
            }),
          );
        });

        await databaseBuilder.commit();
      });

      it('should respond with status 200 and skills', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/skills?filter[ids][]=skill1&filter[ids][]=skill2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'skills',
              id: 'skill1',
              attributes: {
                'pix-id': 'skill1',
                clue: 'Un indice',
                'clue-en': 'A clue',
                'clue-status': 'Validé',
                'created-at': new Date('2025-01-06T13:50:47Z'),
                description: 'premier acquis',
                'description-status': 'Validé',
                i18n: 'France',
                level: 4,
                name: '@skill4',
                status: 'actif',
                version: 1,
              },
              relationships: {
                challenges: {
                  data: [
                    {
                      id: 'challenge1',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge2',
                      type: 'challenges',
                    },
                  ],
                },
                tube: {
                  data: {
                    id: 'tube1',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'tuto2',
                      type: 'tutorials',
                    },
                    {
                      id: 'tuto3',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'tuto1',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': { links: { related: '/api/skills/skill1/challenges-production' } },
              },
            },
            {
              type: 'skills',
              id: 'skill2',
              attributes: {
                'pix-id': 'skill2',
                clue: 'Un autre indice',
                'clue-en': 'An other clue',
                'clue-status': 'Proposé',
                'created-at': new Date('2025-01-06T13:51:04Z'),
                description: 'deuxième acquis',
                'description-status': 'Proposé',
                i18n: 'Monde',
                level: 3,
                name: '@skill3',
                status: 'en construction',
                version: 2,
              },
              relationships: {
                challenges: {
                  data: [
                    {
                      id: 'challenge3',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge4',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge5',
                      type: 'challenges',
                    },
                  ],
                },
                tube: {
                  data: {
                    id: 'tube2',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'tuto3',
                      type: 'tutorials',
                    },
                    {
                      id: 'tuto4',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'tuto2',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': { links: { related: '/api/skills/skill2/challenges-production' } },
              },
            },
          ],
        });
      });
    });

    describe('with name filter, page limit and sort', () => {
      beforeEach(async () => {
        const skills = [
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill1',
            airtableId: 'skill1',
            createdAt: '2025-01-06T13:50:47Z',
            description: 'premier acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            level: 3,
            name: '@skill3',
            pixValue: 1.5,
            status: Skill.STATUSES.ACTIF,
            version: 1,
            tubeId: 'tube1',
            tubeAirtableId: 'tube1',
            tutorialIds: ['tuto1'],
            tutorialAirtableIds: ['tuto1'],
            learningMoreTutorialIds: ['tuto2', 'tuto3'],
            learningMoreTutorialAirtableIds: ['tuto2', 'tuto3'],
            challengeIds: ['challenge1', 'challenge2'],
            competenceId: 'competence1',
          }),
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill2',
            airtableId: 'skill2',
            createdAt: '2025-01-06T13:51:04Z',
            description: 'deuxième acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.PROPOSE,
            hintStatus: Skill.HINT_STATUSES.PROPOSE,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            level: 4,
            name: '@skill4',
            pixValue: 1.8,
            status: Skill.STATUSES.EN_CONSTRUCTION,
            version: 2,
            tubeId: 'tube2',
            tubeAirtableId: 'tube2',
            tutorialIds: ['tuto2'],
            tutorialAirtableIds: ['tuto2'],
            learningMoreTutorialIds: ['tuto3', 'tuto4'],
            learningMoreTutorialAirtableIds: ['tuto3', 'tuto4'],
            challengeIds: [
              'challenge3',
              'challenge4',
              'challenge5',
            ],
            competenceId: 'competence1',
          }),
        ];

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@skill', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@skill', thematicId: 'thematic1' });

        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto1', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto2', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto3', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto4', tagIds: [] }));

        skills.forEach((skill) => {
          databaseBuilder.factory.buildSkill(skill);

          skill.challengeIds.forEach((id, index) =>
            databaseBuilder.factory.buildChallenge(
              domainBuilder.buildChallengeDatasourceObject({
                id,
                skillId: skill.id,
                genealogy: index === 0 ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON,
              }),
            ),
          );
        });

        databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'fr', value: 'Un indice' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'en', value: 'A clue' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill2.hint', locale: 'fr', value: 'Un autre indice' });
        databaseBuilder.factory.buildTranslation({ key: 'skill.skill2.hint', locale: 'en', value: 'An other clue' });

        await databaseBuilder.commit();
      });

      it('should respond with status 200 and skills', async () => {
        // given
        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/skills?filter[name]=@SkiL&page[limit]=10&sort=name',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'skills',
              id: 'skill1',
              attributes: {
                'pix-id': 'skill1',
                clue: 'Un indice',
                'clue-en': 'A clue',
                'clue-status': 'Validé',
                'created-at': new Date('2025-01-06T13:50:47Z'),
                description: 'premier acquis',
                'description-status': 'Validé',
                i18n: 'France',
                level: 3,
                name: '@skill3',
                status: 'actif',
                version: 1,
              },
              relationships: {
                challenges: {
                  data: [
                    {
                      id: 'challenge1',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge2',
                      type: 'challenges',
                    },
                  ],
                },
                tube: {
                  data: {
                    id: 'tube1',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'tuto2',
                      type: 'tutorials',
                    },
                    {
                      id: 'tuto3',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'tuto1',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': { links: { related: '/api/skills/skill1/challenges-production' } },
              },
            },
            {
              type: 'skills',
              id: 'skill2',
              attributes: {
                'pix-id': 'skill2',
                clue: 'Un autre indice',
                'clue-en': 'An other clue',
                'clue-status': 'Proposé',
                'created-at': new Date('2025-01-06T13:51:04Z'),
                description: 'deuxième acquis',
                'description-status': 'Proposé',
                i18n: 'Monde',
                level: 4,
                name: '@skill4',
                status: 'en construction',
                version: 2,
              },
              relationships: {
                challenges: {
                  data: [
                    {
                      id: 'challenge3',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge4',
                      type: 'challenges',
                    },
                    {
                      id: 'challenge5',
                      type: 'challenges',
                    },
                  ],
                },
                tube: {
                  data: {
                    id: 'tube2',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'tuto3',
                      type: 'tutorials',
                    },
                    {
                      id: 'tuto4',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'tuto2',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': { links: { related: '/api/skills/skill2/challenges-production' } },
              },
            },
          ],
        });
      });
    });
  });

  describe('GET /api/skills/{skillAirtableId}', () => {
    beforeEach(async () => {
      const skill = domainBuilder.buildSkillDatasourceObject({
        id: 'skill1',
        airtableId: 'skill1',
        createdAt: '2025-01-06T13:50:47Z',
        description: 'premier acquis',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
        hintStatus: Skill.HINT_STATUSES.VALIDE,
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        level: 4,
        name: '@skill4',
        pixValue: 1.5,
        status: Skill.STATUSES.ACTIF,
        version: 1,
        tubeId: 'tube1',
        tubeAirtableId: 'tube1',
        tutorialIds: ['tuto1'],
        tutorialAirtableIds: ['tuto1'],
        learningMoreTutorialIds: ['tuto2', 'tuto3'],
        learningMoreTutorialAirtableIds: ['tuto2', 'tuto3'],
        challengeIds: ['challenge1', 'challenge2'],
        competenceId: 'competence1',
      });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@skill', thematicId: 'thematic1' });
      [...skill.tutorialIds, ...skill.learningMoreTutorialIds].forEach((tutorialId) => {
        databaseBuilder.factory.buildTutorial(
          domainBuilder.buildTutorialDatasourceObject({
            id: tutorialId,
            tagIds: [],
          }),
        );
      });
      databaseBuilder.factory.buildSkill(skill);
      skill.challengeIds.forEach((challengeId, index) => {
        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({
            id: challengeId,
            skillId: skill.id,
            genealogy: index === 0 ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON,
          }),
        );
      });

      databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'fr', value: 'Un indice' });
      databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'en', value: 'A clue' });

      await databaseBuilder.commit();
    });

    it('should respond with status 200 and areas', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/skills/skill1',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'skills',
          id: 'skill1',
          attributes: {
            'pix-id': 'skill1',
            clue: 'Un indice',
            'clue-en': 'A clue',
            'clue-status': 'Validé',
            'created-at': new Date('2025-01-06T13:50:47Z'),
            description: 'premier acquis',
            'description-status': 'Validé',
            i18n: 'France',
            level: 4,
            name: '@skill4',
            status: 'actif',
            version: 1,
          },
          relationships: {
            challenges: {
              data: [
                {
                  id: 'challenge1',
                  type: 'challenges',
                },
                {
                  id: 'challenge2',
                  type: 'challenges',
                },
              ],
            },
            tube: {
              data: {
                id: 'tube1',
                type: 'tubes',
              },
            },
            'tuto-more': {
              data: [
                {
                  id: 'tuto2',
                  type: 'tutorials',
                },
                {
                  id: 'tuto3',
                  type: 'tutorials',
                },
              ],
            },
            'tuto-solution': {
              data: [
                {
                  id: 'tuto1',
                  type: 'tutorials',
                },
              ],
            },
            'challenges-production': { links: { related: '/api/skills/skill1/challenges-production' } },
          },
        },
      });
    });
  });

  describe('POST /api/skills', async () => {
    let pixApiCacheScope, dataToPost;

    beforeEach(async () => {
      const tube = {
        id: 'tube1',
        airtableId: 'tube1',
        name: '@tube',
        index: 5,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillIds: ['skill1Tube1', 'skill2Tube1'],
      };

      const skills = [
        domainBuilder.buildSkillDatasourceObject({
          id: 'skill1Tube1',
          airtableId: 'skill1Tube1',
          tubeId: 'tube1',
          tubeAirtableId: 'tube1',
          level: 1,
          version: 1,
          name: '@tube1',
          competenceId: 'competence1',
          challengeIds: [],
          tutorialIds: ['tutorial1', 'tutorial3'],
          learningMoreTutorialIds: ['tutorial2'],
        }),
        domainBuilder.buildSkillDatasourceObject({
          id: 'skill2Tube1',
          airtableId: 'skill2Tube1',
          tubeId: 'tube1',
          tubeAirtableId: 'tube1',
          level: 2,
          name: '@tube2',
          competenceId: 'competence1',
          challengeIds: [],
          tutorialIds: ['tutorial2', 'tutorial3'],
          learningMoreTutorialIds: [],
        }),
      ];

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube(tube);
      databaseBuilder.factory.buildTutorial({
        id: 'tutorial1',
        title: 'title tuto1',
        duration: 'duration tuto1',
        source: 'source tuto1',
        format: 'format tuto1',
        link: 'link tuto1',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tutorial2',
        title: 'title tuto2',
        duration: 'duration tuto2',
        source: 'source tuto2',
        format: 'format tuto2',
        link: 'link tuto2',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tutorial3',
        title: 'title tuto3',
        duration: 'duration tuto3',
        source: 'source tuto3',
        format: 'format tuto3',
        link: 'link tuto3',
        locale: 'fr',
      });
      skills.forEach(databaseBuilder.factory.buildSkill);
      await databaseBuilder.commit();

      dataToPost = {
        level: 1,
        description: 'La description de mon nouvel acquis',
        descriptionStatus: 'Un statut de description pour mon nouvel acquis',
        hint: 'L indice de mon nouvel acquis',
        hintEn: 'L indice EN de mon nouvel acquis',
        hintStatus: 'Le statut de l indice de mon nouvel acquis',
        internationalisation: 'Internationalisation de mon nouvel acquis',
        tubeAirtableId: 'tube1',
        tutorialAirtableIds: ['tutorial1', 'tutorial3'],
        learningMoreTutorialAirtableIds: ['tutorial2'],
      };

      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('nouvelAcquis');
      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: pixApiToken });
      pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/skills/nouvelAcquis', {
          id: 'nouvelAcquis',
          name: '@tube1',
          hintStatus: dataToPost.hintStatus,
          tutorialIds: dataToPost.tutorialAirtableIds,
          learningMoreTutorialIds: dataToPost.learningMoreTutorialAirtableIds,
          competenceId: 'competence1',
          status: 'en construction',
          tubeId: dataToPost.tubeAirtableId,
          level: dataToPost.level,
          version: 2,
          hint_i18n: {
            fr: dataToPost.hint,
            en: dataToPost.hintEn,
          },
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
    });

    it('should respond with status 201 and created skill', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/skills',
        payload: {
          data: {
            type: 'skills',
            attributes: {
              level: dataToPost.level,
              clue: dataToPost.hint,
              'clue-en': dataToPost.hintEn,
              'clue-status': dataToPost.hintStatus,
              description: dataToPost.description,
              'description-status': dataToPost.descriptionStatus,
              i18n: dataToPost.internationalisation,
              status: 'en construction',
              version: 2,
            },
            relationships: {
              tube: {
                data: {
                  type: 'tubes',
                  id: dataToPost.tubeAirtableId,
                },
              },
              'tuto-solution': {
                data: [
                  {
                    type: 'tutorials',
                    id: dataToPost.tutorialAirtableIds[0],
                  },
                  {
                    type: 'tutorials',
                    id: dataToPost.tutorialAirtableIds[1],
                  },
                ],
              },
              'tuto-more': {
                data: [
                  {
                    type: 'tutorials',
                    id: dataToPost.learningMoreTutorialAirtableIds[0],
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
          type: 'skills',
          id: 'nouvelAcquis',
          attributes: {
            name: '@tube1',
            clue: 'L indice de mon nouvel acquis',
            'clue-en': 'L indice EN de mon nouvel acquis',
            'clue-status': 'Le statut de l indice de mon nouvel acquis',
            'created-at': expect.any(Date),
            description: 'La description de mon nouvel acquis',
            'description-status': 'Un statut de description pour mon nouvel acquis',
            level: 1,
            status: 'en construction',
            i18n: 'Internationalisation de mon nouvel acquis',
            'pix-id': 'nouvelAcquis',
            version: 2,
          },
          relationships: {
            tube: {
              data: {
                id: 'tube1',
                type: 'tubes',
              },
            },
            'tuto-more': {
              data: [
                {
                  id: 'tutorial2',
                  type: 'tutorials',
                },
              ],
            },
            'tuto-solution': {
              data: [
                {
                  id: 'tutorial1',
                  type: 'tutorials',
                },
                {
                  id: 'tutorial3',
                  type: 'tutorials',
                },
              ],
            },
            challenges: { data: [] },
            'challenges-production': { links: { related: '/api/skills/nouvelAcquis/challenges-production' } },
          },
        },
      });

      expect(pixApiCacheScope.isDone()).to.be.true;

      await expect(knex.select('*').from('skills').where('id', 'nouvelAcquis').first()).resolves.toStrictEqual({
        id: 'nouvelAcquis',
        description: 'La description de mon nouvel acquis',
        descriptionStatus: 'Un statut de description pour mon nouvel acquis',
        hintStatus: 'Le statut de l indice de mon nouvel acquis',
        internationalisation: 'Internationalisation de mon nouvel acquis',
        level: 1,
        status: 'en construction',
        tubeId: 'tube1',
        version: 2,
        activatedAt: null,
        archivedAt: null,
        obsoletedAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([{ key: 'skill.nouvelAcquis.hint', locale: 'en', value: 'L indice EN de mon nouvel acquis' }, { key: 'skill.nouvelAcquis.hint', locale: 'fr', value: 'L indice de mon nouvel acquis' }]);

      await expect(
        knex.select('*').from('skills-tutorials').where('skillId', 'nouvelAcquis').orderBy(['type', 'tutorialId']),
      ).resolves.toStrictEqual([
        {
          type: 'learningMore',
          skillId: 'nouvelAcquis',
          tutorialId: 'tutorial2',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          type: 'understanding',
          skillId: 'nouvelAcquis',
          tutorialId: 'tutorial1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          type: 'understanding',
          skillId: 'nouvelAcquis',
          tutorialId: 'tutorial3',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('PATCH /api/skills/{skillAirtableId}', () => {
    let skillPayload;
    let skillDataObject;

    beforeEach(async function() {
      const skillAttributes = {
        description: 'une nouvelle description',
        'description-status': Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        clue: 'AAA',
        'clue-en': 'BBB',
        'clue-status': Skill.HINT_STATUSES.A_RETRAVAILLER,
        i18n: Skill.INTERNATIONALISATIONS.FRANCE,
        status: Skill.STATUSES.ACTIF,
      };

      skillDataObject = domainBuilder.buildSkillDatasourceObject({
        airtableId: 'skillAirtableId',
        id: 'skillIdPersistant',
        name: '@foo7',
        hintStatus: skillAttributes['clue-status'],
        tutorialIds: ['tutorialIdPersistant'],
        learningMoreTutorialIds: ['tutorialLMIdPersistant'],
        competenceId: 'competence1',
        pixValue: 789,
        status: skillAttributes['status'],
        tubeId: 'tubeIdPersistant',
        tubeAirtableId: 'tubeAirtableId',
        description: skillAttributes['description'],
        descriptionStatus: skillAttributes['description-status'],
        level: 7,
        internationalisation: skillAttributes['i18n'],
        version: 5,
        challengeIds: ['challengeIdPersistantA', 'challengeIdPersistantB'],
        createdAt: '2025-01-06T08:58:57Z',
      });

      skillPayload = {
        data: {
          type: 'skills',
          attributes: {
            description: 'new description',
            'description-status': 'new description-status',
            clue: 'new clue',
            'clue-en': 'new clueEn',
            'clue-status': 'new clueStatus',
            i18n: 'new i18n',
            status: 'new status',
          },
          relationships: {
            'tuto-more': { data: [{ type: 'tutorials', id: 'tutorialLMIdPersistant' }, { type: 'tutorials', id: 'tutorialLMNewIdPersistant' }] },
            'tuto-solution': { data: [{ type: 'tutorials', id: 'tutorialIdPersistant' }] },
          },
        },
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: skillDataObject.tubeId, name: '@foo', thematicId: 'thematic1' });
      databaseBuilder.factory.buildTutorial({
        id: 'tutorialIdPersistant',
        title: 'title tuto1',
        duration: 'duration tuto1',
        source: 'source tuto1',
        format: 'format tuto1',
        link: 'link tuto1',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tutorialLMIdPersistant',
        title: 'title tuto2',
        duration: 'duration tuto2',
        source: 'source tuto2',
        format: 'format tuto2',
        link: 'link tuto2',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tutorialLMNewIdPersistant',
        title: 'title tuto3',
        duration: 'duration tuto3',
        source: 'source tuto3',
        format: 'format tuto3',
        link: 'link tuto3',
        locale: 'fr',
      });
      databaseBuilder.factory.buildSkill(skillDataObject);
      skillDataObject.challengeIds.forEach((challengeId, index) => {
        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({
            id: challengeId,
            skillId: skillDataObject.id,
            genealogy: index === 0 ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON,
          }),
        );
      });

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'skill.skillIdPersistant.hint',
        value: 'Pouet',
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'skill.skillIdPersistant.hint',
        value: 'Toot',
      });

      await databaseBuilder.commit();
    });

    it('should patch skill', async () => {
      // Given
      const skillPatched = {
        ...skillDataObject,
        hintStatus: skillPayload.data.attributes['clue-status'],
        learningMoreTutorialIds: ['tutorialLMIdPersistant', 'tutorialLMNewIdPersistant'],
        learningMoreTutorialAirtableIds: ['tutorialLMAirtableId', 'tutorialLMNewAirtableId'],
        status: skillPayload.data.attributes.status,
        description: skillPayload.data.attributes.description,
        descriptionStatus: skillPayload.data.attributes['description-status'],
        internationalisation: skillPayload.data.attributes.i18n,
      };

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: pixApiToken });

      const pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/skills/skillIdPersistant', {
          id: skillPatched.id,
          name: skillPatched.name,
          hintStatus: skillPatched.hintStatus,
          tutorialIds: skillPatched.tutorialIds,
          learningMoreTutorialIds: skillPatched.learningMoreTutorialIds,
          competenceId: skillPatched.competenceId,
          status: skillPatched.status,
          tubeId: skillPatched.tubeId,
          level: skillPatched.level,
          version: skillPatched.version,
          hint_i18n: {
            fr: skillPayload.data.attributes.clue,
            en: skillPayload.data.attributes['clue-en'],
          },
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);

      const server = await createServer();
      // When
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/skills/skillIdPersistant',
        headers: generateAuthorizationHeader(editorUser),
        payload: skillPayload,
      });

      // Then
      expect(response.statusCode).toBe(200);
      expect(pixApiCacheScope.isDone()).toBe(true);

      await expect(knex.select('*').from('skills')).resolves.toStrictEqual([
        {
          id: skillPatched.id,
          description: skillPatched.description,
          descriptionStatus: skillPatched.descriptionStatus,
          hintStatus: skillPatched.hintStatus,
          internationalisation: skillPatched.internationalisation,
          level: skillPatched.level,
          status: skillPatched.status,
          tubeId: skillPatched.tubeId,
          version: skillPatched.version,
          activatedAt: null,
          archivedAt: null,
          obsoletedAt: null,
          createdAt: new Date(skillPatched.createdAt),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex('translations').select('key', 'locale', 'value').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([
        {
          key: 'skill.skillIdPersistant.hint',
          locale: 'en',
          value: 'new clueEn',
        },
        {
          key: 'skill.skillIdPersistant.hint',
          locale: 'fr',
          value: 'new clue',
        },
      ]);

      await expect(knex.select('*').from('skills-tutorials').orderBy(['type', 'tutorialId'])).resolves.toStrictEqual([
        {
          type: 'learningMore',
          skillId: 'skillIdPersistant',
          tutorialId: 'tutorialLMIdPersistant',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          type: 'learningMore',
          skillId: 'skillIdPersistant',
          tutorialId: 'tutorialLMNewIdPersistant',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          type: 'understanding',
          skillId: 'skillIdPersistant',
          tutorialId: 'tutorialIdPersistant',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe("when resources doesn't exists", () => {
      it('Should not patch and return 404 code', async () => {
        // Given
        const server = await createServer();
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/skills/skillAirtableId',
          headers: generateAuthorizationHeader(editorUser),
          payload: skillPayload,
        });

        // Then
        expect(response.statusCode).to.equal(404);

        await expect(
          knex('translations').select('key', 'locale', 'value').orderBy(['key', 'locale']),
        ).resolves.toStrictEqual([
          {
            key: 'skill.skillIdPersistant.hint',
            locale: 'en',
            value: 'Toot',
          },
          {
            key: 'skill.skillIdPersistant.hint',
            locale: 'fr',
            value: 'Pouet',
          },
        ]);
      });
    });
  });

  describe('POST /api/skills/clone', async () => {
    let pixApiCacheSkillUpdateScope, pixApiCacheChallengeUpdateScope, dataToPost, skillToClone;

    beforeEach(async () => {
      // given
      skillToClone = domainBuilder.buildSkillDatasourceObject({
        id: 'skill1Tube1',
        airtableId: 'skill1Tube1',
        tubeId: 'tube1',
        tubeAirtableId: 'tube1',
        name: '@tube1',
        level: 1,
        version: 1,
        competenceId: 'competence1',
        challengeIds: ['validatedChallengeProto'],
      });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      [...skillToClone.tutorialIds, ...skillToClone.learningMoreTutorialIds].forEach((id) =>
        databaseBuilder.factory.buildTutorial({
          id,
          title: `title ${id}`,
          duration: `duration ${id}`,
          source: `source ${id}`,
          format: `format ${id}`,
          link: `link ${id}`,
          locale: 'fr',
        }),
      );

      dataToPost = {
        level: 2,
        skillIdToClone: 'skill1Tube1',
        tubeDestinationId: 'tube1',
      };
      const tube = {
        id: 'tube1',
        airtableId: 'tube1',
        name: '@tube',
        index: 5,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillIds: ['skill1Tube1', 'skill2Tube1'],
      };
      databaseBuilder.factory.buildTube(tube);
      const skillAlreadyAtDestinationTubeLevel = domainBuilder.buildSkillDatasourceObject({
        id: 'skill2Tube1',
        airtableId: 'skill2Tube1',
        tubeId: 'tube1',
        tubeAirtableId: 'tube1',
        level: 2,
        version: 1,
        name: '@tube2',
        competenceId: 'competence1',
        challengeIds: [],
      });
      databaseBuilder.factory.buildSkill(skillAlreadyAtDestinationTubeLevel);
      databaseBuilder.factory.buildSkill(skillToClone);

      const skillTradFr = databaseBuilder.factory.buildTranslation({
        key: 'skill.skill1Tube1.hint',
        locale: 'fr',
        value: "C'est chaud-nen",
      });
      const skillTradEn = databaseBuilder.factory.buildTranslation({
        key: 'skill.skill1Tube1.hint',
        locale: 'en',
        value: 'AIRTABLE IS SO FUN OMG 🥰',
      });
      const protoId = 'validatedChallengeProto';
      const validatedDomainChallengeProtoToClone = domainBuilder.buildChallengeDatasourceObject({
        id: protoId,
        airtableId: 'recChallengeValidated',
        assessmentMaintenanceTags: ['Fichier simple à traduire'],
        translationMaintenanceTags: ['date de péremption connue'],
        status: 'validé',
        isQualityOk: true,
        locales: ['fr'],
        skillId: skillToClone.id,
        skills: [skillToClone],
        competenceId: 'competence1',
        files: [{ fileId: 'attachmentId', localizedChallengeId: protoId }],
      });
      databaseBuilder.factory.buildChallenge(validatedDomainChallengeProtoToClone);
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${protoId}.instruction`,
        locale: 'fr',
        value: 'Juste une trad ?',
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${protoId}.instruction`,
        locale: 'nl',
        value: 'Slechts een vertaling ?',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: protoId,
        challengeId: protoId,
        locale: 'fr',
        embedUrl: validatedDomainChallengeProtoToClone.embedUrl,
        status: validatedDomainChallengeProtoToClone.status,
        geography: 'FR',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'validatedChallengeProtoNl',
        challengeId: protoId,
        locale: 'nl',
        geography: 'FR',
      });
      const attachmentData = domainBuilder.buildAttachmentDatasourceObject({
        challengeId: protoId,
        localizedChallengeId: protoId,
        type: 'illustration',
        url: 'url/to/attachment',
        mimeType: 'image/jpeg',
        filename: 'nom_fichier',
      });
      databaseBuilder.factory.buildAttachment(attachmentData);

      const skillForPixApi = {
        id: 'clonedAcquisId',
        name: '@tube2',
        hintStatus: skillToClone.hintStatus,
        tutorialIds: skillToClone.tutorialIds,
        learningMoreTutorialIds: skillToClone.learningMoreTutorialIds,
        competenceId: 'competence1',
        status: 'en construction',
        tubeId: dataToPost.tubeDestinationId,
        level: 2,
        version: skillAlreadyAtDestinationTubeLevel.version + 1,
        hint_i18n: {
          fr: skillTradFr.value,
          en: skillTradEn.value,
        },
      };
      const challengeForPixApi = {
        id: 'clonedChallengeId',
        alternativeInstruction: '',
        autoReply: false,
        competenceId: 'competence1',
        embedUrl: 'https://github.io/page/epreuve.html',
        embedTitle: '',
        embedHeight: 500,
        focusable: false,
        format: 'mots',
        genealogy: 'Prototype 1',
        illustrationAlt: null,
        illustrationUrl: 'url/to/attachment',
        instruction: 'Juste une trad ?',
        locales: ['fr'],
        proposals: '',
        responsive: 'Non',
        solution: '',
        solutionToDisplay: '',
        status: 'proposé',
        skillId: 'clonedAcquisId',
        t1Status: true,
        t2Status: false,
        t3Status: true,
        timer: 1234,
        type: 'QCM',
        shuffled: false,
        alternativeVersion: null,
        accessibility1: 'OK',
        accessibility2: 'RAS',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: 'RAS',
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      };

      // update pix api staging cache

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: pixApiToken });

      pixApiCacheSkillUpdateScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/skills/clonedAcquisId', skillForPixApi)
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);

      pixApiCacheChallengeUpdateScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/challenges/clonedChallengeId', challengeForPixApi)
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);

      await databaseBuilder.commit();

      vi.spyOn(idGenerator, 'generateNewId')
        .mockReturnValueOnce('clonedAcquisId')
        .mockReturnValueOnce('clonedChallengeId');
    });

    it('should respond with status 302 with cloned skill redirection', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/skills/clone',
        payload: {
          data: {
            type: 'skills',
            attributes: {
              level: dataToPost.level,
              tubeDestinationId: dataToPost.tubeDestinationId,
              skillIdToClone: dataToPost.skillIdToClone,
            },
          },
        },
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/api/skills/clonedAcquisId');

      await expect(knex.select('*').from('skills').where('id', 'clonedAcquisId').first()).resolves.toStrictEqual({
        description: 'skill description',
        descriptionStatus: 'Validé',
        hintStatus: 'Validé',
        id: 'clonedAcquisId',
        internationalisation: 'Monde',
        level: 2,
        status: 'en construction',
        tubeId: 'tube1',
        version: 2,
        activatedAt: null,
        archivedAt: null,
        obsoletedAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      await expect(
        knex.select('*').from('skills-tutorials').where('skillId', 'clonedAcquisId').orderBy(['type', 'tutorialId']),
      ).resolves.toStrictEqual([
        ...skillToClone.learningMoreTutorialIds.toSorted().map((tutorialId) => ({
          type: 'learningMore',
          skillId: 'clonedAcquisId',
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
        ...skillToClone.tutorialIds.map((tutorialId) => ({
          type: 'understanding',
          skillId: 'clonedAcquisId',
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
      ]);

      await expect(knex.select('*').from('challenges').where('skillId', 'clonedAcquisId')).resolves.toStrictEqual([
        {
          accessibility1: 'OK',
          accessibility2: 'RAS',
          alternativeVersion: null,
          assessmentMaintenanceTags: ['Fichier simple à traduire'],
          archivedAt: null,
          author: ['SPS'],
          autoReply: false,
          createdAt: expect.any(Date),
          declinable: 'facilement',
          embedHeight: 500,
          focusable: false,
          format: 'mots',
          genealogy: 'Prototype 1',
          id: 'clonedChallengeId',
          isQualityOk: false,
          locales: ['fr'],
          madeObsoleteAt: null,
          pedagogy: 'q-situation',
          responsive: 'Non',
          shuffled: false,
          skillId: 'clonedAcquisId',
          spoil: 'Non Sp',
          status: 'proposé',
          t1Status: true,
          t2Status: false,
          t3Status: true,
          timer: 1234,
          translationMaintenanceTags: ['date de péremption connue'],
          type: 'QCM',
          updatedAt: expect.any(Date),
          validatedAt: null,
          version: 1,
        },
      ]);

      await expect(
        knex.select('*').from('localized_challenges').where('challengeId', 'clonedChallengeId'),
      ).resolves.toStrictEqual([
        {
          challengeId: 'clonedChallengeId',
          deafAndHardOfHearing: 'RAS',
          embedUrl: 'https://github.io/page/epreuve.html',
          geography: 'FR',
          hasEmbedInternalValidation: false,
          id: 'clonedChallengeId',
          isAwarenessChallenge: false,
          isIncompatibleIpadCertif: false,
          locale: 'fr',
          noValidationNeeded: false,
          requireGafamWebsiteAccess: false,
          status: null,
          toRephrase: false,
          urlsToConsult: null,
          validatedAt: null,
        },
      ]);

      await expect(
        knex.select('*').from('attachments').where('challengeId', 'clonedChallengeId'),
      ).resolves.toStrictEqual([
        {
          id: expect.stringMatching(/^attachment.+$/),
          challengeId: 'clonedChallengeId',
          filename: 'nom_fichier',
          localizedChallengeId: 'clonedChallengeId',
          mimeType: 'image/jpeg',
          size: 123,
          type: 'illustration',
          url: 'url/to/attachment',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([
        { key: 'challenge.clonedChallengeId.instruction', locale: 'fr', value: 'Juste une trad ?' },
        { key: 'challenge.validatedChallengeProto.instruction', locale: 'fr', value: 'Juste une trad ?' },
        { key: 'challenge.validatedChallengeProto.instruction', locale: 'nl', value: 'Slechts een vertaling ?' },
        { key: 'skill.clonedAcquisId.hint', locale: 'en', value: 'AIRTABLE IS SO FUN OMG 🥰' },
        { key: 'skill.clonedAcquisId.hint', locale: 'fr', value: "C'est chaud-nen" },
        { key: 'skill.skill1Tube1.hint', locale: 'en', value: 'AIRTABLE IS SO FUN OMG 🥰' },
        { key: 'skill.skill1Tube1.hint', locale: 'fr', value: "C'est chaud-nen" },
      ]);

      expect(pixApiCacheSkillUpdateScope.isDone()).to.be.true;
      expect(pixApiCacheChallengeUpdateScope.isDone()).to.be.true;
    });
  });
});
