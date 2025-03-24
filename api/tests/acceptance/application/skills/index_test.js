import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import _ from 'lodash';

import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader, knex } from '../../../test-helper';
import { createServer } from '../../../../server';
import { Challenge, LocalizedChallenge, Skill } from '../../../../lib/domain/models';
import { skillDatasource, tubeDatasource } from '../../../../lib/infrastructure/datasources/airtable';
import { stringValue } from '../../../../lib/infrastructure/airtable.js';
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

    describe('with no filters', () => {
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
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill1/challenges-production',
                  },
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
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill2/challenges-production',
                  },
                },
              }
            },
          ],
        });

        expect(airtableSkillsScope.isDone()).toBe(true);
      });
    });

    describe('with ids filter', () => {
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
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill1/challenges-production',
                  },
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
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill2/challenges-production',
                  },
                },
              }
            },
          ],
        });

        expect(airtableSkillsScope.isDone()).toBe(true);
      });
    });

    describe('with name filter, page limit and sort', () => {
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
          })),
          airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
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
          })),
        ];

        airtableSkillsScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Acquis')
          .query({
            filterByFormula: 'FIND("needle", LOWER(Nom))',
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
          url: '/api/skills?filter[name]=Needle&page[limit]=10&sort=name',
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
                'level': 3,
                'name': '@skill3',
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
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill1/challenges-production',
                  },
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
                'level': 4,
                'name': '@skill4',
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
                'challenges-production': {
                  links: {
                    related: '/api/skills/skill2/challenges-production',
                  },
                },
              }
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
      const airtableSkill =   airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
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
      }));

      airtableSkillScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis/recSkill1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableSkill);

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
        data:
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
              'challenges-production': {
                links: {
                  related: '/api/skills/skill1/challenges-production',
                },
              },
            }
          },
      });

      expect(airtableSkillScope.isDone()).toBe(true);
    });
  });

  describe('POST /api/skills', async () => {
    let airtableGetTubeScope, airtableGetSkillsScope, airtableCreateSkillScope, pixApiCacheScope, dataToPost;

    beforeEach(async () => {
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
      const airtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
        id: 'tube1',
        airtableId: 'recTube1',
        name: '@tube',
        index: 5,
        competenceId: 'recCompetence1',
      }));

      airtableGetTubeScope = nock('https://api.airtable.com')
        .get(`/v0/airtableBaseValue/Tubes/${airtableTube.id}`)
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableTube);

      const airtableSkills = [
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
          id: 'skill1Tube1',
          airtableId: 'recSkill1Tube1',
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 1,
          version: 1,
        })),
        airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
          id: 'skill2Tube1',
          airtableId: 'recSkill2Tube1',
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 2,
        })),
      ];

      airtableGetSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          filterByFormula:  '{Tube (id persistant)} = "tube1"',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

      const createdAirtableSkill = airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
        id: 'nouvelAcquis',
        airtableId: 'recSkill1BisTube1',
        description: dataToPost.description,
        name: '@tube1',
        hintStatus: dataToPost.hintStatus,
        tutorialAirtableIds: dataToPost.tutorialAirtableIds,
        learningMoreTutorialAirtableIds: dataToPost.learningMoreTutorialAirtableIds,
        pixValue: 3,
        status: 'en construction',
        tubeAirtableId: dataToPost.tubeAirtableId,
        descriptionStatus: dataToPost.descriptionStatus,
        level: 1,
        internationalisation: dataToPost.internationalisation,
        version: 2,
        challengeIds: null,
      }));

      airtableCreateSkillScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Acquis/', {
          records: [{
            fields: {
              'id persistant': createdAirtableSkill.fields['id persistant'],
              'Statut de l\'indice': createdAirtableSkill.fields['Statut de l\'indice'],
              'Comprendre': createdAirtableSkill.fields['Comprendre'],
              'En savoir plus': createdAirtableSkill.fields['En savoir plus'],
              'Status': createdAirtableSkill.fields['Status'],
              'Tube': createdAirtableSkill.fields['Tube'],
              'Description': createdAirtableSkill.fields['Description'],
              'Statut de la description': createdAirtableSkill.fields['Statut de la description'],
              'Level': createdAirtableSkill.fields['Level'],
              'Internationalisation': createdAirtableSkill.fields['Internationalisation'],
              'Version': createdAirtableSkill.fields['Version'],
            }
          }],
        })
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [createdAirtableSkill] });

      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce('nouvelAcquis');
      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });
      pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/skills/nouvelAcquis', {
          id: createdAirtableSkill.fields['id persistant'],
          name: createdAirtableSkill.fields['Nom'],
          hintStatus: createdAirtableSkill.fields['Statut de l\'indice'],
          tutorialIds: createdAirtableSkill.fields['Comprendre (id persistant)'] ,
          learningMoreTutorialIds: createdAirtableSkill.fields['En savoir plus (id persistant)'] ,
          pixValue: createdAirtableSkill.fields['PixValue'],
          competenceId: createdAirtableSkill.fields['Compétence (via Tube) (id persistant)'][0],
          status: createdAirtableSkill.fields['Status'],
          tubeId: createdAirtableSkill.fields['Tube (id persistant)'][0],
          level: createdAirtableSkill.fields['Level'],
          version: createdAirtableSkill.fields['Version'],
          hint_i18n: {
            fr: dataToPost.hint,
            en: dataToPost.hintEn,
          }
        })
        .matchHeader('Authorization', `Bearer ${pixApiToken}`)
        .reply(200);
    });

    afterEach(async () => {
      await knex('translations').truncate();
    });

    it('should respond with status 201 and created skill', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/skills',
        payload:  {
          data: {
            type: 'skills',
            attributes: {
              'level': dataToPost.level,
              'clue': dataToPost.hint,
              'clue-en': dataToPost.hintEn,
              'clue-status': dataToPost.hintStatus,
              'description': dataToPost.description,
              'description-status': dataToPost.descriptionStatus,
              'i18n': dataToPost.internationalisation,
              'name': '@tube1',
              'status': 'en construction',
              'version': 2
            },
            relationships: {
              'tube': {
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
      expect(airtableGetTubeScope.isDone()).to.be.true;
      expect(airtableGetSkillsScope.isDone()).to.be.true;
      expect(airtableCreateSkillScope.isDone()).to.be.true;
      expect(pixApiCacheScope.isDone()).to.be.true;
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
            version: 2
          },
          relationships: {
            tube: {
              data: {
                id: 'recTube1',
                type: 'tubes'
              }
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
          }
        }
      });

      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
        { key: 'skill.nouvelAcquis.hint', locale: 'en', value: 'L indice EN de mon nouvel acquis' },
        { key: 'skill.nouvelAcquis.hint', locale: 'fr', value: 'L indice de mon nouvel acquis' },
      ]);

    });
  });

  describe('PATCH /api/skills/{skillAirtableId}', () => {
    let skillPayload;
    let airtableSkill;
    let skillDataObject;
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      const skillAttributes = {
        'description': 'une nouvelle description',
        'description-status': Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        'clue': 'AAA',
        'clue-en': 'BBB',
        'clue-status': Skill.HINT_STATUSES.A_RETRAVAILLER,
        'i18n': Skill.INTERNATIONALISATIONS.FRANCE,
        'status': Skill.STATUSES.ACTIF,
      };

      skillDataObject = domainBuilder.buildSkillDatasourceObject({
        airtableId: 'skillAirtableId',
        id: 'skillIdPersistant',
        name: 'Un nom généré par Airtable',
        hintStatus: skillAttributes['clue-status'],
        tutorialIds: ['tutorialIdPersistant'],
        tutorialAirtableIds: ['tutorialAirtableId'],
        learningMoreTutorialIds: ['tutorialLMIdPersistant'],
        learningMoreTutorialAirtableIds: ['tutorialLMAirtableId'],
        competenceId: 'UneCompetenceId',
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
              ]
            },
            'tuto-solution': {
              data: [
                { type: 'tutorials', id: 'tutorialAirtableId' },
              ]
            },
          }
        },
      };

      databaseBuilder.factory.buildTranslation({
        locale: 'fr',
        key: 'skill.skillIdPersistant.hint',
        value: 'Pouet'
      });
      databaseBuilder.factory.buildTranslation({
        locale: 'en',
        key: 'skill.skillIdPersistant.hint',
        value: 'Toot'
      });

      await databaseBuilder.commit();
    });

    it('should patch skill', async () => {
      // Given
      const skillToUpdateFromAirtableScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis/skillAirtableId?')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableSkill);

      const airtableSkillPatched = airtableBuilder.factory.buildSkill({
        ...skillDataObject,
        hintStatus: skillPayload.data.attributes['clue-status'],
        learningMoreTutorialIds: ['tutorialLMIdPersistant', 'recNewTuto'],
        learningMoreTutorialAirtableIds: ['tutorialLMAirtableId', 'tutorialLMNewAirtableId'],
        status: skillPayload.data.attributes.status,
        description: skillPayload.data.attributes.description,
        descriptionStatus: skillPayload.data.attributes['description-status'],
        internationalisation: skillPayload.data.attributes.i18n
      });

      const airtablePatchScope = nock('https://api.airtable.com')
        .patch('/v0/airtableBaseValue/Acquis/?', {
          records: [{
            fields: {
              'id persistant': skillDataObject.id,
              'Statut de l\'indice': skillPayload.data.attributes['clue-status'],
              'Comprendre': ['tutorialAirtableId'],
              'En savoir plus': ['tutorialLMAirtableId', 'tutorialLMNewAirtableId'],
              'Status': skillPayload.data.attributes.status,
              'Tube': [skillDataObject.tubeAirtableId],
              'Description': skillPayload.data.attributes.description,
              'Statut de la description': skillPayload.data.attributes['description-status'],
              'Level': skillDataObject.level,
              'Internationalisation': skillPayload.data.attributes.i18n,
              'Version': skillDataObject.version,
            },
            id: skillDataObject.airtableId,
          }],
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableSkillPatched] });

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });

      const pixApiCacheScope = nock('https://api.test.pix.fr')
        .patch('/api/cache/skills/skillIdPersistant', {
          id: airtableSkillPatched.fields['id persistant'],
          name: airtableSkillPatched.fields['Nom'],
          hintStatus: airtableSkillPatched.fields['Statut de l\'indice'],
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
        headers: generateAuthorizationHeader(user),
        payload: skillPayload,
      });

      // Then
      expect(response.statusCode).toBe(200);
      expect(skillToUpdateFromAirtableScope.isDone()).toBe(true);
      expect(airtablePatchScope.isDone()).toBe(true);
      expect(pixApiCacheScope.isDone()).toBe(true);

      const translations = await knex('translations').select('key', 'locale', 'value').orderBy([{
        column: 'key',
        order: 'asc'
      }, { column: 'locale', order: 'asc' }]);

      expect(translations).to.deep.equal([{
        key: 'skill.skillIdPersistant.hint',
        locale: 'en',
        value: 'new clueEn'
      }, {
        key: 'skill.skillIdPersistant.hint',
        locale: 'fr',
        value: 'new clue'
      }]);
    });
    describe('when resources doesn\'t exists', () => {
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
          headers: generateAuthorizationHeader(user),
          payload: skillPayload,
        });

        // Then
        expect(skillToUpdateFromAirtableScope.isDone()).toBe(true);
        expect(response.statusCode).to.equal(404);

        const translations = await knex('translations').select('key', 'locale', 'value').orderBy([{
          column: 'key',
          order: 'asc'
        }, { column: 'locale', order: 'asc' }]);

        expect(translations).to.deep.equal([{
          key: 'skill.skillIdPersistant.hint',
          locale: 'en',
          value: 'Toot'
        }, {
          key: 'skill.skillIdPersistant.hint',
          locale: 'fr',
          value: 'Pouet'
        }]);
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
      dataToPost;

    beforeEach(async () => {
      // given
      dataToPost = {
        level: 2,
        skillIdToClone: 'skill1Tube1',
        tubeDestinationId: 'tube1',
      };
      const airtableTube = airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject({
        id: 'tube1',
        airtableId: 'recTube1',
        name: '@tube',
        index: 5,
        competenceId: 'recCompetence1',
      }));
      const airtableSkillToClone = airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
        id: 'skill1Tube1',
        airtableId: 'recSkill1Tube1',
        tubeId: 'tube1',
        tubeAirtableId: 'recTube1',
        level: 1,
        version: 1,
      }));
      const airtableSkillAlreadyAtDestinationTubeLevel = airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject({
        id: 'skill2Tube1',
        airtableId: 'recSkill2Tube1',
        tubeId: 'tube1',
        tubeAirtableId: 'recTube1',
        level: 2,
        version: 1,
      }));
      const airtableSkills = [
        airtableSkillToClone,
        airtableSkillAlreadyAtDestinationTubeLevel,
      ];
      const skillTradFr = databaseBuilder.factory.buildTranslation({
        key: 'skill.skill1Tube1.hint',
        locale: 'fr',
        value: 'C\'est chaud-nen',
      });
      const skillTradEn = databaseBuilder.factory.buildTranslation({
        key: 'skill.skill1Tube1.hint',
        locale: 'en',
        value: 'AIRTABLE IS SO FUN OMG 🥰',
      });
      const protoId = 'validatedChallengeProto';
      const validatedChallengeProtoToClone = airtableBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({
        id: protoId,
        airtableId: 'recChallengeValidated',
        status: 'validé',
        locales: ['fr'],
        skillId: airtableSkillToClone.fields['id persistant'],
        skills: [airtableSkillToClone.id],
        competenceId: 'recCompetence123',
      }));
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
      const skillToCloneChallenges = [
        validatedChallengeProtoToClone,
      ];
      const localizedChallenges = [
        databaseBuilder.factory.buildLocalizedChallenge({
          id: protoId,
          challengeId: protoId,
          locale: 'fr',
          embedUrl: validatedChallengeProtoToClone.fields['Embed URL'],
          status: validatedChallengeProtoToClone.fields['Statut'],
          geography: 'fr',
        }),
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'validatedChallengeProtoNl',
          challengeId: protoId,
          locale: 'nl',
          geography: 'fr',
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
        'Type d\'épreuve',
        'T1 - Espaces, casse & accents',
        'T2 - Ponctuation',
        'T3 - Distance d\'édition',
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
          'Record ID': 'recChallengeProtoCloned'
        }
      };
      let createdAttachmentFields = _.omit(attachment.fields, ['Record ID', 'challengeId persistant', 'createdAt']);
      createdAttachmentFields = {
        ...createdAttachmentFields,
        challengeId: ['recChallengeProtoCloned'],
        'localizedChallengeId': 'clonedChallengeId'
      };
      const skillForPixApi =  {
        id: createdAirtableSkill.fields['id persistant'],
        name: '@tube2',
        hintStatus: createdAirtableSkill.fields['Statut de l\'indice'],
        tutorialIds: createdAirtableSkill.fields['Comprendre (id persistant)'] ,
        learningMoreTutorialIds: createdAirtableSkill.fields['En savoir plus (id persistant)'] ,
        pixValue: null,
        competenceId: 'recCompetence1',
        status: createdAirtableSkill.fields['Status'],
        tubeId: createdAirtableSkill.fields['Tube (id persistant)'][0],
        level: createdAirtableSkill.fields['Level'],
        version: createdAirtableSkill.fields['Version'],
        hint_i18n: {
          fr: skillTradFr.value,
          en: skillTradEn.value,
        }
      };
      const challengeForPixApi = {
        id: 'clonedChallengeId',
        alpha: null,
        alternativeInstruction: '',
        autoReply: false,
        competenceId: 'recCompetence1',
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
        locales: [ 'fr' ],
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
        noValidationNeeded: false
      };

      // _checkIfCloningIsPossible
      airtableGetTubeByIdScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes')
        .query({
          fields: {
            '': tubeDatasource.usedFields
          },
          filterByFormula: 'OR("tube1" = {id persistant})'
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableTube] });

      airtableGetSkillByIdScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': skillDatasource.usedFields,
          },
          filterByFormula:  'OR("skill1Tube1" = {id persistant})',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [airtableSkillToClone] });

      // _fetchData
      airtableGetSkillChallengesScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Epreuves')
        .query({
          filterByFormula:  '{Acquix (id persistant)} = "skill1Tube1"',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: skillToCloneChallenges });

      airtableGetTubeSkillsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          filterByFormula:  '{Tube (id persistant)} = "tube1"',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableSkills });

      airtableGetChallengesAttachmentsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Attachments')
        .query({
          filterByFormula:  'OR(' + localizedChallenges.map((l) => `{localizedChallengeId} = ${stringValue(l.id)}`).join(',') + ')',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [attachment] });

      // skillRepository.create
      airtableCreateSkillScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Acquis/', {
          records: [{
            fields: {
              'id persistant': createdAirtableSkill.fields['id persistant'],
              'Statut de l\'indice': createdAirtableSkill.fields['Statut de l\'indice'],
              'Comprendre': createdAirtableSkill.fields['Comprendre'],
              'En savoir plus': createdAirtableSkill.fields['En savoir plus'],
              'Status': createdAirtableSkill.fields['Status'],
              'Tube': createdAirtableSkill.fields['Tube'],
              'Description': createdAirtableSkill.fields['Description'],
              'Statut de la description': createdAirtableSkill.fields['Statut de la description'],
              'Level': createdAirtableSkill.fields['Level'],
              'Internationalisation': createdAirtableSkill.fields['Internationalisation'],
              'Version': createdAirtableSkill.fields['Version'],
            }
          }],
        })
        .query({ })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, {
          records: [{
            id: clonedSkillAirtableId,
            fields: { ...createdAirtableSkill.fields, 'Record Id': clonedSkillAirtableId }
          }]
        });

      // challengeRepository.createBatch
      airtableGetSkillAirtableIdsByIdsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .query({
          fields: {
            '': ['Record Id', 'id persistant'],
          },
          filterByFormula:  'OR("clonedAcquisId" = {id persistant})',
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [{
          fields: {
            'id persistant': 'clonedAcquisId',
            'Record Id': clonedSkillAirtableId
          }
        }]
        });

      airtableCreateChallengesScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Epreuves/', {
          records: [{
            fields: createdChallengeFields
          }],
        })
        .query({ })
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
        .reply(200, { records: [{
          fields: {
            'id persistant': 'clonedChallengeId',
            'Record ID': 'recChallengeProtoCloned'
          }
        }]
        });

      airtableCreateAttachmentsScope = nock('https://api.airtable.com')
        .post('/v0/airtableBaseValue/Attachments/', {
          records: [{
            fields: createdAttachmentFields,
          }],
        })
        .query({ })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [
          {
            id:'recOsef',
            fields: {
              ...createdAttachmentFields,
              'Record ID': 'recOsef',
              'challengeId persistant':'clonedChallengeId'
            }
          }
        ] });

      // update pix api staging cache

      const pixApiToken = 'secret';
      nock('https://api.test.pix.fr')
        .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, { 'access_token': pixApiToken });

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
      await knex('translations').truncate();
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
              'level': dataToPost.level,
              'tubeDestinationId': dataToPost.tubeDestinationId,
              'skillIdToClone': dataToPost.skillIdToClone,
            },
          },
        },
        headers: generateAuthorizationHeader(editorUser),
      });

      // then
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
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toMatch('/api/skills/');

      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toStrictEqual([
        { key: 'challenge.clonedChallengeId.instruction', locale: 'fr', value: 'Juste une trad ?' },
        { key: 'challenge.validatedChallengeProto.instruction', locale: 'fr', value: 'Juste une trad ?' },
        { key: 'challenge.validatedChallengeProto.instruction', locale: 'nl', value: 'Slechts een vertaling ?' },
        { key: 'skill.clonedAcquisId.hint', locale: 'en', value: 'AIRTABLE IS SO FUN OMG 🥰' },
        { key: 'skill.clonedAcquisId.hint', locale: 'fr', value: 'C\'est chaud-nen' },
        { key: 'skill.skill1Tube1.hint', locale: 'en', value: 'AIRTABLE IS SO FUN OMG 🥰' },
        { key: 'skill.skill1Tube1.hint', locale: 'fr', value: 'C\'est chaud-nen' },
      ]);
    });
  });
});
