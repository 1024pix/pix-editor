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

export async function create(localizedChallenges = [], generateId = _generateId) {
  if (localizedChallenges.length === 0) {
    return;
  }
  const localizedChallengesWithId = localizedChallenges.map((localizedChallenge) => {
    return {
      id: localizedChallenge.id ?? generateId(),
      challengeId: localizedChallenge.challengeId,
      embedUrl: localizedChallenge.embedUrl,
      locale: localizedChallenge.locale,
      status: localizedChallenge.status,
    };
  });
  await knex('localized_challenges').insert(localizedChallengesWithId).onConflict().ignore();
}

export async function getByChallengeIdAndLocale({ challengeId, locale }) {
  const dto = await _queryLocalizedChallengeWithAttachment()
    .where({ challengeId, locale })
    .first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain(dto);
}

export async function listByChallengeIds({ challengeIds, transaction: knexConnection = knex }) {
  const dtos = await knexConnection('localized_challenges').select().whereIn('challengeId', challengeIds).orderBy(['challengeId', 'locale']);
  return dtos.map(_toDomain);
}

export async function get({ id, transaction: knexConnection = knex }) {
  const dto = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .where('id', id)
    .first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain(dto);
}

export async function getMany({ ids, transaction: knexConnection = knex }) {
  const dtos = await _queryLocalizedChallengeWithAttachment(knexConnection).whereIn('id', ids).select().orderBy('id');

  return dtos.map(_toDomain);
}

export async function update({
  localizedChallenge: { id, locale, embedUrl, status, fileIds },
  transaction: knexConnection = knex
}) {
  const [dto] = await knexConnection('localized_challenges').where('id', id).update({
    locale,
    embedUrl,
    status,
  }).returning('*');

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain({ ...dto, fileIds });
}

function _toDomain(dto) {
  return new LocalizedChallenge(dto);
}

function _queryLocalizedChallengeWithAttachment(knexConnection = knex) {
  return knexConnection('localized_challenges')
    .select('localized_challenges.*', 'fileIds')
    .leftJoin(
      knex('localized_challenges-attachments')
        .as('localized_challenges-attachments')
        .groupBy('localizedChallengeId')
        .select('localizedChallengeId', knex.raw('array_agg("attachmentId") as "fileIds"')),
      { 'localized_challenges-attachments.localizedChallengeId': 'localized_challenges.id' });
}
