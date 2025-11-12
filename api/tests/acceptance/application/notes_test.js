import nock from 'nock';
import { describe, it, expect } from 'vitest';
import { Note } from '../../../lib/domain/models/index.js';
import { createServer } from '../../../server.js';
import { databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';

describe('Acceptance | Routes | Notes', () => {
  describe('GET /notes', () => {
    it('returns notes for a challenge', async function() {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

      const challengeId = 'challengeAbc123';

      const airtableNotes = [
        {
          id: 'rec123',
          fields: {
            Texte: 'Un texte',
            Auteur: 'NLE',
            Changelog: 'non',
            Date: new Date('2025-11-12T14:39:00Z'),
            Record_Id: challengeId,
            Statut: Note.STATUSES.TERMINE,
          },
        },
        {
          id: 'rec456',
          fields: {
            Texte: 'Un autre texte',
            Auteur: 'FOO',
            Changelog: 'non',
            Date: new Date('2025-11-12T14:47:00Z'),
            Record_Id: challengeId,
            Statut: Note.STATUSES.EN_COURS,
          },
        },
      ];

      const airtableScope = nock('https://api.airtable.com')
        .get('/v0/airtableEditorBaseValue/Notes')
        .query({
          filterByFormula: `AND(Record_Id = "${challengeId}", Statut != "archive", Changelog = "non")`,
          sort: [{ field: 'Date', direction: 'asc' }],
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableNotes });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/notes?filter[challengeId]=${challengeId}`,
        headers: generateAuthorizationHeader(user),
      });

      // then
      expect(response.statusCode).toBe(200);

      expect(response.result).toStrictEqual({
        data: [
          {
            type: 'notes',
            id: 'rec123',
            attributes: {
              text: 'Un texte',
              author: 'NLE',
              'created-at': '2025-11-12T14:39:00.000Z',
              status: Note.STATUSES.TERMINE,
            },
          },
          {
            type: 'notes',
            id: 'rec456',
            attributes: {
              text: 'Un autre texte',
              author: 'FOO',
              'created-at': '2025-11-12T14:47:00.000Z',
              status: Note.STATUSES.EN_COURS,
            },
          },
        ],
      });

      expect(airtableScope.isDone()).toBe(true);
    });
  });
});
