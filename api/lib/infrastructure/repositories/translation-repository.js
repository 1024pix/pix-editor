import { knex } from '../../../db/knex-database-connection.js';
import { translationDatasource } from '../datasources/airtable/index.js';
import { Translation } from '../../domain/models/index.js';
import _ from 'lodash';

let _doesTableExistInAirtable;
let _doesTableExistInAirtablePromise;

export async function save({ translations, transaction: knexConnection = knex, shouldDuplicateToAirtable = true }) {
  if (translations.length === 0) return [];

  await knexConnection('translations')
    .insert(translations)
    .onConflict(['key', 'locale'])
    .merge();

  if (!shouldDuplicateToAirtable) return;

  if (_doesTableExistInAirtable == null && _doesTableExistInAirtablePromise == null) {
    await checkIfTableExistInAirtable();
  }

  if (_doesTableExistInAirtable) {
    await translationDatasource.upsert(translations);
  }
}

export async function listByPrefix(prefix, { transaction = knex } = {}) {
  const translationDtos = await transaction('translations')
    .select()
    .whereLike('key', `${prefix}%`);
  return translationDtos.map(_toDomain);
}

export async function listByPattern(pattern, { transaction = knex } = {}) {
  const translationDtos = await transaction('translations')
    .select()
    .whereLike('key', `${pattern}`);
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

export async function checkIfTableExistInAirtable() {
  _doesTableExistInAirtablePromise = translationDatasource.exists();
  _doesTableExistInAirtable = await _doesTableExistInAirtablePromise;
}

function _toDomain(dto) {
  return new Translation(dto);
}

export async function deleteByKeyPrefixAndLocales({ prefix, locales, transaction: knexConnection = knex }) {
  await knexConnection('translations')
    .delete()
    .whereLike('key', `${prefix}%`)
    .whereIn('locale', locales);

  if (_doesTableExistInAirtable == null && _doesTableExistInAirtablePromise == null) {
    await checkIfTableExistInAirtable();
  }

  if (_doesTableExistInAirtable) {
    const records = await translationDatasource.filter({
      filter: {
        formula: `AND(REGEX_MATCH(key, '^${prefix.replace(/(\.)/g, '\\$1')}'), OR(${locales.map((locale) => `locale = '${locale}'`).join(', ')}))`,
      },
    });
    if (records.length === 0) return;
    const recordIds = records.map(({ airtableId }) => airtableId);
    await translationDatasource.delete(recordIds);
  }
}

