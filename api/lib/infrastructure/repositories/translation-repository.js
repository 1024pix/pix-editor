import { knex } from '../../../db/knex-database-connection.js';
import { translationDatasource } from '../datasources/airtable/index.js';
import { Translation } from '../../domain/models/index.js';
import _ from 'lodash';

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

export async function listByPrefix(prefix, { transaction = knex } = {}) {
  const translationDtos = await transaction('translations')
    .select()
    .whereLike('key', `${prefix}%`);
  return translationDtos.map(_toDomain);
}

export async function listByPrefixes(prefixes, { transaction = knex } = {}) {
  if (prefixes.length === 0) return [];
  const queryBuilder = transaction('translations')
    .whereLike('key', `${prefixes[0]}%`);
  for (const prefix of prefixes.slice(1)) {
    queryBuilder.orWhereLike('key', `${prefix}%`);
  }
  const translationDtos = await queryBuilder.select().orderBy('key');
  return translationDtos.map(_toDomain);
}

export async function list() {
  const translationDtos = await knex('translations').select();
  return translationDtos.map(_toDomain);
}

export async function search({ entity, fields, search, limit }) {
  const query = knex('translations')
    .pluck('key')
    .whereILike('value', `%${escapeWildcardCharacters(search)}%`)
    .andWhere(function() {
      for (const field of fields) {
        this.orWhereLike('key', `${entity}.%.${field}`);
      }
    })
    .orderBy('key');

  if (limit) query.limit(limit);

  const keys = await query;

  return _.sortedUniq(keys.map((key) => {
    return key.split('.')[1];
  }));
}

function escapeWildcardCharacters(s) {
  return s.replace(/(%|_)/g, '\\$1');
}

export async function checkIfShouldDuplicateToAirtable() {
  _shouldDuplicateToAirtablePromise = translationDatasource.exists();
  _shouldDuplicateToAirtable = await _shouldDuplicateToAirtablePromise;
}

function _toDomain(dto) {
  return new Translation(dto);
}

export async function deleteByKeyPrefix(prefix) {
  await knex('translations')
    .whereLike('key', `${prefix}%`)
    .delete();

  if (_shouldDuplicateToAirtable == null && _shouldDuplicateToAirtablePromise == null) {
    await checkIfShouldDuplicateToAirtable();
  }

  if (_shouldDuplicateToAirtable) {
    const records = await translationDatasource.filter({
      filter: {
        formula: `REGEX_MATCH(key, "^${prefix.replace(/(\.)/g, '\\$1')}")`,
      }
    });
    const recordIds = records.map(({ airtableId }) => airtableId);
    await translationDatasource.delete(recordIds);
  }
}
