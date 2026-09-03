import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { urlRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Integration | Repository | url-repository', () => {
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

  describe('batchResetAndInsert', () => {
    it('should insert a list of external urls after emptying the base', async () => {
      // given
      const existingTutorial = databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ tagIds: [] }));
      const { localizedChallenge: existingLocalizedChallenge } = databaseBuilder.factory.buildChallengeInGroup({ skill: { tutorialIds: [existingTutorial.id] } });
      databaseBuilder.factory.buildExternalUrl({ url: 'https://ui.pix.org', localizedChallengeIds: [existingLocalizedChallenge.id], tutorialIds: [existingTutorial.id] });

      const tutorial = databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'recMonTuto', tagIds: [] }));
      const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge(domainBuilder.buildLocalizedChallenge({
        id: 'recMonLocalizedChallengeId',
        challengeId: existingLocalizedChallenge.challengeId,
        locale: 'fr-FR',
      }));

      await databaseBuilder.commit();

      const newExternalurl = { url: 'https://pix.fr', localizedChallengeIds: [localizedChallenge.id], tutorialIds: [tutorial.id] };

      // when
      await urlRepository.batchResetAndInsert([newExternalurl]);

      // then
      const externalUrls = await knex('external_urls').select('*');
      const externalUrlLocalizedChallengeRelations = await knex('external_urls-localized_challenges').select('*');
      const externalUrlTutorialRelations = await knex('external_urls-tutorials').select('*');

      expect(externalUrls).toStrictEqual([
        {
          id: expect.any(Number),
          url: newExternalurl.url,
        },
      ]);
      expect(externalUrlLocalizedChallengeRelations).toStrictEqual([
        {
          externalUrlId: externalUrls[0].id,
          localizedChallengeId: localizedChallenge.id,
        },
      ]);
      expect(externalUrlTutorialRelations).toStrictEqual([
        {
          externalUrlId: externalUrls[0].id,
          tutorialId: tutorial.id,
        },
      ]);
    });
  });
});
