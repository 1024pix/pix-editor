import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import _ from 'lodash';

import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper';
import { createServer } from '../../../../server';
import { Challenge, LocalizedChallenge, Skill } from '../../../../lib/domain/models';
import { skillDatasource, tubeDatasource } from '../../../../lib/infrastructure/datasources/airtable';
import { stringValue } from '../../../../lib/infrastructure/airtable.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Application | Route | Skills', () => {
  let editorUser;

  beforeEach(async function () {
    editorUser = databaseBuilder.factory.buildEditorUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/skills/{skillId}/challenges-production', () => {
    it('returns the primary challenges list', async function () {
      // given
      const server = await createServer();
      const skillId = 'recSkill1';
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

      const airtableChallenges = [
        airtableBuilder.factory.buildChallenge(challengeProtoPerime),
        airtableBuilder.factory.buildChallenge(challengeProtoPerimeDecliPerime),
        airtableBuilder.factory.buildChallenge(challengeProtoPropose),
        airtableBuilder.factory.buildChallenge(challengeProtoProposeDecliPropose),
        airtableBuilder.factory.buildChallenge(challengeProtoArchive),
        airtableBuilder.factory.buildChallenge(challengeProtoArchiveDecliArchive),
        airtableBuilder.factory.buildChallenge(challengeProtoValide),
        airtableBuilder.factory.buildChallenge(challengeProtoValideDecliValide),
      ];

      const airtableChallengesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          filterByFormula: `{Acquix (id persistant)} = ${stringValue(skillId)}`,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableChallenges });

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
      expect(airtableChallengesScope.isDone()).toBe(true);
      expect(response.statusCode).to.equal(200);
      const returnedChallengeIds = response.result.data.map((item) => item.id);
      expect(returnedChallengeIds).toStrictEqual(['challengeProtoValideId', 'challengeProtoValideDecliValideId']);
    });
  });

  describe('GET /api/skills', () => {
    let airtableSkillsScope;

    describe('with no filters', () => {
      beforeEach(async () => {
        const skills = [
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill1',
            airtableId: 'recSkill1',
            createdAt: '2025-01-06T13:50:47.437Z',
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
            tubeAirtableId: 'recTube1',
            tutorialIds: ['tuto1'],
            tutorialAirtableIds: ['recTuto1'],
            learningMoreTutorialIds: ['tuto2', 'tuto3'],
            learningMoreTutorialAirtableIds: ['recTuto2', 'recTuto3'],
            challengeIds: ['challenge1', 'challenge2'],
            competenceId: 'competence1',
          }),
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill2',
            airtableId: 'recSkill2',
            createdAt: '2025-01-06T13:51:04.381Z',
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
            tubeAirtableId: 'recTube2',
            tutorialIds: ['tuto2'],
            tutorialAirtableIds: ['recTuto2'],
            learningMoreTutorialIds: ['tuto3', 'tuto4'],
            learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
            challengeIds: ['challenge3', 'challenge4', 'challenge5'],
            competenceId: 'competence1',
          }),
        ];

        const airtableSkills = skills.map(airtableBuilder.factory.buildSkill);

        airtableSkillsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Acquis')
          .query({
            fields: { '': skillDatasource.usedFields },
            sort: [{ field: skillDatasource.sortField, direction: 'asc' }],
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableSkills });

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
          skill.challengeIds.forEach((id) =>
            databaseBuilder.factory.buildChallenge(domainBuilder.buildChallenge({ id, skillId: skill.id })),
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
          url: '/api/skills',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'skills',
              id: 'recSkill1',
              attributes: {
                'pix-id': 'skill1',
                clue: 'Un indice',
                'clue-en': 'A clue',
                'clue-status': 'Validé',
                'created-at': '2025-01-06T13:50:47.437Z',
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
                    id: 'recTube1',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'recTuto2',
                      type: 'tutorials',
                    },
                    {
                      id: 'recTuto3',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'recTuto1',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill1/challenges-production',
                  },
                },
              },
            },
            {
              type: 'skills',
              id: 'recSkill2',
              attributes: {
                'pix-id': 'skill2',
                clue: 'Un autre indice',
                'clue-en': 'An other clue',
                'clue-status': 'Proposé',
                'created-at': '2025-01-06T13:51:04.381Z',
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
                    id: 'recTube2',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'recTuto3',
                      type: 'tutorials',
                    },
                    {
                      id: 'recTuto4',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'recTuto2',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill2/challenges-production',
                  },
                },
              },
            },
          ],
        });

        expect(airtableSkillsScope.isDone()).toBe(true);
      });
    });

    describe('with ids filter', () => {
      beforeEach(async () => {
        const skill1 = domainBuilder.buildSkillDatasourceObject({
          id: 'skill1',
          airtableId: 'recSkill1',
          createdAt: '2025-01-06T13:50:47.437Z',
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
          tubeAirtableId: 'recTube1',
          tutorialIds: ['tuto1'],
          tutorialAirtableIds: ['recTuto1'],
          learningMoreTutorialIds: ['tuto2', 'tuto3'],
          learningMoreTutorialAirtableIds: ['recTuto2', 'recTuto3'],
          challengeIds: ['challenge1', 'challenge2'],
          competenceId: 'competence1',
        });
        const skill2 = domainBuilder.buildSkillDatasourceObject({
          id: 'skill2',
          airtableId: 'recSkill2',
          createdAt: '2025-01-06T13:51:04.381Z',
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
          tubeAirtableId: 'recTube2',
          tutorialIds: ['tuto2'],
          tutorialAirtableIds: ['recTuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
          challengeIds: ['challenge3', 'challenge4', 'challenge5'],
          competenceId: 'competence1',
        });

        const airtableSkills = [airtableBuilder.factory.buildSkill(skill1), airtableBuilder.factory.buildSkill(skill2)];

        airtableSkillsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Acquis')
          .query({
            filterByFormula: 'OR(RECORD_ID() = "recSkill1", RECORD_ID() = "recSkill2")',
            fields: { '': skillDatasource.usedFields },
            sort: [{ field: skillDatasource.sortField, direction: 'asc' }],
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableSkills });

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
        ['tuto1', 'tuto2', 'tuto3', 'tuto4'].forEach((tutorialId) => {
          databaseBuilder.factory.buildTutorial(
            domainBuilder.buildTutorialDatasourceObject({
              id: tutorialId,
              tagIds: [],
            }),
          );
        });
        databaseBuilder.factory.buildSkill(skill1);
        databaseBuilder.factory.buildSkill(skill2);
        skill1.challengeIds.forEach((challengeId) => {
          databaseBuilder.factory.buildChallenge(
            domainBuilder.buildChallengeDatasourceObject({
              id: challengeId,
              skillId: skill1.id,
            }),
          );
        });

        skill2.challengeIds.forEach((challengeId) => {
          databaseBuilder.factory.buildChallenge(
            domainBuilder.buildChallengeDatasourceObject({
              id: challengeId,
              skillId: skill2.id,
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
          url: '/api/skills?filter[ids][]=recSkill1&filter[ids][]=recSkill2',
          headers: generateAuthorizationHeader(editorUser),
        });

        // then
        expect(response.statusCode).toBe(200);

        expect(response.result).toEqual({
          data: [
            {
              type: 'skills',
              id: 'recSkill1',
              attributes: {
                'pix-id': 'skill1',
                clue: 'Un indice',
                'clue-en': 'A clue',
                'clue-status': 'Validé',
                'created-at': '2025-01-06T13:50:47.437Z',
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
                    id: 'recTube1',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'recTuto2',
                      type: 'tutorials',
                    },
                    {
                      id: 'recTuto3',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'recTuto1',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill1/challenges-production',
                  },
                },
              },
            },
            {
              type: 'skills',
              id: 'recSkill2',
              attributes: {
                'pix-id': 'skill2',
                clue: 'Un autre indice',
                'clue-en': 'An other clue',
                'clue-status': 'Proposé',
                'created-at': '2025-01-06T13:51:04.381Z',
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
                    id: 'recTube2',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'recTuto3',
                      type: 'tutorials',
                    },
                    {
                      id: 'recTuto4',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'recTuto2',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill2/challenges-production',
                  },
                },
              },
            },
          ],
        });

        expect(airtableSkillsScope.isDone()).toBe(true);
      });
    });

    describe('with name filter, page limit and sort', () => {
      beforeEach(async () => {
        const skills = [
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill1',
            airtableId: 'recSkill1',
            createdAt: '2025-01-06T13:50:47.437Z',
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
            tubeAirtableId: 'recTube1',
            tutorialIds: ['tuto1'],
            tutorialAirtableIds: ['recTuto1'],
            learningMoreTutorialIds: ['tuto2', 'tuto3'],
            learningMoreTutorialAirtableIds: ['recTuto2', 'recTuto3'],
            challengeIds: ['challenge1', 'challenge2'],
            competenceId: 'competence1',
          }),
          domainBuilder.buildSkillDatasourceObject({
            id: 'skill2',
            airtableId: 'recSkill2',
            createdAt: '2025-01-06T13:51:04.381Z',
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
            tubeAirtableId: 'recTube2',
            tutorialIds: ['tuto2'],
            tutorialAirtableIds: ['recTuto2'],
            learningMoreTutorialIds: ['tuto3', 'tuto4'],
            learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
            challengeIds: ['challenge3', 'challenge4', 'challenge5'],
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

          skill.challengeIds.forEach((id) =>
            databaseBuilder.factory.buildChallenge(
              domainBuilder.buildChallengeDatasourceObject({ id, skillId: skill.id }),
            ),
          );
        });

        const airtableSkills = skills.map(airtableBuilder.factory.buildSkill);

        airtableSkillsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Acquis')
          .query({
            filterByFormula: 'FIND("@skil", LOWER(Nom))',
            fields: { '': skillDatasource.usedFields },
            sort: [{ field: 'Nom', direction: 'asc' }],
            maxRecords: 10,
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: airtableSkills });

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
              id: 'recSkill1',
              attributes: {
                'pix-id': 'skill1',
                clue: 'Un indice',
                'clue-en': 'A clue',
                'clue-status': 'Validé',
                'created-at': '2025-01-06T13:50:47.437Z',
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
                    id: 'recTube1',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'recTuto2',
                      type: 'tutorials',
                    },
                    {
                      id: 'recTuto3',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'recTuto1',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill1/challenges-production',
                  },
                },
              },
            },
            {
              type: 'skills',
              id: 'recSkill2',
              attributes: {
                'pix-id': 'skill2',
                clue: 'Un autre indice',
                'clue-en': 'An other clue',
                'clue-status': 'Proposé',
                'created-at': '2025-01-06T13:51:04.381Z',
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
                    id: 'recTube2',
                    type: 'tubes',
                  },
                },
                'tuto-more': {
                  data: [
                    {
                      id: 'recTuto3',
                      type: 'tutorials',
                    },
                    {
                      id: 'recTuto4',
                      type: 'tutorials',
                    },
                  ],
                },
                'tuto-solution': {
                  data: [
                    {
                      id: 'recTuto2',
                      type: 'tutorials',
                    },
                  ],
                },
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill2/challenges-production',
                  },
                },
              },
            },
          ],
        });

        expect(airtableSkillsScope.isDone()).toBe(true);
      });
    });
  });

  describe('GET /api/skills/{skillAirtableId}', () => {
    let airtableSkillScope;

    beforeEach(async () => {
      const skill = domainBuilder.buildSkillDatasourceObject({
        id: 'skill1',
        airtableId: 'recSkill1',
        createdAt: '2025-01-06T13:50:47.437Z',
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
        tubeAirtableId: 'recTube1',
        tutorialIds: ['tuto1'],
        tutorialAirtableIds: ['recTuto1'],
        learningMoreTutorialIds: ['tuto2', 'tuto3'],
        learningMoreTutorialAirtableIds: ['recTuto2', 'recTuto3'],
        challengeIds: ['challenge1', 'challenge2'],
        competenceId: 'competence1',
      });
      const airtableSkill = airtableBuilder.factory.buildSkill(skill);

      airtableSkillScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis/recSkill1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableSkill);

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
      skill.challengeIds.forEach((challengeId) => {
        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({
            id: challengeId,
            skillId: skill.id,
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
        url: '/api/skills/recSkill1',
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toEqual({
        data: {
          type: 'skills',
          id: 'recSkill1',
          attributes: {
            'pix-id': 'skill1',
            clue: 'Un indice',
            'clue-en': 'A clue',
            'clue-status': 'Validé',
            'created-at': '2025-01-06T13:50:47.437Z',
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
                id: 'recTube1',
                type: 'tubes',
              },
            },
            'tuto-more': {
              data: [
                {
                  id: 'recTuto2',
                  type: 'tutorials',
                },
                {
                  id: 'recTuto3',
                  type: 'tutorials',
                },
              ],
            },
            'tuto-solution': {
              data: [
                {
                  id: 'recTuto1',
                  type: 'tutorials',
                },
              ],
            },
            'challenges-production': {
              links: {
                related: '/api/skills/skill1/challenges-production',
              },
            },
          },
        },
      });

      expect(airtableSkillScope.isDone()).toBe(true);
    });
  });

  describe('POST /api/skills', async () => {
    let airtableGetTubeScope, airtableGetSkillsScope, airtableCreateSkillScope, pixApiCacheScope, dataToPost;

    beforeEach(async () => {
      const tube = {
        id: 'tube1',
        airtableId: 'recTube1',
        name: '@tube',
        index: 5,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillIds: ['skill1Tube1', 'skill2Tube1'],
      };

      const skills = [
        domainBuilder.buildSkillDatasourceObject({
          id: 'skill1Tube1',
          airtableId: 'recSkill1Tube1',
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 1,
          version: 1,
          name: '@tube1',
          competenceId: 'competence1',
          challengeIds: [],
          tutorialIds: ['tuto1', 'tuto3'],
          learningMoreTutorialIds: ['tuto2'],
        }),
        domainBuilder.buildSkillDatasourceObject({
          id: 'skill2Tube1',
          airtableId: 'recSkill2Tube1',
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 2,
          name: '@tube2',
          competenceId: 'competence1',
          challengeIds: [],
          tutorialIds: ['tuto2', 'tuto3'],
          learningMoreTutorialIds: [],
        }),
      ];

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube(tube);
      databaseBuilder.factory.buildTutorial({
        id: 'tuto1',
        title: 'title tuto1',
        duration: 'duration tuto1',
        source: 'source tuto1',
        format: 'format tuto1',
        link: 'link tuto1',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tuto2',
        title: 'title tuto2',
        duration: 'duration tuto2',
        source: 'source tuto2',
        format: 'format tuto2',
        link: 'link tuto2',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tuto3',
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
        tubeAirtableId: 'recTube1',
        tutorialAirtableIds: ['recTuto1', 'recTuto3'],
        learningMoreTutorialAirtableIds: ['recTuto2'],
      };
      const airtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject(tube));

      airtableGetTubeScope = nock('https://api.airtable.com')
        .get(`/v0/airtableBaseValue/Tubes/${airtableTube.id}`)
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableTube);

      const airtableSkills = skills.map((skill) =>
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill)),
      );

      airtableGetSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          filterByFormula: '{Tube (id persistant)} = "tube1"',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

      const createdAirtableSkill = airtableBuilder.factory.buildSkill(
        domainBuilder.buildSkillDatasourceObject({
          id: 'nouvelAcquis',
          airtableId: 'recSkill1BisTube1',
          description: dataToPost.description,
          name: '@tube1',
          hintStatus: dataToPost.hintStatus,
          tutorialAirtableIds: dataToPost.tutorialAirtableIds,
          tutorialIds: ['tuto1', 'tuto3'],
          learningMoreTutorialAirtableIds: dataToPost.learningMoreTutorialAirtableIds,
          learningMoreTutorialIds: ['tuto2'],
          pixValue: 3,
          status: 'en construction',
          tubeAirtableId: dataToPost.tubeAirtableId,
          tubeId: 'tube1',
          descriptionStatus: dataToPost.descriptionStatus,
          level: 1,
          internationalisation: dataToPost.internationalisation,
          version: 2,
          challengeIds: null,
        }),
      );

      airtableCreateSkillScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Acquis/', {
          records: [
            {
              fields: {
                'id persistant': createdAirtableSkill.fields['id persistant'],
                "Statut de l'indice": createdAirtableSkill.fields["Statut de l'indice"],
                Comprendre: createdAirtableSkill.fields['Comprendre'],
                'En savoir plus': createdAirtableSkill.fields['En savoir plus'],
                Status: createdAirtableSkill.fields['Status'],
                Tube: createdAirtableSkill.fields['Tube'],
                Description: createdAirtableSkill.fields['Description'],
                'Statut de la description': createdAirtableSkill.fields['Statut de la description'],
                Level: createdAirtableSkill.fields['Level'],
                Internationalisation: createdAirtableSkill.fields['Internationalisation'],
                Version: createdAirtableSkill.fields['Version'],
              },
            },
          ],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [createdAirtableSkill] });

      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('nouvelAcquis');
      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: pixApiToken });
      pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/skills/nouvelAcquis', {
          id: createdAirtableSkill.fields['id persistant'],
          name: createdAirtableSkill.fields['Nom'],
          hintStatus: createdAirtableSkill.fields["Statut de l'indice"],
          tutorialIds: createdAirtableSkill.fields['Comprendre (id persistant)'],
          learningMoreTutorialIds: createdAirtableSkill.fields['En savoir plus (id persistant)'],
          pixValue: createdAirtableSkill.fields['PixValue'],
          competenceId: createdAirtableSkill.fields['Compétence (via Tube) (id persistant)'][0],
          status: createdAirtableSkill.fields['Status'],
          tubeId: createdAirtableSkill.fields['Tube (id persistant)'][0],
          level: createdAirtableSkill.fields['Level'],
          version: createdAirtableSkill.fields['Version'],
          hint_i18n: {
            fr: dataToPost.hint,
            en: dataToPost.hintEn,
          },
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
    });

    afterEach(async () => {
      await knex('skills-tutorials').delete();
      await knex('skills').delete();
      await knex('translations').delete();
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
          id: 'recSkill1BisTube1',
          attributes: {
            name: '@tube1',
            clue: 'L indice de mon nouvel acquis',
            'clue-en': 'L indice EN de mon nouvel acquis',
            'clue-status': 'Le statut de l indice de mon nouvel acquis',
            'created-at': '2025-01-06T08:58:57.465Z',
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
                id: 'recTube1',
                type: 'tubes',
              },
            },
            'tuto-more': {
              data: [
                {
                  id: 'recTuto2',
                  type: 'tutorials',
                },
              ],
            },
            'tuto-solution': {
              data: [
                {
                  id: 'recTuto1',
                  type: 'tutorials',
                },
                {
                  id: 'recTuto3',
                  type: 'tutorials',
                },
              ],
            },
            challenges: {
              data: [],
            },
            'challenges-production': {
              links: {
                related: '/api/skills/nouvelAcquis/challenges-production',
              },
            },
          },
        },
      });

      expect(airtableGetTubeScope.isDone()).to.be.true;
      expect(airtableGetSkillsScope.isDone()).to.be.true;
      expect(airtableCreateSkillScope.isDone()).to.be.true;
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
      ).resolves.toStrictEqual([
        { key: 'skill.nouvelAcquis.hint', locale: 'en', value: 'L indice EN de mon nouvel acquis' },
        { key: 'skill.nouvelAcquis.hint', locale: 'fr', value: 'L indice de mon nouvel acquis' },
      ]);

      await expect(
        knex.select('*').from('skills-tutorials').where('skillId', 'nouvelAcquis').orderBy(['type', 'tutorialId']),
      ).resolves.toStrictEqual([
        {
          type: 'learningMore',
          skillId: 'nouvelAcquis',
          tutorialId: 'tuto2',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          type: 'understanding',
          skillId: 'nouvelAcquis',
          tutorialId: 'tuto1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          type: 'understanding',
          skillId: 'nouvelAcquis',
          tutorialId: 'tuto3',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('PATCH /api/skills/{skillAirtableId}', () => {
    let skillPayload;
    let airtableSkill;
    let skillDataObject;

    beforeEach(async function () {
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
        tutorialAirtableIds: ['tutorialAirtableId'],
        learningMoreTutorialIds: ['tutorialLMIdPersistant'],
        learningMoreTutorialAirtableIds: ['tutorialLMAirtableId'],
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
        createdAt: '2025-01-06T08:58:57.465Z',
      });
      airtableSkill = airtableBuilder.factory.buildSkill(skillDataObject);

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
            'tuto-more': {
              data: [
                { type: 'tutorials', id: 'tutorialLMAirtableId' },
                { type: 'tutorials', id: 'tutorialLMNewAirtableId' },
              ],
            },
            'tuto-solution': {
              data: [{ type: 'tutorials', id: 'tutorialAirtableId' }],
            },
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
      skillDataObject.challengeIds.forEach((challengeId) => {
        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({
            id: challengeId,
            skillId: skillDataObject.id,
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
      const skillToUpdateFromAirtableScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis/skillAirtableId?')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableSkill);

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

      const airtableSkillPatched = airtableBuilder.factory.buildSkill(skillPatched);

      const airtablePatchScope = nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Acquis/?', {
          records: [
            {
              fields: {
                'id persistant': skillDataObject.id,
                "Statut de l'indice": skillPayload.data.attributes['clue-status'],
                Comprendre: ['tutorialAirtableId'],
                'En savoir plus': ['tutorialLMAirtableId', 'tutorialLMNewAirtableId'],
                Status: skillPayload.data.attributes.status,
                Tube: [skillDataObject.tubeAirtableId],
                Description: skillPayload.data.attributes.description,
                'Statut de la description': skillPayload.data.attributes['description-status'],
                Level: skillDataObject.level,
                Internationalisation: skillPayload.data.attributes.i18n,
                Version: skillDataObject.version,
              },
              id: skillDataObject.airtableId,
            },
          ],
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableSkillPatched] });

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { access_token: pixApiToken });

      const pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/skills/skillIdPersistant', {
          id: airtableSkillPatched.fields['id persistant'],
          name: airtableSkillPatched.fields['Nom'],
          hintStatus: airtableSkillPatched.fields["Statut de l'indice"],
          tutorialIds: airtableSkillPatched.fields['Comprendre (id persistant)'],
          learningMoreTutorialIds: airtableSkillPatched.fields['En savoir plus (id persistant)'],
          pixValue: airtableSkillPatched.fields['PixValue'],
          competenceId: airtableSkillPatched.fields['Compétence (via Tube) (id persistant)'][0],
          status: airtableSkillPatched.fields['Status'],
          tubeId: airtableSkillPatched.fields['Tube (id persistant)'][0],
          level: airtableSkillPatched.fields['Level'],
          version: airtableSkillPatched.fields['Version'],
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
        url: '/api/skills/skillAirtableId',
        headers: generateAuthorizationHeader(editorUser),
        payload: skillPayload,
      });

      // Then
      expect(response.statusCode).toBe(200);
      expect(skillToUpdateFromAirtableScope.isDone()).toBe(true);
      expect(airtablePatchScope.isDone()).toBe(true);
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
        const skillToUpdateFromAirtableScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Acquis/skillAirtableId?')
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        const server = await createServer();
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/skills/skillAirtableId',
          headers: generateAuthorizationHeader(editorUser),
          payload: skillPayload,
        });

        // Then
        expect(skillToUpdateFromAirtableScope.isDone()).toBe(true);
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
    let airtableGetTubeByIdScope,
      airtableGetSkillByIdScope,
      airtableGetTubeSkillsScope,
      airtableGetSkillChallengesScope,
      airtableGetChallengesAttachmentsScope,
      airtableCreateSkillScope,
      airtableGetSkillAirtableIdsByIdsScope,
      airtableCreateChallengesScope,
      airtableGetAirtableChallengeIdsByIdsScope,
      airtableCreateAttachmentsScope,
      pixApiCacheSkillUpdateScope,
      pixApiCacheChallengeUpdateScope,
      dataToPost,
      skillToClone;

    beforeEach(async () => {
      // given
      skillToClone = domainBuilder.buildSkillDatasourceObject({
        id: 'skill1Tube1',
        airtableId: 'recSkill1Tube1',
        tubeId: 'tube1',
        tubeAirtableId: 'recTube1',
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
        airtableId: 'recTube1',
        name: '@tube',
        index: 5,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillIds: ['skill1Tube1', 'skill2Tube1'],
      };
      const airtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject(tube));
      databaseBuilder.factory.buildTube(tube);
      const skillAlreadyAtDestinationTubeLevel = domainBuilder.buildSkillDatasourceObject({
        id: 'skill2Tube1',
        airtableId: 'recSkill2Tube1',
        tubeId: 'tube1',
        tubeAirtableId: 'recTube1',
        level: 2,
        version: 1,
        name: '@tube2',
        competenceId: 'competence1',
        challengeIds: [],
      });
      databaseBuilder.factory.buildSkill(skillAlreadyAtDestinationTubeLevel);
      databaseBuilder.factory.buildSkill(skillToClone);

      const airtableSkillToClone = airtableBuilder.factory.buildSkill(skillToClone);
      const airtableSkillAlreadyAtDestinationTubeLevel = airtableBuilder.factory.buildSkill(
        skillAlreadyAtDestinationTubeLevel,
      );
      const airtableSkills = [airtableSkillToClone, airtableSkillAlreadyAtDestinationTubeLevel];
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
        status: 'validé',
        locales: ['fr'],
        skillId: airtableSkillToClone.fields['id persistant'],
        skills: [airtableSkillToClone.id],
        competenceId: 'recCompetence123',
      });
      const validatedChallengeProtoToClone = airtableBuilder.factory.buildChallenge(
        validatedDomainChallengeProtoToClone,
      );
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
      const skillToCloneChallenges = [validatedChallengeProtoToClone];
      const localizedChallenges = [
        databaseBuilder.factory.buildLocalizedChallenge({
          id: protoId,
          challengeId: protoId,
          locale: 'fr',
          embedUrl: validatedChallengeProtoToClone.fields['Embed URL'],
          status: validatedChallengeProtoToClone.fields['Statut'],
          geography: 'FR',
        }),
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'validatedChallengeProtoNl',
          challengeId: protoId,
          locale: 'nl',
          geography: 'FR',
        }),
      ];
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: protoId,
        attachmentId: 'attid1',
      });
      const attachment = airtableBuilder.factory.buildAttachment({
        challengeId: protoId,
        localizedChallengeId: protoId,
        type: 'illustration',
      });

      const createdAirtableSkill = structuredClone(airtableSkillToClone);
      createdAirtableSkill.id = null;
      createdAirtableSkill.fields['id persistant'] = 'clonedAcquisId';
      createdAirtableSkill.fields['Version']++;
      createdAirtableSkill.fields['Level'] = 2;
      createdAirtableSkill.fields['Status'] = 'en construction';
      const clonedSkillAirtableId = 'recClonedSkillAirtableId';
      const usedFields = [
        'id persistant',
        'Timer',
        "Type d'épreuve",
        'T1 - Espaces, casse & accents',
        'T2 - Ponctuation',
        "T3 - Distance d'édition",
        'Statut',
        'Embed URL',
        'Embed height',
        'Format',
        'files',
        'Réponse automatique',
        'Langues',
        'Focalisée',
        'Acquix',
        'Généalogie',
        'Type péda',
        'Auteur',
        'Déclinable',
        'Version prototype',
        'Version déclinaison',
        'Non voyant',
        'Daltonien',
        'Spoil',
        'Responsive',
        'Géographie',
        'shuffled',
        'contextualizedFields',
      ];
      const createdChallengeFields = _.pick(validatedChallengeProtoToClone.fields, usedFields);
      createdChallengeFields['Acquix'] = [clonedSkillAirtableId];
      createdChallengeFields['id persistant'] = 'clonedChallengeId';
      createdChallengeFields['Version déclinaison'] = null;
      createdChallengeFields['archived_at'] = null;
      createdChallengeFields['made_obsolete_at'] = null;
      createdChallengeFields['validated_at'] = null;
      createdChallengeFields['Statut'] = 'proposé';
      createdChallengeFields['files'] = [];
      const challengeProtoCloned = {
        id: 'recChallengeProtoCloned',
        fields: {
          ...createdChallengeFields,
          'Record ID': 'recChallengeProtoCloned',
        },
      };
      let createdAttachmentFields = _.omit(attachment.fields, ['Record ID', 'challengeId persistant', 'createdAt']);
      createdAttachmentFields = {
        ...createdAttachmentFields,
        challengeId: ['recChallengeProtoCloned'],
        localizedChallengeId: 'clonedChallengeId',
      };
      const skillForPixApi = {
        id: createdAirtableSkill.fields['id persistant'],
        name: '@tube2',
        hintStatus: createdAirtableSkill.fields["Statut de l'indice"],
        tutorialIds: createdAirtableSkill.fields['Comprendre (id persistant)'],
        learningMoreTutorialIds: createdAirtableSkill.fields['En savoir plus (id persistant)'],
        pixValue: null,
        competenceId: 'competence1',
        status: createdAirtableSkill.fields['Status'],
        tubeId: createdAirtableSkill.fields['Tube (id persistant)'][0],
        level: createdAirtableSkill.fields['Level'],
        version: createdAirtableSkill.fields['Version'],
        hint_i18n: {
          fr: skillTradFr.value,
          en: skillTradEn.value,
        },
      };
      const challengeForPixApi = {
        id: 'clonedChallengeId',
        alpha: null,
        alternativeInstruction: '',
        autoReply: false,
        competenceId: 'competence1',
        delta: null,
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

      // _checkIfCloningIsPossible
      airtableGetTubeByIdScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes')
        .query({
          fields: {
            '': tubeDatasource.usedFields,
          },
          filterByFormula: 'OR("tube1" = {id persistant})',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableTube] });

      airtableGetSkillByIdScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': skillDatasource.usedFields,
          },
          filterByFormula: 'OR("skill1Tube1" = {id persistant})',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableSkillToClone] });

      // _fetchData
      airtableGetSkillChallengesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          filterByFormula: '{Acquix (id persistant)} = "skill1Tube1"',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: skillToCloneChallenges });

      airtableGetTubeSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          filterByFormula: '{Tube (id persistant)} = "tube1"',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

      airtableGetChallengesAttachmentsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query({
          filterByFormula:
            'OR(' + localizedChallenges.map((l) => `{localizedChallengeId} = ${stringValue(l.id)}`).join(',') + ')',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [attachment] });

      // skillRepository.create
      airtableCreateSkillScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Acquis/', {
          records: [
            {
              fields: {
                'id persistant': createdAirtableSkill.fields['id persistant'],
                "Statut de l'indice": createdAirtableSkill.fields["Statut de l'indice"],
                Comprendre: createdAirtableSkill.fields['Comprendre'],
                'En savoir plus': createdAirtableSkill.fields['En savoir plus'],
                Status: createdAirtableSkill.fields['Status'],
                Tube: createdAirtableSkill.fields['Tube'],
                Description: createdAirtableSkill.fields['Description'],
                'Statut de la description': createdAirtableSkill.fields['Statut de la description'],
                Level: createdAirtableSkill.fields['Level'],
                Internationalisation: createdAirtableSkill.fields['Internationalisation'],
                Version: createdAirtableSkill.fields['Version'],
              },
            },
          ],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, {
          records: [
            {
              id: clonedSkillAirtableId,
              fields: { ...createdAirtableSkill.fields, 'Record Id': clonedSkillAirtableId },
            },
          ],
        });

      // challengeRepository.createBatch
      airtableGetSkillAirtableIdsByIdsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': ['Record Id', 'id persistant'],
          },
          filterByFormula: 'OR("clonedAcquisId" = {id persistant})',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, {
          records: [
            {
              fields: {
                'id persistant': 'clonedAcquisId',
                'Record Id': clonedSkillAirtableId,
              },
            },
          ],
        });

      airtableCreateChallengesScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Epreuves/', {
          records: [
            {
              fields: createdChallengeFields,
            },
          ],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [challengeProtoCloned] });

      // attachmentRepository.createBatch
      airtableGetAirtableChallengeIdsByIdsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          fields: {
            '': ['Record ID', 'id persistant'],
          },
          filterByFormula: 'OR("clonedChallengeId" = {id persistant})',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, {
          records: [
            {
              fields: {
                'id persistant': 'clonedChallengeId',
                'Record ID': 'recChallengeProtoCloned',
              },
            },
          ],
        });

      airtableCreateAttachmentsScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Attachments/', {
          records: [
            {
              fields: createdAttachmentFields,
            },
          ],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, {
          records: [
            {
              id: 'recOsef',
              fields: {
                ...createdAttachmentFields,
                'Record ID': 'recOsef',
                'challengeId persistant': 'clonedChallengeId',
              },
            },
          ],
        });

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

    afterEach(async () => {
      await knex('skills-tutorials').delete();
      await knex('localized_challenges-attachments').delete();
      await knex('localized_challenges').delete();
      await knex('challenges').delete();
      await knex('skills').delete();
      await knex('translations').delete();
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
      expect(response.headers.location).toBe('/api/skills/recClonedSkillAirtableId');

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
          alpha: null,
          alternativeVersion: null,
          archivedAt: null,
          author: ['SPS'],
          autoReply: false,
          contextualizedFields: ['instruction', 'illustration'],
          createdAt: expect.any(Date),
          declinable: 'facilement',
          delta: null,
          embedHeight: 500,
          focusable: false,
          format: 'mots',
          genealogy: 'Prototype 1',
          id: 'clonedChallengeId',
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
        knex.select('*').from('localized_challenges-attachments').where('localizedChallengeId', 'clonedChallengeId'),
      ).resolves.toStrictEqual([{ attachmentId: 'recOsef', localizedChallengeId: 'clonedChallengeId' }]);

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

      expect(airtableGetTubeByIdScope.isDone()).to.be.true;
      expect(airtableGetSkillByIdScope.isDone()).to.be.true;
      expect(airtableGetTubeSkillsScope.isDone()).to.be.true;
      expect(airtableGetSkillChallengesScope.isDone()).to.be.true;
      expect(airtableGetChallengesAttachmentsScope.isDone()).to.be.true;
      expect(airtableCreateSkillScope.isDone()).to.be.true;
      expect(airtableGetSkillAirtableIdsByIdsScope.isDone()).to.be.true;
      expect(airtableCreateChallengesScope.isDone()).to.be.true;
      expect(airtableGetAirtableChallengeIdsByIdsScope.isDone()).to.be.true;
      expect(airtableCreateAttachmentsScope.isDone()).to.be.true;
      expect(pixApiCacheSkillUpdateScope.isDone()).to.be.true;
      expect(pixApiCacheChallengeUpdateScope.isDone()).to.be.true;
    });
  });
});
