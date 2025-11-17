import nock from 'nock';
import { describe, it, expect } from 'vitest';
import { ChangelogEntry } from '../../../lib/domain/models/index.js';
import { createServer } from '../../../server.js';
import { databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';
import Airtable from 'airtable';

const { Record: AirtableRecord } = Airtable;

describe('Acceptance | Routes | Notes', () => {
  describe('GET /changelog-entries', () => {
    it('returns changelog entries for a challenge', async function() {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

      const challengeId = 'challengeAbc123';

      const airtableChangelogEntries = [
        {
          id: 'rec123',
          fields: {
            Texte: 'Un texte',
            Auteur: 'NLE',
            Changelog: 'oui',
            Date: new Date('2025-11-12T14:39:00Z'),
            Record_Id: challengeId,
            "Type d'élément": 'épreuve',
          },
        },
        {
          id: 'rec456',
          fields: {
            Texte: 'Un autre texte',
            Auteur: 'FOO',
            Changelog: 'oui',
            Date: new Date('2025-11-12T14:47:00Z'),
            Record_Id: challengeId,
            "Type d'élément": 'épreuve',
          },
        },
      ];

      const airtableScope = nock('https://api.airtable.com')
        .get('/v0/airtableEditorBaseValue/Notes')
        .query({
          filterByFormula: `AND(Record_Id = "${challengeId}", Changelog = "oui")`,
          sort: [{ field: 'Date', direction: 'asc' }],
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: airtableChangelogEntries });

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
              'created-at': '2025-11-12T14:39:00.000Z',
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
              'created-at': '2025-11-12T14:47:00.000Z',
              'element-id': challengeId,
              'element-type': ChangelogEntry.ELEMENT_TYPES.EPREUVE,
            },
          },
        ],
      });

      expect(airtableScope.isDone()).toBe(true);
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

      const airtableChangelogEntry = {
        id: changelogEntry.id,
        fields: {
          Texte: changelogEntry.text,
          Auteur: changelogEntry.author,
          Date: changelogEntry.createdAt,
          Record_Id: changelogEntry.elementId,
          'Type d\'élément': 'acquis',
          Changelog: 'oui',
        },
      };
      const expectedChangelogEntryBody = structuredClone(airtableChangelogEntry);
      delete expectedChangelogEntryBody.id;
      delete expectedChangelogEntryBody.fields.Date;

      const airtableScope = nock('https://api.airtable.com')
        .post('/v0/airtableEditorBaseValue/Notes/?', { records: [expectedChangelogEntryBody] })
        .reply(200, { records: [new AirtableRecord('Notes', airtableChangelogEntry.id, airtableChangelogEntry)] });
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
          id: 'changelog123',
          attributes: {
            text: 'Un texte',
            author: 'NLE',
            'created-at': changelogEntry.createdAt.toISOString(),
            'element-id': changelogEntry.elementId,
            'element-type': ChangelogEntry.ELEMENT_TYPES.ACQUIS,
          },
        },
      });
      expect(airtableScope.isDone()).toBe(true);
    });
  });
});
