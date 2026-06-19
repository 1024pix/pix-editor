import { ChangelogEntry } from '../../domain/models/ChangelogEntry.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import * as idGenerator from '../utils/id-generator.js';

export async function listByElementId(elementId) {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('*').from('changelog_entries').where('elementId', elementId).orderBy('createdAt', 'asc');

  return dtos.map(toDomain);
}

export async function create(changelogEntry) {
  const knexConn = DomainTransaction.getConnection();
  const [dto] = await knexConn.insert({
    id: idGenerator.generateNewId('changelog'),
    text: changelogEntry.text,
    author: changelogEntry.author,
    elementId: changelogEntry.elementId,
    elementType: changelogEntry.elementType,
  }).into('changelog_entries').returning('*');

  return toDomain(dto);
}

function toDomain(dto) {
  return new ChangelogEntry(dto);
}
