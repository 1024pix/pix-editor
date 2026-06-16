import _ from 'lodash';

import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { Translation } from '../../domain/models/index.js';
import { LocalizedEntity } from '../../domain/readmodels/index.js';
import { TranslationForReplication } from '../../domain/models/replication/index.js';
import { escapeLikeWildcards } from './sql-utils.js';

const projection = [
  'key',
  'locale',
  'value',
];

export async function save({ translations }) {
  if (translations.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  await knexConn('translations').insert(translations).onConflict(['key', 'locale']).merge();
}

/**
 * @deprecated use one of {@link listByModel}, {@link listByEntity} or {@link listByEntities}
 */
export async function listByPrefix(prefix) {
  const knexConn = DomainTransaction.getConnection();
  const translationDtos = await knexConn.select(projection).from('translations').whereLike('key', `${prefix}%`);
  return translationDtos.map(_toDomain);
}

export async function listByModel(model) {
  const knexConn = DomainTransaction.getConnection();
  const translationDtos = await knexConn.select(projection).from('translations').where('model', model);
  return translationDtos.map(_toDomain);
}

export async function listByEntity(model, entityId) {
  const knexConn = DomainTransaction.getConnection();
  const translationDtos = await knexConn
    .select(projection)
    .from('translations')
    .where('model', model)
    .andWhere('entityId', entityId);
  return translationDtos.map(_toDomain);
}

export async function listByEntities(model, entityIds) {
  const knexConn = DomainTransaction.getConnection();
  const translationDtos = await knexConn
    .select(projection)
    .from('translations')
    .where('model', model)
    .andWhere('entityId', 'in', entityIds);
  return translationDtos.map(_toDomain);
}

export async function listByPattern(pattern) {
  const knexConn = DomainTransaction.getConnection();
  const translationDtos = await knexConn.select(projection).from('translations').whereLike('key', `${pattern}`);
  return translationDtos.map(_toDomain);
}

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const translationDtos = await knexConn.select(projection).from('translations').orderBy(['key', 'locale']);
  return translationDtos.map(_toDomain);
}

/**
 * @param {AbortSignal=} signal
 */
export async function* streamForReplication(signal) {
  const knexConn = DomainTransaction.getConnection();
  const stream = knexConn.select(
    knexConn.raw('?? || ? || ?? AS ??', [
      'translations.key',
      ':',
      'translations.locale',
      'id',
    ]),
    knexConn.raw('CASE WHEN ?? IS NULL THEN ?? ELSE REPLACE(??, ??, ??) END AS ??', [
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
    knexConn.raw('COALESCE(??, ??) AS ??', [
      'localized_challenges.id',
      'translations.entityId',
      'entityId',
    ]),
    knexConn.raw('CASE WHEN ?? = ? AND ?? = ?? THEN NULL ELSE ?? END AS ??', [
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
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('translations')
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

export async function deleteByKeyPrefixAndLocales({ prefix, locales }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('translations').delete().whereLike('key', `${prefix}%`).whereIn('locale', locales);
}
