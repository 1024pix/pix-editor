import { Note } from '../../domain/models/Note.js';
import { knex } from '../../../db/knex-database-connection.js';
import * as idGenerator from '../utils/id-generator.js';

export async function listByChallengeId(challengeId) {
  const dtos = await knex.select('*').from('notes').where('challengeId', challengeId).orderBy('createdAt', 'asc');

  return dtos.map(toDomain);
}

export async function create(note) {
  const [dto] = await knex.insert({
    id: idGenerator.generateNewId('note'),
    status: note.status,
    text: note.text,
    author: note.author,
    challengeId: note.challengeId,
  }).into('notes').returning('*');

  return toDomain(dto);
}

export async function update(noteId, note) {
  const [dto] = await knex('notes').update({
    status: note.status,
    text: note.text,
    author: note.author,
    challengeId: note.challengeId,
    updatedAt: knex.fn.now(),
  }).where('id', noteId).returning('*');

  return toDomain(dto);
}

function toDomain(dto) {
  return new Note(dto);
}
