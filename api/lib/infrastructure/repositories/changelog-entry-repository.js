import { ChangelogEntry } from '../../domain/models/ChangelogEntry.js';
import { knex } from '../../../db/knex-database-connection.js';
import * as idGenerator from '../utils/id-generator.js';

export async function listByElementId(elementId) {
  const dtos = await knex.select('*').from('changelog_entries').where('elementId', elementId).orderBy('createdAt', 'asc');

  return dtos.map(toDomain);
}

export async function create(changelogEntry) {
  const [dto] = await knex.insert({
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
