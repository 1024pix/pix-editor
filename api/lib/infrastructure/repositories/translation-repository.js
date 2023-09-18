import { Transform } from 'node:stream';
import { knex } from '../../../db/knex-database-connection.js';
import { translationDatasource } from '../datasources/airtable/index.js';
import { Translation } from '../../domain/models/index.js';

let _shouldDuplicateToAirtable;
let _shouldDuplicateToAirtablePromise;

export async function save(translations) {
  if (translations.length === 0) return [];

  await knex('translations')
    .insert(translations)
    .onConflict(['key', 'locale'])
    .merge();

  if (_shouldDuplicateToAirtable == null && _shouldDuplicateToAirtablePromise == null) {
    await checkIfShouldDuplicateToAirtable();
  }

  if (_shouldDuplicateToAirtable) {
    await translationDatasource.upsert(translations);
  }
}

export async function listByPrefix(prefix) {
  const translationDtos = await knex('translations')
    .select()
    .whereLike('key', `${prefix}%`);
  return translationDtos.map(_toDomain);
}

export async function list() {
  const translationDtos = await knex('translations').select();
  return translationDtos.map(_toDomain);
}

export function streamList() {
  const stream = knex('translations').select().stream();

  const toDomainTransform = new Transform({
    writableObjectMode: true,
    readableObjectMode: true,
    transform(translation, _, callback) {
      callback(null, _toDomain(translation));
    },
  });

  return stream.pipe(toDomainTransform);
}

export async function checkIfShouldDuplicateToAirtable() {
  _shouldDuplicateToAirtablePromise = translationDatasource.exists();
  _shouldDuplicateToAirtable = await _shouldDuplicateToAirtablePromise;
}

function _toDomain(dto) {
  return new Translation(dto);
}
