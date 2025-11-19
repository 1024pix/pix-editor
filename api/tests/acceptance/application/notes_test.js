import nock from 'nock';
import { describe, it, expect } from 'vitest';
import { Note } from '../../../lib/domain/models/index.js';
import { createServer } from '../../../server.js';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';
import Airtable from 'airtable';

const { Record: AirtableRecord } = Airtable;

describe('Acceptance | Routes | Notes', () => {
  describe('GET /notes', () => {
    it('returns notes for a challenge', async function() {
      // given
      const challengeId = 'challengeAbc123';

      const user = databaseBuilder.factory.buildAdminUser();

      databaseBuilder.factory.buildNote({
        id: 'rec123',
        text: 'Un texte',
        author: 'NLE',
        challengeId,
        status: Note.STATUSES.TERMINE,
      });
      databaseBuilder.factory.buildNote({
        id: 'rec456',
        text: 'Un autre texte',
        author: 'FOO',
        challengeId,
        status: Note.STATUSES.EN_COURS,
      });

      await databaseBuilder.commit();

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

  describe('POST /notes', () => {
    it('returns 201 and created note', async function() {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();

      const note = new Note({
        id: 'note123',
        status: Note.STATUSES.EN_COURS,
        text: 'Un texte',
        author: 'NLE',
        createdAt: new Date('2025-11-10T16:33:00Z'),
        challengeId: 'challengeAbc123',
      });

      const airtableNote = {
        id: note.id,
        fields: {
          Statut: note.status,
          Texte: note.text,
          Auteur: note.author,
          Date: note.createdAt,
          Record_Id: note.challengeId,
          'Type d\'élément': 'épreuve',
          Changelog: 'non',
        },
      };
      const expectedNoteBody = structuredClone(airtableNote);
      delete expectedNoteBody.id;
      delete expectedNoteBody.fields.Date;

      const airtableScope = nock('https://api.airtable.com')
        .post('/v0/airtableEditorBaseValue/Notes/?', { records: [expectedNoteBody] })
        .reply(200, { records: [new AirtableRecord('Notes', airtableNote.id, airtableNote)] });
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/notes',
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'notes',
            attributes: {
              status: note.status,
              text: note.text,
              author: note.author,
              challengeId: 'challengeAbc123',
            },
          },
        },
      });

      // then
      expect(response.statusCode).toBe(201);
      expect(response.result).toStrictEqual({
        data: {
          type: 'notes',
          id: 'note123',
          attributes: {
            text: 'Un texte',
            author: 'NLE',
            'created-at': note.createdAt.toISOString(),
            status: Note.STATUSES.EN_COURS,
          },
        },
      });

      await expect(knex.select('*').from('notes')).resolves.toStrictEqual([
        {
          id: 'note123',
          text: 'Un texte',
          author: 'NLE',
          status: Note.STATUSES.EN_COURS,
          challengeId: 'challengeAbc123',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      expect(airtableScope.isDone()).toBe(true);
    });
  });

  describe('PATCH /notes/:noteId', () => {
    it('returns 200 and updated note', async function() {
      // given
      const user = databaseBuilder.factory.buildAdminUser();

      databaseBuilder.factory.buildNote({
        id: 'note123',
        status: Note.STATUSES.EN_COURS,
        text: 'Un texte',
        author: 'NLE',
        createdAt: new Date('2025-11-10T16:33:00Z'),
        challengeId: 'challengeAbc123',
      });

      await databaseBuilder.commit();

      const note = new Note({
        id: 'note123',
        status: Note.STATUSES.EN_COURS,
        text: 'Un texte',
        author: 'NLE',
        createdAt: new Date('2025-11-10T16:33:00Z'),
        challengeId: 'challengeAbc123',
      });

      const airtableNote = {
        id: note.id,
        fields: {
          Statut: Note.STATUSES.TERMINE,
          Texte: 'Un nouveau texte',
          Auteur: note.author,
          Date: note.createdAt,
          Record_Id: note.challengeId,
          'Type d\'élément': 'épreuve',
          Changelog: 'non',
        },
      };
      const expectedNoteBody = structuredClone(airtableNote);
      delete expectedNoteBody.fields.Changelog;
      delete expectedNoteBody.fields.Date;
      delete expectedNoteBody.fields['Type d\'élément'];

      const airtableScope = nock('https://api.airtable.com')
        .patch('/v0/airtableEditorBaseValue/Notes/?', { records: [expectedNoteBody] })
        .reply(200, { records: [new AirtableRecord('Notes', airtableNote.id, airtableNote)] });
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/notes/${note.id}`,
        headers: generateAuthorizationHeader(user),
        payload: {
          data: {
            type: 'notes',
            attributes: {
              status: Note.STATUSES.TERMINE,
              text: 'Un nouveau texte',
              author: note.author,
              createdAt: note.createdAt,
              challengeId: note.challengeId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(response.result).toStrictEqual({
        data: {
          type: 'notes',
          id: 'note123',
          attributes: {
            text: 'Un nouveau texte',
            author: 'NLE',
            'created-at': note.createdAt.toISOString(),
            status: Note.STATUSES.TERMINE,
          },
        },
      });

      await expect(knex.select('*').from('notes')).resolves.toStrictEqual([
        {
          id: 'note123',
          text: 'Un nouveau texte',
          author: 'NLE',
          status: Note.STATUSES.TERMINE,
          challengeId: 'challengeAbc123',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      expect(airtableScope.isDone()).toBe(true);
    });
  });
});
