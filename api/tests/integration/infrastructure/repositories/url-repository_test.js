import { describe, expect, it } from 'vitest';
import { databaseBuilder } from '../../../test-helper.js';
import { urlRepository } from '../../../../lib/infrastructure/repositories/index.js';

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

  describe('getChallengesFromUrl', () => {
    it('should return a list of challenges external URL', async () => {
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
      databaseBuilder.factory.buildTutorialExternalUrl({
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        tutorial_id: 'tutorial1',
        url: 'http://commant-pix-ui-fonctionne.org',
      });

      await databaseBuilder.commit();

      // when
      const urls = await urlRepository.getChallengesFromUrl(['https://ui.pix.fr', 'http://test.com']);

      // then
      expect(urls).toStrictEqual(
        [
          {
            id: expect.any(Number),
            ...challenge2,
          },
          {
            id: expect.any(Number),
            ...challenge3,
          },
        ],
      );
    });
  });

  describe('getTutorialsFromUrl', () => {
    it('should return a list of tutorials external URL', async () => {
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
      const tutorial2 = databaseBuilder.factory.buildTutorialExternalUrl({
        competence_name: 'Nom de competence2',
        skill_name: '@patate',
        tutorial_id: 'tutorial2',
        url: 'https://ui.pix.fr',
      });

      await databaseBuilder.commit();

      // when
      const urls = await urlRepository.getTutorialsFromUrl(['https://ui.pix.fr', 'http://test.com']);

      // then
      expect(urls).toStrictEqual(
        [
          {
            id: expect.any(Number),
            ...tutorial2,
          },
        ],
      );
    });
  });
});
