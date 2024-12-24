import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../../test-helper';
import { createServer } from '../../../../server';
import { Challenge, LocalizedChallenge, Skill } from '../../../../lib/domain/models';
import { skillDatasource } from '../../../../lib/infrastructure/datasources/airtable';
import { stringValue } from '../../../../lib/infrastructure/airtable.js';

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
      const skillId = 'recSkill1';
      const challengeProtoPerime = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoPerimeId',
        version: 1,
        alternativeVersion: null,
        status: Challenge.STATUSES.PERIME,
        skillId,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      });
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

  describe('GET /api/skills/{skillId}/localized-challenges-production', () => {
    it('returns all localized challenges', async function() {
      // given
      const server = await createServer();
      const user = databaseBuilder.factory.buildAdminUser();
      const skillId = 'recSkill1';
      const challengeProtoPerime = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoPerimeId',
        version: 1,
        alternativeVersion: null,
        status: Challenge.STATUSES.PERIME,
        skillId,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoPerimeId',
        challengeId: 'challengeProtoPerimeId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'challenge.challengeProtoPerimeId.instruction',
        value: 'je ne descends JAMAIS',
      });
      const challengeProtoPropose = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoProposeId',
        version: 2,
        alternativeVersion: null,
        status: Challenge.STATUSES.PROPOSE,
        skillId,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoProposeId',
        challengeId: 'challengeProtoProposeId',
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
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoArchiveId',
        challengeId: 'challengeProtoArchiveId',
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
      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'challenge.challengeProtoValideId.instruction',
        value: 'instruction challengeProtoValideId fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoValideNlId',
        challengeId: 'challengeProtoValideId',
        locale: 'nl',
        status: LocalizedChallenge.STATUSES.PLAY,
        embedUrl: 'http://example.com/protovalide.html',
        geography: 'NL',
        urlsToConsult: ['URL PROTO VALIDE NL'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: false,
        toRephrase: true,
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'nl',
        key: 'challenge.challengeProtoValideId.instruction',
        value: 'instruction challengeProtoValideNlId nl',
      });
      const challengeProtoValideDecliValide = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoValideDecliValideId',
        version: 4,
        alternativeVersion: 4,
        status: Challenge.STATUSES.VALIDE,
        skillId,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
      });
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
      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'challenge.challengeProtoValideDecliValideId.instruction',
        value: 'instruction challengeProtoValideDecliValideId fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoValideDecliValideEsId',
        challengeId: 'challengeProtoValideDecliValideId',
        locale: 'es',
        status: LocalizedChallenge.STATUSES.PAUSE,
        embedUrl: 'http://example.com/declivalide.html',
        geography: 'NZ',
        urlsToConsult: ['URL DECLI VALIDE'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: true,
        toRephrase: true,
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'es',
        key: 'challenge.challengeProtoValideDecliValideId.instruction',
        value: 'instruction challengeProtoValideDecliValideEsId es',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoValideDecliValideItId',
        challengeId: 'challengeProtoValideDecliValideId',
        locale: 'it',
        status: LocalizedChallenge.STATUSES.PLAY,
        embedUrl: 'http://example.com/declivalide.html',
        geography: 'NZ',
        urlsToConsult: ['URL DECLI VALIDE'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: true,
        toRephrase: true,
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'it',
        key: 'challenge.challengeProtoValideDecliValideId.instruction',
        value: 'instruction challengeProtoValideDecliValideItId it',
      });
      const challengeProtoValideDecliArchive = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeProtoValideDecliArchiveId',
        version: 4,
        alternativeVersion: 5,
        status: Challenge.STATUSES.ARCHIVE,
        skillId,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoValideDecliArchiveId',
        challengeId: 'challengeProtoValideDecliArchiveId',
        locale: 'fr',
        status: LocalizedChallenge.STATUSES.PRIMARY,
        embedUrl: 'http://example.com/declivalide.html',
        geography: 'NZ',
        urlsToConsult: ['URL DECLI ARCHIVE'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: true,
        toRephrase: true,
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'challenge.challengeProtoValideDecliArchiveId.instruction',
        value: 'instruction challengeProtoValideDecliArchiveId fr',
      });

      const airtableChallenges = [
        airtableBuilder.factory.buildChallenge(challengeProtoPerime),
        airtableBuilder.factory.buildChallenge(challengeProtoPropose),
        airtableBuilder.factory.buildChallenge(challengeProtoArchive),
        airtableBuilder.factory.buildChallenge(challengeProtoValide),
        airtableBuilder.factory.buildChallenge(challengeProtoValideDecliValide),
        airtableBuilder.factory.buildChallenge(challengeProtoValideDecliArchive),
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
        url: `/api/skills/${skillId}/localized-challenges-production`,
        headers: {
          ...generateAuthorizationHeader(user),
          host: 'host.site',
        },
      });

      // Then
      expect(airtableChallengesScope.isDone()).toBe(true);
      expect(response.statusCode).to.equal(200);
      const returnedLocalizedChallengeIds = response.result.data.map((item) => item.id);
      expect(returnedLocalizedChallengeIds).toStrictEqual(['challengeProtoValideId', 'challengeProtoValideNlId', 'challengeProtoValideDecliValideEsId', 'challengeProtoValideDecliValideId', 'challengeProtoValideDecliValideItId', 'challengeProtoValideDecliArchiveId']);
    });
  });

  describe('GET /api/skills', () => {
    let airtableSkillsScope;

    beforeEach(async () => {
      const airtableSkills = [
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
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
        })),
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
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
        })),
      ];

      airtableSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: { '': skillDatasource.usedFields },
          sort: [{ field: skillDatasource.sortField, direction: 'asc' }],
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
              'clue': 'Un indice',
              'clue-en': 'A clue',
              'clue-status': 'Validé',
              'created-at': '2025-01-06T13:50:47.437Z',
              'description': 'premier acquis',
              'description-status': 'Validé',
              'i18n': 'France',
              'level': 4,
              'name': '@skill4',
              'status': 'actif',
              'version': 1,
            },
            relationships: {
              'challenges': {
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
              'tube': {
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
            }
          },
          {
            type: 'skills',
            id: 'recSkill2',
            attributes: {
              'pix-id': 'skill2',
              'clue': 'Un autre indice',
              'clue-en': 'An other clue',
              'clue-status': 'Proposé',
              'created-at': '2025-01-06T13:51:04.381Z',
              'description': 'deuxième acquis',
              'description-status': 'Proposé',
              'i18n': 'Monde',
              'level': 3,
              'name': '@skill3',
              'status': 'en construction',
              'version': 2,
            },
            relationships: {
              'challenges': {
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
              'tube': {
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
            }
          },
        ],
      });

      expect(airtableSkillsScope.isDone()).toBe(true);
    });
  });
});
