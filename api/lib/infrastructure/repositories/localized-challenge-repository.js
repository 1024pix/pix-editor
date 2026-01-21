import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { LocalizedChallenge } from '../../domain/models/index.js';
import { generateNewId } from '../utils/id-generator.js';
import * as translationRepository from './translation-repository.js';
import { escapeLikeWildcards } from './sql-utils.js';

export async function list() {
  const localizedChallengeDtos = await _queryLocalizedChallengeWithAttachment().orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);
  return localizedChallengeDtos.map(toDomain);
}

function _generateId() {
  return generateNewId('challenge');
}

export async function create({
  localizedChallenges = [],
  generateId = _generateId,
  transaction: knexConnection = knex,
}) {
  if (localizedChallenges.length === 0) {
    return;
  }
  const dataToInsert = adaptModelsForDB(localizedChallenges, generateId);
  await knexConnection('localized_challenges').insert(dataToInsert).onConflict().ignore();
}

export async function getByChallengeIdAndLocale({ challengeId, locale }) {
  const dto = await _queryLocalizedChallengeWithAttachment()
    .where({
      'localized_challenges.challengeId': challengeId,
      'localized_challenges.locale': locale,
    })
    .first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return toDomain(dto);
}

export async function listByChallengeIds({ challengeIds, transaction: knexConnection = knex }) {
  const dtos = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .whereIn('localized_challenges.challengeId', challengeIds)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);
  return dtos.map(toDomain);
}

export async function get({ id, transaction: knexConnection = knex }) {
  const dto = await _queryLocalizedChallengeWithAttachment(knexConnection).where('localized_challenges.id', id).first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return toDomain(dto);
}

export async function getMany({ ids, transaction: knexConnection = knex }) {
  const dtos = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .whereIn('localized_challenges.id', ids)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);

  return dtos.map(toDomain);
}

export async function filter(params = {}) {
  const localizedEntities = await translationRepository.searchLocalizedEntities({
    model: 'challenge',
    fields: ['instruction', 'proposals'],
    search: params.filter.search,
    limit: params.page?.limit,
  });

  let query = knex.select().from('localized_challenges')
    .whereIn(['challengeId', 'locale'], localizedEntities.map(({ entityId, locale }) => [entityId, locale]))
    .orWhereILike('embedUrl', `%${escapeLikeWildcards(params.filter.search)}%`)
    .orderBy('id');

  if (params.page?.limit) query = query.limit(params.page?.limit);

  const dtos = await query;

  if (dtos.length === 0) return [];

  return dtos.map(toDomain);
}

export async function update({ localizedChallenge, transaction: knexConnection = knex }) {
  const localizedChallengeForDB = adaptModelForDB(localizedChallenge);
  delete localizedChallengeForDB.id;
  const [dto] = await knexConnection('localized_challenges')
    .where('id', localizedChallenge.id)
    .update(localizedChallengeForDB)
    .returning('*');

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  const [primaryEmbedUrl] = await knexConnection('localized_challenges')
    .where({ id: dto.challengeId })
    .pluck('embedUrl');

  return toDomain({
    ...dto,
    primaryEmbedUrl,
    fileIds: localizedChallenge.fileIds,
  });
}

function toDomain(dto) {
  return new LocalizedChallenge(dto);
}

function adaptModelsForDB(localizedChallenges, generateId) {
  return localizedChallenges.map((localizedChallenge) => adaptModelForDB(localizedChallenge, generateId));
}

function adaptModelForDB(localizedChallenge, generateId) {
  return {
    id: localizedChallenge.id ?? generateId(),
    challengeId: localizedChallenge.challengeId,
    embedUrl: localizedChallenge.embedUrl,
    locale: localizedChallenge.locale,
    status: localizedChallenge.status,
    geography: localizedChallenge.geography,
    urlsToConsult: localizedChallenge.urlsToConsult,
    requireGafamWebsiteAccess: localizedChallenge.requireGafamWebsiteAccess,
    isIncompatibleIpadCertif: localizedChallenge.isIncompatibleIpadCertif,
    deafAndHardOfHearing: localizedChallenge.deafAndHardOfHearing,
    isAwarenessChallenge: localizedChallenge.isAwarenessChallenge,
    toRephrase: localizedChallenge.toRephrase,
    hasEmbedInternalValidation: localizedChallenge.hasEmbedInternalValidation,
    noValidationNeeded: localizedChallenge.noValidationNeeded,
    validatedAt: localizedChallenge.validatedAt,
  };
}

function _queryLocalizedChallengeWithAttachment(knexConnection = knex) {
  return knexConnection
    .select(
      'localized_challenges.*',
      'primaryLocalizedChallenge.embedUrl as primaryEmbedUrl',
      knex.raw(
        'coalesce((??), \'[]\') as "fileIds"',
        knex
          .select(knex.raw('json_agg(??)', 'attachments.id'))
          .from('attachments')
          .where('attachments.challengeId', knex.ref('localized_challenges.challengeId')) // necessary to use index on (challengeId, localizedChallengeId)
          .where('attachments.localizedChallengeId', knex.ref('localized_challenges.id')),
      ),
    )
    .from('localized_challenges')
    .join(
      { primaryLocalizedChallenge: 'localized_challenges' },
      'primaryLocalizedChallenge.id',
      'localized_challenges.challengeId',
    );
}
