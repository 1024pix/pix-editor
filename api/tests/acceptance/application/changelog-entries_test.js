import { describe, it, expect } from 'vitest';
import { ChangelogEntry } from '../../../lib/domain/models/index.js';
import { createServer } from '../../../server.js';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';

describe('Acceptance | Routes | Notes', () => {
  describe('GET /changelog-entries', () => {
    it('returns changelog entries for a challenge', async function() {
      // given
      const challengeId = 'challengeAbc123';

      const user = databaseBuilder.factory.buildAdminUser();

      databaseBuilder.factory.buildChangelogEntry({
        id: 'rec123',
        text: 'Un texte',
        author: 'NLE',
        elementId: challengeId,
        elementType: 'épreuve',
        createdAt: '2025-11-12T14:39:00.000Z',
      });
      databaseBuilder.factory.buildChangelogEntry({
        id: 'rec456',
        text: 'Un autre texte',
        author: 'FOO',
        elementId: challengeId,
        elementType: 'épreuve',
        createdAt: '2025-11-12T14:47:00.000Z',
      });

      await databaseBuilder.commit();

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/changelog-entries?filter[elementId]=${challengeId}`,
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toStrictEqual({
        data: [
          {
            type: 'changelog-entries',
            id: 'rec123',
            attributes: {
              text: 'Un texte',
              author: 'NLE',
              'created-at': new Date('2025-11-12T14:39:00Z'),
              'element-id': challengeId,
              'element-type': ChangelogEntry.ELEMENT_TYPES.EPREUVE,
            },
          },
          {
            type: 'changelog-entries',
            id: 'rec456',
            attributes: {
              text: 'Un autre texte',
              author: 'FOO',
              'created-at': new Date('2025-11-12T14:47:00Z'),
              'element-id': challengeId,
              'element-type': ChangelogEntry.ELEMENT_TYPES.EPREUVE,
            },
          },
        ],
      });
    });
  });

  describe('POST /changelog-entries', () => {
    it('returns 201 and created changelog entry', async function() {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

      const changelogEntry = new ChangelogEntry({
        id: 'changelog123',
        text: 'Un texte',
        author: 'NLE',
        createdAt: new Date('2025-11-10T16:33:00Z'),
        elementId: 'skillAbc123',
        elementType: ChangelogEntry.ELEMENT_TYPES.ACQUIS,
      });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/changelog-entries',
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'changelog-entries',
            attributes: {
              text: changelogEntry.text,
              author: changelogEntry.author,
              'element-id': 'skillAbc123',
              'element-type': ChangelogEntry.ELEMENT_TYPES.ACQUIS,
            },
          },
        },
      });

      // then
      expect(response.statusCode).toBe(201);
      expect(response.result).toStrictEqual({
        data: {
          type: 'changelog-entries',
          id: expect.stringMatching(/^changelog.+$/),
          attributes: {
            text: 'Un texte',
            author: 'NLE',
            'created-at': expect.any(Date),
            'element-id': changelogEntry.elementId,
            'element-type': ChangelogEntry.ELEMENT_TYPES.ACQUIS,
          },
        },
      });

      await expect(knex.select('*').from('changelog_entries')).resolves.toStrictEqual([
        {
          id: expect.stringMatching(/^changelog.+$/),
          text: 'Un texte',
          author: 'NLE',
          createdAt: expect.any(Date),
          elementId: changelogEntry.elementId,
          elementType: ChangelogEntry.ELEMENT_TYPES.ACQUIS,
        },
      ]);
    });
  });
});
