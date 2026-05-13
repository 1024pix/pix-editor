import { beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../../../../server.js';

import { databaseBuilder, generateAuthorizationHeader, domainBuilder } from '../../../test-helper';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Application | Route | Search', () => {
  let user;

  beforeEach(async function() {
    const challenge = domainBuilder.buildChallengeDatasourceObject({
      id: 'recId1',
      version: 1,
      geography: 'XX',
      files: [],
      competenceId: 'competence1',
      locales: ['fr-FR'],
      status: 'validé',
      skillId: 'skillId1',
      embedUrl: 'https://embed-url.html',
    });
    const decli = domainBuilder.buildChallengeDatasourceObject({
      id: 'recId2',
      version: 1,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      geography: 'XX',
      files: [],
      competenceId: 'competence1',
      locales: ['fr-FR'],
      status: 'validé',
      skillId: 'skillId1',
      embedUrl: 'https://embed-url.html',
    });

    const localizedChallenge = domainBuilder.buildChallengeDatasourceObject({
      id: 'localizedChallengeId',
      geography: 'XX',
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      version: 1,
      files: [],
      competenceId: 'competence1',
      locales: ['nl'],
      status: 'proposé',
      skillId: 'skillId1',
      embedUrl: 'https://embed-url-nl.html',
    });

    user = databaseBuilder.factory.buildReadonlyUser();
    databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
    databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
    databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
    databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
    databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
    databaseBuilder.factory.buildSkill({ id: 'skillId1', level: 5, tubeId: 'tube1', status: 'en construction', version: 6 });
    databaseBuilder.factory.buildChallenge(challenge);
    databaseBuilder.factory.buildChallenge(decli);
    databaseBuilder.factory.buildChallenge(localizedChallenge);

    databaseBuilder.factory.buildTranslation({
      key: 'challenge.recId1.instruction',
      locale: 'fr-FR',
      value: 'Bobby, un petit écureuil maladroit est tombé de l\'arbre',
    });

    databaseBuilder.factory.buildTranslation({
      key: 'challenge.recId2.instruction',
      locale: 'fr-FR',
      value: 'Brian, un petit écureuil maladroit est tombé de l\'arbre',
    });

    databaseBuilder.factory.buildTranslation({
      key: 'challenge.recId2.instruction',
      locale: 'nl',
      value: 'Bobï, een kleine, onhandige eekhoorn is uit de boom gevallen',
    });

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recId1',
      challengeId: 'recId1',
      locale: 'fr-FR',
      embedUrl: 'https://embed-url.html',
    });

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'recId2',
      challengeId: 'recId2',
      locale: 'fr-FR',
      embedUrl: 'https://embed-url-2.html',
    });

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeId',
      challengeId: 'recId2',
      locale: 'nl',
      embedUrl: 'https://embed-url.html?lang=nl',
      status: LocalizedChallenge.STATUSES.PAUSE,
    });

    await databaseBuilder.commit();
  });

  describe('GET /api/search', () => {
    it('returns a list of search result when a skill name is typed', async function() {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/search?filter[name]=@tube5',
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.payload)).to.deep.equal({
        data: [
          {
            type: 'search-results',
            id: 'skillId1',
            attributes: {
              type: 'skill',
              status: 'en construction',
              title: '@tube5',
              version: 6,
            },
          },
        ],
      });
    });

    it('returns a list of search result when instruction challenge is typed', async function() {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/search?filter[name]=bob',
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.payload)).to.deep.equal({
        data: [
          {
            type: 'search-results',
            id: 'challengeId',
            attributes: {
              type: 'challenge',
              status: Challenge.STATUSES.PROPOSE,
              title: 'Bobï, een kleine, onhandige eekhoorn is uit de boom gevallen',
              locale: 'nl',
              'is-primary': false,
            },
          },
          {
            type: 'search-results',
            id: 'recId1',
            attributes: {
              type: 'challenge',
              status: Challenge.STATUSES.VALIDE,
              title: 'Bobby, un petit écureuil maladroit est tombé de l\'arbre',
              locale: 'fr-FR',
              'is-primary': true,
            },
          },
        ],
      });
    });

    it('returns a list of search result when an embedUrl is typed', async function() {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/search?filter[name]=embed-url.html',
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.payload)).to.deep.equal({
        data: [
          {
            type: 'search-results',
            id: 'challengeId',
            attributes: {
              type: 'challenge',
              status: Challenge.STATUSES.PROPOSE,
              title: 'Bobï, een kleine, onhandige eekhoorn is uit de boom gevallen',
              locale: 'nl',
              'is-primary': false,
            },
          },
          {
            type: 'search-results',
            id: 'recId1',
            attributes: {
              type: 'challenge',
              status: Challenge.STATUSES.VALIDE,
              title: 'Bobby, un petit écureuil maladroit est tombé de l\'arbre',
              locale: 'fr-FR',
              'is-primary': true,
            },
          },
        ],
      });
    });

    it('returns a list of search result when an id is typed', async function() {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/search?filter[name]=recId1',
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.payload)).to.deep.equal({
        data: [
          {
            type: 'search-results',
            id: 'recId1',
            attributes: {
              type: 'challenge',
              status: Challenge.STATUSES.VALIDE,
              title: 'Bobby, un petit écureuil maladroit est tombé de l\'arbre',
              locale: 'fr-FR',
              'is-primary': true,
            },
          },
        ],
      });
    });

    it('returns a list of search result when an id of a localized challenge is typed', async function() {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/search?filter[name]=challengeId',
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.payload)).to.deep.equal({
        data: [
          {
            type: 'search-results',
            id: 'challengeId',
            attributes: {
              type: 'challenge',
              status: Challenge.STATUSES.PROPOSE,
              title: 'Bobï, een kleine, onhandige eekhoorn is uit de boom gevallen',
              locale: 'nl',
              'is-primary': false,
            },
          },
        ],
      });
    });
  });
});
