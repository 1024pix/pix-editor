import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateBrokenLinksMonitorAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';

describe('Acceptance | Controller | external-urls', () => {
  describe('GET /api/external-urls', async () => {
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
        databaseBuilder.factory.buildChallengeExternalUrl({
          challenge_id: 'myChallengeId',
          challenge_status: 'en prod peut-être',
          competence_name: 'la pêche écoresponsable',
          framework_name: 'Pix+Nature',
          locale: 'fr',
          skill_name: '@saumon5',
          url: 'https://peche.pix.org',
        });
        databaseBuilder.factory.buildChallengeExternalUrl({
          challenge_id: 'myChallengeId2',
          challenge_status: 'en prod !',
          competence_name: 'la pêche écoresponsable',
          framework_name: 'Pix+Nature',
          locale: 'fr',
          skill_name: '@saumon4',
          url: 'https://saumon.pix.org',
        });
        databaseBuilder.factory.buildChallengeExternalUrl({
          challenge_id: 'myChallengeId3',
          challenge_status: 'pas en prod :(',
          competence_name: 'la pêche écoresponsable',
          framework_name: 'Pix+Nature',
          locale: 'fr',
          skill_name: '@saumon8',
          url: 'https://peche-pro.pix.org',
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
        expect(response.result).to.deep.equal('<!DOCTYPE html><html><body><a href="https://peche-pro.pix.org">c myChallengeId3</a></body><style>a{display:block;}</style></html>');
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
        databaseBuilder.factory.buildChallengeExternalUrl({
          challenge_id: 'myChallengeId',
          challenge_status: 'en prod peut-être',
          competence_name: 'la pêche écoresponsable',
          framework_name: 'Pix+Nature',
          locale: 'fr',
          skill_name: '@saumon5',
          url: 'https://peche.pix.org',
        });
        databaseBuilder.factory.buildChallengeExternalUrl({
          challenge_id: 'myChallengeId2',
          challenge_status: 'en prod !',
          competence_name: 'la pêche écoresponsable',
          framework_name: 'Pix+Nature',
          locale: 'fr',
          skill_name: '@saumon4',
          url: 'https://saumon.pix.org',
        });
        databaseBuilder.factory.buildChallengeExternalUrl({
          challenge_id: 'myChallengeId3',
          challenge_status: 'pas en prod :(',
          competence_name: 'la pêche écoresponsable',
          framework_name: 'Pix+Nature',
          locale: 'fr',
          skill_name: '@saumon8',
          url: 'https://peche-pro.pix.org',
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/external-urls?page=1',
          headers: generateBrokenLinksMonitorAuthorizationHeader(),
        });

        // Then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.includes('text/html');
        expect(response.result).to.deep.equal('<!DOCTYPE html><html><body><a href="https://peche.pix.org">c myChallengeId</a><a href="https://saumon.pix.org">c myChallengeId2</a></body><style>a{display:block;}</style></html>');
      });
    });
  });
});
