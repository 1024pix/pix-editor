import { it, describe, expect } from 'vitest';
import {
  databaseBuilder,
  domainBuilder,
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

      const competence = domainBuilder.buildCompetenceForRelease({
        id: 'competenceId',
        name_i18n: {
          fr: 'Ma competence',
          en: 'My comptence'
        },
        origin: 'pix',
      });

      const tube = domainBuilder.buildTubeForRelease({
        id: 'tubeId',
        name: '@sujet',
        competenceId: competence.id
      });

      const skill = domainBuilder.buildSkillForRelease({
        id: 'skillId',
        name: '@sujet1',
        tubeId: tube.id,
        competenceId: competence.id,
      });

      const challenge = domainBuilder.buildChallengeForRelease({
        id: 'challengeId1',
        skillId: skill.id,
        instruction: 'mon instruction go visite mon [site](https://epreuves.pix.fr/fr/mon-embed/lilou.html)',
        embedUrl: 'https://epreuves.pix.fr/mon-embed.html?mode=coucou&lang=fr',
      });

      databaseBuilder.factory.buildRelease({
        content: domainBuilder.buildContentForRelease({
          competences: [competence],
          tubes: [tube],
          skills: [skill],
          challenges: [challenge]
        })
      });

      await databaseBuilder.commit();

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

      expect(headers).to.deep.equal(['origin', 'competence', 'acquis','challengeId', 'embedUrl', 'status']);
      expect(data).to.deep.equal([
        [
          'pix',
          'Ma competence',
          '@sujet1',
          'challengeId1',
          'https://epreuves.pix.fr/fr/mon-embed/lilou.html',
          'validé'
        ],
        [
          'pix',
          'Ma competence',
          '@sujet1',
          'challengeId1',
          'https://epreuves.pix.fr/mon-embed.html?mode=coucou&lang=fr',
          'validé'
        ]
      ]);
    });
  });
});
