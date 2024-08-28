import { it, describe, expect } from 'vitest';
import {
  airtableBuilder,
  databaseBuilder,
  generateAuthorizationHeader,
  streamToPromiseArray
} from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { parseString as parseCSVString } from '@fast-csv/parse';

describe('Acceptance | Controller | embed', () => {

  describe('GET /embeds - list embed used by challenges', () => {
    it('should return a csv file', async () => {
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
        value: 'allez sur se site https://epreuves.pix.fr/fr/mon-embed/lilou.html'
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
        value: 'flüt truque https://epreuves.pix.fr/nl/mon-embed/lilou.html'
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeId_other',
        challengeId: 'challengeId_other',
        embedUrl: null,
        locale: 'fr',
        status: null
      });
      await databaseBuilder.commit();

      airtableBuilder.mockList({ tableName: 'Epreuves' })
        .returns(airtableChallenges)
        .activate();

      const server = await createServer();

      const getEmbedsOptions = {
        method: 'GET',
        url: '/api/embeds.csv',
        headers: generateAuthorizationHeader(user),
      };

      // when
      const response = await server.inject(getEmbedsOptions);

      const [headers, ...data] = await streamToPromiseArray(parseCSVString(response.payload));

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/csv; charset=utf-8');

      expect(headers).to.deep.equal(['challengeId', 'embedUrl', 'status']);
      expect(data).to.deep.equal([
        [
          'challengeId1',
          'https://epreuves.pix.fr/fr/mon-embed/lilou.html',
          'validé'
        ],
        [
          'challengeId1',
          'https://epreuves.pix.fr/mon-embed.html?mode=coucou&lang=fr',
          'validé'
        ]
      ]);
    });
  });
});
