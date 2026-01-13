import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { Translation } from '../../domain/models/index.js';
import { LocalizedEntity } from '../../domain/readmodels/index.js';
import { escapeLikeWildcards } from './sql-utils.js';

const projection = [
  'key',
  'locale',
  'value',
];

export async function save({ translations, transaction: knexConnection = knex }) {
  if (translations.length === 0) return [];

  await knexConnection('translations').insert(translations).onConflict(['key', 'locale']).merge();
}

/**
 * @deprecated use one of {@link listByModel}, {@link listByEntity} or {@link listByEntities}
 */
export async function listByPrefix(prefix, { transaction = knex } = {}) {
  const translationDtos = await transaction.select(projection).from('translations').whereLike('key', `${prefix}%`);
  return translationDtos.map(_toDomain);
}

export async function listByModel(model, { knexConn = knex } = {}) {
  const translationDtos = await knexConn.select(projection).from('translations').where('model', model);
  return translationDtos.map(_toDomain);
}

export async function listByEntity(model, entityId, { knexConn = knex } = {}) {
  const translationDtos = await knexConn
    .select(projection)
    .from('translations')
    .where('model', model)
    .andWhere('entityId', entityId);
  return translationDtos.map(_toDomain);
}

export async function listByEntities(model, entityIds, { knexConn = knex } = {}) {
  const translationDtos = await knexConn
    .select(projection)
    .from('translations')
    .where('model', model)
    .andWhere('entityId', 'in', entityIds);
  return translationDtos.map(_toDomain);
}

export async function listByPattern(pattern, { transaction = knex } = {}) {
  const translationDtos = await transaction.select(projection).from('translations').whereLike('key', `${pattern}`);
  return translationDtos.map(_toDomain);
}

export async function list() {
  const translationDtos = await knex.select(projection).from('translations').orderBy(['key', 'locale']);
  return translationDtos.map(_toDomain);
}

export async function searchLocalizedEntities({ model, fields, search, limit }) {
  const query = knex('translations')
    .select('model', 'entityId', 'locale')
    .distinct()
    .whereILike('value', `%${escapeLikeWildcards(search)}%`)
    .andWhere(function() {
      for (const field of fields) {
        this.orWhereLike('key', `${model}.%.${field}`);
      }
    })
    .orderBy('entityId');

  if (limit) query.limit(limit);

  const dtos = await query;

  return dtos.map((dto) => new LocalizedEntity(dto));
}

function _toDomain(dto) {
  return new Translation(dto);
}

export async function deleteByKeyPrefixAndLocales({ prefix, locales, transaction: knexConnection = knex }) {
  await knexConnection('translations').delete().whereLike('key', `${prefix}%`).whereIn('locale', locales);
}
