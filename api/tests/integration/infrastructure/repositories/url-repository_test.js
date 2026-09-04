import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { urlRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Integration | Repository | url-repository', () => {
  describe('getWithPagination', () => {
    it('should return a page of external urls', async () => {
      // given
      const { challenge } = databaseBuilder.factory.buildChallengeInGroup({});

      const localized1 = databaseBuilder.factory.buildLocalizedChallenge({ id: 'recLocalized1', challengeId: challenge.id, locale: 'fr-FR1' });
      databaseBuilder.factory.buildExternalUrl({
        url: 'https://ui.pix.org',
        localizedChallengeIds: [localized1.id],
        tutorialIds: [],
      });

      const localized2 = databaseBuilder.factory.buildLocalizedChallenge({ id: 'recLocalized2', challengeId: challenge.id, locale: 'fr-FR2' });
      const tutorial1 = databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'recTuto1', url: 'https://ui.pix.fr', tagIds: [] }));
      databaseBuilder.factory.buildExternalUrl({
        url: 'https://ui.pix.fr',
        localizedChallengeIds: [localized2.id],
        tutorialIds: [tutorial1.id],
      });

      const localized3 = databaseBuilder.factory.buildLocalizedChallenge({ id: 'recLocalized3', challengeId: challenge.id, locale: 'fr-FR3' });
      databaseBuilder.factory.buildExternalUrl({
        url: 'https://orga.pix.fr',
        tutorialIds: [],
        localizedChallengeIds: [localized2.id, localized3.id],
      });

      const tutorial2 = databaseBuilder.factory.buildTutorial(
        domainBuilder.buildTutorialDatasourceObject({ id: 'recTuto2', url: 'http://comment-pix-ui-fonctionne.org', tagIds: [] }),
      );
      databaseBuilder.factory.buildExternalUrl({
        tutorialIds: [tutorial2.id],
        localizedChallengeIds: [],
        url: 'http://comment-pix-ui-fonctionne.org',
      });

      await databaseBuilder.commit();

      // when
      const urls = await urlRepository.getWithPagination({ number: 2, size: 2 });

      // then
      expect(urls).toStrictEqual(
        [
          {
            id: expect.any(Number),
            url: 'https://ui.pix.fr',
          },
          {
            id: expect.any(Number),
            url: 'https://ui.pix.org',
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
