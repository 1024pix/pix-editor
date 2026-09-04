import { describe, expect, it, beforeEach } from 'vitest';
import { databaseBuilder, domainBuilder, generateBrokenLinksMonitorAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';

describe('Acceptance | Controller | external-urls', () => {
  describe('GET /api/external-urls', async () => {
    beforeEach(async function() {
      const { challenge } = databaseBuilder.factory.buildChallengeInGroup({});

      const localized1 = databaseBuilder.factory.buildLocalizedChallenge({ id: 'recLocalized1', challengeId: challenge.id, locale: 'fr-FR1' });
      databaseBuilder.factory.buildExternalUrl({
        id: 123,
        url: 'https://peche.pix.org',
        localizedChallengeIds: [localized1.id],
        tutorialIds: [],
      });

      const localized2 = databaseBuilder.factory.buildLocalizedChallenge({ id: 'recLocalized2', challengeId: challenge.id, locale: 'fr-FR2' });
      const tutorial1 = databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'recTuto1', url: 'https://ui.pix.fr', tagIds: [] }));
      databaseBuilder.factory.buildExternalUrl({
        id: 456,
        url: 'https://saumon.pix.org',
        localizedChallengeIds: [localized2.id],
        tutorialIds: [tutorial1.id],
      });

      const localized3 = databaseBuilder.factory.buildLocalizedChallenge({ id: 'recLocalized3', challengeId: challenge.id, locale: 'fr-FR3' });
      databaseBuilder.factory.buildExternalUrl({
        id: 789,
        url: 'https://peche-pro.pix.org',
        tutorialIds: [],
        localizedChallengeIds: [localized2.id, localized3.id],
      });

      const tutorial2 = databaseBuilder.factory.buildTutorial(
        domainBuilder.buildTutorialDatasourceObject({ id: 'recTuto2', url: 'http://comment-pix-ui-fonctionne.org', tagIds: [] }),
      );
      databaseBuilder.factory.buildExternalUrl({
        id: 999,
        tutorialIds: [tutorial2.id],
        localizedChallengeIds: [],
        url: 'https://patate.pix.org',
      });

      await databaseBuilder.commit();
    });

    const server = await createServer();

    it('should return a 401 status code when requester is not broken links monitor', async () => {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/external-urls?page=1',
      });

      // then
      expect(response.statusCode).toStrictEqual(401);
      expect(response.result).to.deep.equal({
        errors: [
          {
            code: 401,
            detail: 'Missing or invalid access token in request X-API-Key header.',
            title: 'Unauthorized access',
          },
        ],
      });
    });

    describe('when sending pagination params', () => {
      it('should return the given page of external urls', async () => {
        // given
        const editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'editor' });
        databaseBuilder.factory.buildWhitelistedUrl({
          id: 123,
          createdBy: editorUser.id,
          latestUpdatedBy: editorUser.id,
          deletedBy: null,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          deletedAt: null,
          url: 'https://peche.pix.org',
          relatedSkillNames: '@morse2,@saumon5',
          comment: 'Je décide de whitelister ça car mon cousin travaille chez Pix',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/external-urls?page=2',
          headers: generateBrokenLinksMonitorAuthorizationHeader(),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.includes('text/html');
        expect(response.result).to.deep.equal('<!DOCTYPE html><html><body><a href="https://peche.pix.org">123</a><a href="https://saumon.pix.org">456</a></body><style>a{display:block;}</style></html>');
      });
    });

    describe('when not sending pagination params', () => {
      it('should return the first page of external urls', async () => {
        // given
        const editorUser = databaseBuilder.factory.buildUser({ name: 'Madame Editor', access: 'editor' });

        databaseBuilder.factory.buildWhitelistedUrl({
          id: 123,
          createdBy: editorUser.id,
          latestUpdatedBy: editorUser.id,
          deletedBy: null,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2022-02-02'),
          deletedAt: null,
          url: 'https://peche.pix.org',
          relatedSkillNames: '@morse2,@saumon5',
          comment: 'Je décide de whitelister ça car mon cousin travaille chez Pix',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/external-urls',
          headers: generateBrokenLinksMonitorAuthorizationHeader(),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.includes('text/html');
        expect(response.result).to.deep.equal('<!DOCTYPE html><html><body><a href="https://patate.pix.org">999</a><a href="https://peche-pro.pix.org">789</a></body><style>a{display:block;}</style></html>');
      });
    });
  });
});
