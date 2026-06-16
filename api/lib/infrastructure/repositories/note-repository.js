import { Note } from '../../domain/models/Note.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import * as idGenerator from '../utils/id-generator.js';

export async function listByChallengeId(challengeId) {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('*').from('notes').where('challengeId', challengeId).orderBy('createdAt', 'asc');

  return dtos.map(toDomain);
}

export async function create(note) {
  const knexConn = DomainTransaction.getConnection();
  const [dto] = await knexConn.insert({
    id: idGenerator.generateNewId('note'),
    status: note.status,
    text: note.text,
    author: note.author,
    challengeId: note.challengeId,
  }).into('notes').returning('*');

  return toDomain(dto);
}

export async function update(noteId, note) {
  const knexConn = DomainTransaction.getConnection();
  const [dto] = await knexConn('notes').update({
    status: note.status,
    text: note.text,
    author: note.author,
    challengeId: note.challengeId,
    updatedAt: knexConn.fn.now(),
  }).where('id', noteId).returning('*');

  return toDomain(dto);
}

function toDomain(dto) {
  return new Note(dto);
}
