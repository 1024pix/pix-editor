import { describe, expect, it } from 'vitest';
import { databaseBuilder } from '../../../test-helper.js';
import { getBrokenUrlList } from '../../../../lib/domain/usecases/index.js';

describe('Integration | Domain | Usecases | Get broken links', function() {
  describe('#getBrokenUrlList', function() {
    it('should return all challenges and tutorials with broken links', async function() {
      // given
      databaseBuilder.factory.buildBrokenUrl({
        url: 'https://ui.pix.fr',
        statusCode: 400,
      });
      databaseBuilder.factory.buildBrokenUrl({
        url: 'http://commant-pix-ui-fonctionne.org',
        statusCode: 404,
      });
      const challenge = databaseBuilder.factory.buildChallengeExternalUrl({
        framework_name: 'Pix',
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        challenge_id: 'challenge2',
        challenge_status: 'validé',
        locale: 'fr',
        url: 'https://ui.pix.fr',
      });
      const tutorial = databaseBuilder.factory.buildTutorialExternalUrl({
        competence_name: 'Nom de competence',
        skill_name: '@patateDouce',
        tutorial_id: 'tutorial1',
        url: 'http://commant-pix-ui-fonctionne.org',
      });

      await databaseBuilder.commit();

      // when
      const brokenChallengesAndTutorials = await getBrokenUrlList();

      // then
      expect(brokenChallengesAndTutorials).toStrictEqual({
        challenges: [{ id: expect.any(Number), ...challenge }],
        tutorials: [{ id: expect.any(Number), ...tutorial }],
      });
    });
  });
});
