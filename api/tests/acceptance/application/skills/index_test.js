import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader, } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import nock from 'nock';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import { stringValue } from '../../../../lib/infrastructure/airtable.js';

describe('Acceptance | API | skills', function() {
  describe('GET /api/skills/{skillId}/challenges-production', () => {
    it('returns the primary challenges list', async function() {
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
          ...generateAuthorizationHeader(user),
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
});
