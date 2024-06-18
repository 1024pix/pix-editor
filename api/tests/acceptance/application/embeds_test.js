import { it, describe, expect } from 'vitest';
import { airtableBuilder, databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | embed', () => {

  describe('GET /embeds - list embed used by challenges', () => {
    it('should liste embed url by challenge id', async () => {
      // given
      const user = databaseBuilder.factory.buildAdminUser();

      const airtableChallenges = [
        airtableBuilder.factory.buildChallenge({
          id: 'challengeId1',
          status: 'validé'
        }),
        airtableBuilder.factory.buildChallenge({
          id: 'challengeId_other',
          status: 'validé'
        })];

      const localizedChallenge1 = databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeId1',
        challengeId: 'challengeId1',
        embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=coucou&lang=fr',
        locale: 'fr',
        status: null
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${localizedChallenge1.challengeId}.instruction`,
        locale: 'fr',
        value: 'allez sur se site https://epreuves.pix.fr/fr/coucou/mon-embed.html'
      });

      const localizedChallenge1NL = databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeId1NL',
        challengeId: 'challengeId1',
        embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=coucou&lang=nl',
        locale: 'nl',
        status: 'proposé'
      });
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${localizedChallenge1NL.challengeId}.instruction`,
        locale: 'nl',
        value: 'flüt truque https://epreuves.pix.fr/fr/coucou/mon-embed.html'
      });

      await databaseBuilder.commit();
      const server = await createServer();
      const getEmbedsOptions = {
        method: 'GET',
        url: '/api/embeds',
        headers: generateAuthorizationHeader(user),
      };

      // when
      const response = await server.inject(getEmbedsOptions);

      // then
      expect(response.statusCode).to.equal(200);

    });
  });
});
