import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { LocalizedChallenge } from '../../domain/models/index.js';
import { generateNewId } from '../utils/id-generator.js';

export async function list() {
  const localizedChallengeDtos = await _queryLocalizedChallengeWithAttachment()
    .orderBy('id');
  return localizedChallengeDtos.map(_toDomain);
}

function _generateId() {
  return generateNewId('challenge');
}

export async function create({ localizedChallenges = [], generateId = _generateId, transaction: knexConnection = knex }) {
  if (localizedChallenges.length === 0) {
    return;
  }
  const dataToInsert = _adaptModelsForDB(localizedChallenges, generateId);
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

  return _toDomain(dto);
}

export async function listByChallengeIds({ challengeIds, transaction: knexConnection = knex }) {
  const dtos = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .whereIn('localized_challenges.challengeId', challengeIds)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);
  return dtos.map(_toDomain);
}

export async function get({ id, transaction: knexConnection = knex }) {
  const dto = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .where('localized_challenges.id', id)
    .first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain(dto);
}

export async function getMany({ ids, transaction: knexConnection = knex }) {
  const dtos = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .whereIn('localized_challenges.id', ids)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);

  return dtos.map(_toDomain);
}

export async function update({
  localizedChallenge: { id, locale, embedUrl, status, fileIds, geography, urlsToConsult,requireGafamWebsiteAccess, isIncompatibleIpadCertif, deafAndHardOfHearing, isAwarenessChallenge, toRephrase },
  transaction: knexConnection = knex
}) {
  const [dto] = await knexConnection('localized_challenges').where('id', id).update({
    locale,
    embedUrl,
    status,
    geography,
    urlsToConsult,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,
  }).returning('*');

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  const [primaryEmbedUrl] = await knexConnection('localized_challenges').where({ id: dto.challengeId }).pluck('embedUrl');

  return _toDomain({ ...dto, primaryEmbedUrl, fileIds });
}

function _toDomain(dto) {
  return new LocalizedChallenge(dto);
}

function _adaptModelsForDB(localizedChallenges, generateId) {
  return localizedChallenges.map((localizedChallenge) => {
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
    };
  });
}

function _queryLocalizedChallengeWithAttachment(knexConnection = knex) {
  return knexConnection('localized_challenges')
    .select('localized_challenges.*', 'plc.embedUrl as primaryEmbedUrl', 'fileIds')
    .join({ plc: 'localized_challenges' }, 'plc.id', 'localized_challenges.challengeId')
    .leftJoin(
      knex('localized_challenges-attachments')
        .as('localized_challenges-attachments')
        .groupBy('localizedChallengeId')
        .select('localizedChallengeId', knex.raw('array_agg("attachmentId") as "fileIds"')),
      { 'localized_challenges-attachments.localizedChallengeId': 'localized_challenges.id' });
}
