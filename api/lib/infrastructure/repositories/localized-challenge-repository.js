import { DomainTransaction } from '../../domain/DomainTransaction.js';
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
}) {
  if (localizedChallenges.length === 0) {
    return;
  }
  const knexConn = DomainTransaction.getConnection();
  const dataToInsert = adaptModelsForDB(localizedChallenges, generateId);
  await knexConn('localized_challenges').insert(dataToInsert).onConflict().ignore();
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

export async function listByChallengeIds({ challengeIds }) {
  const dtos = await _queryLocalizedChallengeWithAttachment()
    .whereIn('localized_challenges.challengeId', challengeIds)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);
  return dtos.map(toDomain);
}

export async function get({ id }) {
  const dto = await _queryLocalizedChallengeWithAttachment().where('localized_challenges.id', id).first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return toDomain(dto);
}

export async function getMany({ ids }) {
  const dtos = await _queryLocalizedChallengeWithAttachment()
    .whereIn('localized_challenges.id', ids)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);

  return dtos.map(toDomain);
}

export async function filter(params = {}) {
  const knexConn = DomainTransaction.getConnection();
  const localizedEntities = await translationRepository.searchLocalizedEntities({
    model: 'challenge',
    fields: ['instruction', 'proposals'],
    search: params.filter.search,
    limit: params.page?.limit,
  });

  let query = knexConn.select().from('localized_challenges')
    .whereIn(['challengeId', 'locale'], localizedEntities.map(({ entityId, locale }) => [entityId, locale]))
    .orWhereILike('embedUrl', `%${escapeLikeWildcards(params.filter.search)}%`)
    .orderBy('id');

  if (params.page?.limit) query = query.limit(params.page?.limit);

  const dtos = await query;

  if (dtos.length === 0) return [];

  return dtos.map(toDomain);
}

export async function update({ localizedChallenge }) {
  const knexConn = DomainTransaction.getConnection();
  const localizedChallengeForDB = adaptModelForDB(localizedChallenge);
  delete localizedChallengeForDB.id;
  const [dto] = await knexConn('localized_challenges')
    .where('id', localizedChallenge.id)
    .update(localizedChallengeForDB)
    .returning('*');

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  const [primaryEmbedUrl] = await knexConn('localized_challenges')
    .where({ id: dto.challengeId })
    .pluck('embedUrl');

  return toDomain({
    ...dto,
    primaryEmbedUrl,
    fileIds: localizedChallenge.fileIds,
  });
}

export async function updateByLocalizedChallengeId({ id, ...dataToUpdate }) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('localized_challenges').update(dataToUpdate).where('id', id);
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

function _queryLocalizedChallengeWithAttachment() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select(
      'localized_challenges.*',
      'primaryLocalizedChallenge.embedUrl as primaryEmbedUrl',
      knexConn.raw(
        'coalesce((??), \'[]\') as "fileIds"',
        knexConn
          .select(knexConn.raw('json_agg(??)', 'attachments.id'))
          .from('attachments')
          .where('attachments.challengeId', knexConn.ref('localized_challenges.challengeId')) // necessary to use index on (challengeId, localizedChallengeId)
          .where('attachments.localizedChallengeId', knexConn.ref('localized_challenges.id')),
      ),
    )
    .from('localized_challenges')
    .join(
      { primaryLocalizedChallenge: 'localized_challenges' },
      'primaryLocalizedChallenge.id',
      'localized_challenges.challengeId',
    );
}
