import { describe, it, expect } from 'vitest';
import { Note } from '../../../lib/domain/models/index.js';
import { createServer } from '../../../server.js';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../test-helper.js';

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
        createdAt: '2025-11-12T14:39:00Z',
      });
      databaseBuilder.factory.buildNote({
        id: 'rec456',
        text: 'Un autre texte',
        author: 'FOO',
        challengeId,
        status: Note.STATUSES.EN_COURS,
        createdAt: '2025-11-12T14:47:00Z',
      });

      await databaseBuilder.commit();

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
              'created-at': new Date('2025-11-12T14:39:00Z'),
              status: Note.STATUSES.TERMINE,
            },
          },
          {
            type: 'notes',
            id: 'rec456',
            attributes: {
              text: 'Un autre texte',
              author: 'FOO',
              'created-at': new Date('2025-11-12T14:47:00Z'),
              status: Note.STATUSES.EN_COURS,
            },
          },
        ],
      });
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
          id: expect.stringMatching(/^note.+/),
          attributes: {
            text: 'Un texte',
            author: 'NLE',
            'created-at': expect.any(Date),
            status: Note.STATUSES.EN_COURS,
          },
        },
      });

      await expect(knex.select('*').from('notes')).resolves.toStrictEqual([
        {
          id: expect.stringMatching(/^note.+/),
          text: 'Un texte',
          author: 'NLE',
          status: Note.STATUSES.EN_COURS,
          challengeId: 'challengeAbc123',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
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
            'created-at': note.createdAt,
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
    });
  });
});
