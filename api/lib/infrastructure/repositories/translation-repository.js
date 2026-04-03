import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { Translation } from '../../domain/models/index.js';
import { LocalizedEntity } from '../../domain/readmodels/index.js';
import { TranslationForReplication } from '../../domain/models/replication/index.js';
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

/**
 * @param {AbortSignal=} signal
 */
export async function* streamForReplication(signal) {
  const stream = knex.select(
    knex.raw('?? || ? || ?? AS ??', [
      'translations.key',
      ':',
      'translations.locale',
      'id',
    ]),
    knex.raw('CASE WHEN ?? IS NULL THEN ?? ELSE REPLACE(??, ??, ??) END AS ??', [
      'localized_challenges.id',
      'translations.key',
      'translations.key',
      'translations.entityId',
      'localized_challenges.id',
      'key',
    ]),
    'translations.locale',
    'translations.value',
    'translations.model',
    knex.raw('COALESCE(??, ??) AS ??', [
      'localized_challenges.id',
      'translations.entityId',
      'entityId',
    ]),
    knex.raw('CASE WHEN ?? = ? AND ?? = ?? THEN NULL ELSE ?? END AS ??', [
      'translations.model',
      'challenge',
      'localized_challenges.id',
      'localized_challenges.challengeId',
      'localized_challenges.challengeId',
      'sourceEntityId',
    ]),
  )
    .from('translations')
    .leftOuterJoin('localized_challenges', function() {
      this.onVal('translations.model', 'challenge')
        .on('localized_challenges.challengeId', 'translations.entityId')
        .on('localized_challenges.locale', 'translations.locale');
    })
    .orderBy(['translations.key', 'translations.locale'])
    .stream();

  signal?.addEventListener('abort', () => {
    stream.destroy();
  });

  for await (const dto of stream) {
    yield new TranslationForReplication(dto);
  }
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
