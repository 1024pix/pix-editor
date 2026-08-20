import { describe, expect, it } from 'vitest';
import { databaseBuilder } from '../../../test-helper.js';
import { urlRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { getByUrlList } from '../../../../lib/infrastructure/repositories/url-repository.js';
import { database as challenge4 } from '../../../../lib/config.js';

describe('Integration | Repository | url-repository', () => {
  describe('get', () => {
    it('should return the list externale challenge and tutorial urls', async () => {
      // given
      databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge1',
        challenge_status: 'validé',
        locale: 'nl',
        url: 'https://ui.pix.org',
      });
      databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge2',
        challenge_status: 'validé',
        locale: 'fr',
        url: 'https://ui.pix.fr',
      });
      databaseBuilder.factory.buildTutorialExternalUrl({
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        tutorial_id: 'tutorial1',
        url: 'http://commant-pix-ui-fonctionne.org',
      });

      await databaseBuilder.commit();

      // when
      const urls = await urlRepository.get();

      // then
      expect(urls).toStrictEqual({
        challengeExternalUrls: [
          {
            id: expect.any(Number),
            framework_name: 'Pix',
            competence_name: 'Nom de competence',
            skill_name: '@patateDouce',
            challenge_id: 'challenge1',
            challenge_status: 'validé',
            locale: 'nl',
            url: 'https://ui.pix.org',
          },
          {
            id: expect.any(Number),
            framework_name: 'Pix',
            competence_name: 'Nom de competence',
            skill_name: '@patateDouce',
            challenge_id: 'challenge2',
            challenge_status: 'validé',
            locale: 'fr',
            url: 'https://ui.pix.fr',
          },
        ],
        tutorialExternalUrls: [
          {
            id: expect.any(Number),
            competence_name: 'Nom de competence',
            skill_name: '@patateDouce',
            tutorial_id: 'tutorial1',
            url: 'http://commant-pix-ui-fonctionne.org',
          },
        ],
      });
    });
  });

  describe('getWithPagination', () => {
    it('should return a page of external urls', async () => {
      // given
      databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge1',
        challenge_status: 'validé',
        locale: 'nl',
        url: 'https://ui.pix.org',
      });
      databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge2',
        challenge_status: 'validé',
        locale: 'fr',
        url: 'https://ui.pix.fr',
      });
      databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge3',
        challenge_status: 'validé',
        locale: 'fr',
        url: 'https://ui.pix.fr',
      });
      databaseBuilder.factory.buildTutorialExternalUrl({
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        tutorial_id: 'tutorial1',
        url: 'http://commant-pix-ui-fonctionne.org',
      });

      await databaseBuilder.commit();

      // when
      const urls = await urlRepository.getWithPagination({ number: 2, size: 2 });

      // then
      expect(urls).toStrictEqual(
        [
          {
            id: 'challenge3',
            url: 'https://ui.pix.fr',
            type: 'challenge',
          },
          {
            id: 'tutorial1',
            url: 'http://commant-pix-ui-fonctionne.org',
            type: 'tutorial',
          },
        ],
      );
    });
  });

  describe('getByUrlList', () => {
    it('should return a list of external urls with given list of urls', async () => {
      const challenge1 = databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge1',
        challenge_status: 'validé',
        locale: 'nl',
        url: 'https://ui.pix.org',
      });
      const challenge2 = databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge2',
        challenge_status: 'validé',
        locale: 'fr',
        url: 'https://ui.pix.fr',
      });
      const challenge3 = databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge3',
        challenge_status: 'validé',
        locale: 'fr',
        url: 'https://ui.pix.fr',
      });
      const tutorial1 = databaseBuilder.factory.buildTutorialExternalUrl({
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        tutorial_id: 'tutorial1',
        url: 'http://commant-pix-ui-fonctionne.org',
      });

      await databaseBuilder.commit();

      const givenUrlList = [
        challenge1.url,
        challenge2.url,
        challenge3.url,
        tutorial1.url,
      ];

      const externalUrlList = await urlRepository.getByUrlList(givenUrlList);

      const expectedResult = [
        { id: challenge1.challenge_id, url: challenge1.url, type: 'challenge' },
        { id: challenge2.challenge_id, url: challenge2.url, type: 'challenge' },
        { id: challenge3.challenge_id, url: challenge3.url, type: 'challenge' },
        { id: tutorial1.tutorial_id, url: tutorial1.url, type: 'tutorial' },
      ];

      expect(externalUrlList).toStrictEqual(expectedResult);
    });
  });
});
