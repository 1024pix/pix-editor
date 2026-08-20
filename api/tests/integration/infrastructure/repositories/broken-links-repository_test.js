import nock from 'nock';
import { describe, expect, it } from 'vitest';
import * as brokenLinksRepository from '../../../../lib/infrastructure/repositories/broken-links-repository.js';
import { urlBrokenLinksMonitor } from '../../../../lib/config.js';
import { databaseBuilder } from '../../../test-helper.js';

describe('Integration | Repository | broken-links-repository', () => {
  const getOhDearNock = () => nock(urlBrokenLinksMonitor.ohdearBaseUrl, { reqheaders: { authorization: `Bearer ${urlBrokenLinksMonitor.ohdearToken}` } });

  describe('#fetchBrokenLinks', () => {
    it('returns a list of broken links', async function() {
      const challengeExternalUrl1 = databaseBuilder.factory.buildChallengeExternalUrl({
        challenge_id: 'recChallengeId1, recChallengeId123',
        challenge_status: 'validé',
        locale: 'fr',
        url: 'https://example.com/broken',
        competence_name: 'Connaître et utiliser internet',
        framework_name: 'Pix',
        skill_name: '@internet1',
      });
      const challengeExternalUrl2 = databaseBuilder.factory.buildChallengeExternalUrl({
        challenge_id: 'recChallengeId2, recChallengeId234',
        challenge_status: 'archivé',
        locale: 'en',
        url: 'https://example.com/unauthorized',
        competence_name: 'Le piratage pour les nuls',
        framework_name: 'CyberPix',
        skill_name: '@bruteforcing2',
      });
      const challengeExternalUrl3 = databaseBuilder.factory.buildChallengeExternalUrl({
        challenge_id: 'recChallengeId3, recChallengeId345',
        challenge_status: 'validé',
        locale: 'fr-BE',
        url: 'https://example.com/dns-error',
        competence_name: 'Le pare-feu',
        framework_name: 'CyberPix',
        skill_name: '@dns4',
      });
      const tutorialExternalUrl1 = databaseBuilder.factory.buildTutorialExternalUrl({
        tutorial_id: 'recTutorialId2, recTutorialId789',
        competence_name: 'Les patates',
        skill_name: '@patateDouce3',
        url: 'https://example.com/not-found',
      });
      await databaseBuilder.commit();

      const monitorsScope = getOhDearNock()
        .get('/api/monitors')
        .reply(200, {
          data: [
            {
              id: 123,
              url: 'https://editor.pix.fr/api/external-urls?page=1',
            },
            {
              id: 456,
              url: 'https://editor.pix.fr/api/external-urls?page=2',
            },
          ],
        });
      const firstPageScope = getOhDearNock()
        .get('/api/broken-links/123')
        .reply(200, {
          data: [
            {
              status_code: 404,
              crawled_url: 'https://example.com/broken',
              link_text: 'c recChallengeId1',
              error_message: null,
            },
            {
              status_code: 401,
              crawled_url: 'https://example.com/unauthorized',
              link_text: 'c recChallengeId2',
              error_message: null,
            },
          ],
          meta: {
            run_id: 123456,
            run_started_at: '2026-08-20T00:30:00+00:00',
            run_ended_at: '2026-08-20T00:53:58+00:00',
          },
        });
      const secondPageScope = getOhDearNock()
        .get('/api/broken-links/456')
        .reply(200, {
          data: [
            {
              status_code: null,
              crawled_url: 'https://example.com/dns-errror',
              link_text: 'c recChallengeId3',
              error_message: 'getaddrinfo ENOTFOUND https://example.com/dns-errror',
            },
            {
              status_code: 404,
              crawled_url: 'https://example.com/not-found',
              link_text: 't recTutorialId2',
              error_message: null,
            },
          ],
          meta: {
            run_id: 123456,
            run_started_at: '2026-08-20T00:30:00+00:00',
            run_ended_at: '2026-08-20T00:53:58+00:00',
          },
        });

      const brokenLinks = await brokenLinksRepository.fetchBrokenLinks();

      expect(monitorsScope.isDone()).to.be.true;
      expect(firstPageScope.isDone()).to.be.true;
      expect(secondPageScope.isDone()).to.be.true;
      expect(brokenLinks).to.deep.equal(
        [
          {
            challengeStatuses: challengeExternalUrl1.challenge_status.split(', '),
            competenceNames: challengeExternalUrl1.competence_name.split(', '),
            crawledUrl: 'https://example.com/broken',
            entityIds: challengeExternalUrl1.challenge_id.split(', '),
            entityType: 'challenge',
            errorMessage: null,
            frameworkNames: challengeExternalUrl1.framework_name.split(', '),
            skillNames: challengeExternalUrl1.skill_name.split(', '),
            statusCode: 404,
          },
          {
            challengeStatuses: challengeExternalUrl2.challenge_status.split(', '),
            competenceNames: challengeExternalUrl2.competence_name.split(', '),
            crawledUrl: 'https://example.com/unauthorized',
            entityIds: challengeExternalUrl1.challenge_id.split(', '),
            entityType: 'challenge',
            errorMessage: null,
            frameworkNames: challengeExternalUrl2.framework_name.split(', '),
            skillNames: challengeExternalUrl2.skill_name.split(', '),
            statusCode: 401,
          },
          {
            challengeStatuses: challengeExternalUrl3.challenge_status.split(', '),
            competenceNames: challengeExternalUrl3.competence_name.split(', '),
            crawledUrl: 'https://example.com/dns-errror',
            entityIds: challengeExternalUrl3.challenge_id.split(', '),
            entityType: 'challenge',
            errorMessage: 'getaddrinfo ENOTFOUND https://example.com/dns-errror',
            frameworkNames: challengeExternalUrl3.framework_name.split(', '),
            skillNames: challengeExternalUrl3.skill_name.split(', '),
            statusCode: null,
          },
          {
            competenceNames: tutorialExternalUrl1.competence_name.split(', '),
            crawledUrl: 'https://example.com/not-found',
            entityIds: tutorialExternalUrl1.tutorial_id.split(', '),
            entityType: 'tutorial',
            errorMessage: null,
            skillNames: tutorialExternalUrl1.skill_name.split(', '),
            statusCode: 404,
          },
        ],
      );
    });
  });
});
