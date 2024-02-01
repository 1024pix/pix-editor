import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { LocalizedChallenge } from '../../domain/models/index.js';
import { generateNewId } from '../utils/id-generator.js';

export async function list() {
  const localizedChallengeDtos = await knex('localized_challenges').select();
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
  const dtos = await knex('localized_challenges')
    .select('localized_challenges.*', 'localized_challenges-attachments.attachmentId')
    .leftJoin('localized_challenges-attachments', { 'localized_challenges-attachments.localizedChallengeId': 'localized_challenges.id' })
    .where({ challengeId, locale });

  if (!dtos?.[0]) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomainForAttachment(dtos);
}

export async function listByChallengeIds({ challengeIds, transaction: knexConnection = knex }) {
  const dtos = await knexConnection('localized_challenges').select().whereIn('challengeId', challengeIds).orderBy(['challengeId', 'locale']);
  return dtos.map(_toDomain);
}

export async function get({ id, transaction: knexConnection = knex }) {
  const dtos = await knex('localized_challenges')
    .select('localized_challenges.*', 'localized_challenges-attachments.attachmentId')
    .leftJoin('localized_challenges-attachments', { 'localized_challenges-attachments.localizedChallengeId': 'localized_challenges.id' })
    .where('id', id);

  if (!dtos?.[0]) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomainForAttachment(dtos);
}

export async function getMany({ ids, transaction: knexConnection = knex }) {
  const dtos = await knexConnection('localized_challenges').whereIn('id', ids).select();
  return dtos.map(_toDomain);
}

export async function update({
  localizedChallenge: { id, locale, embedUrl, status },
  transaction: knexConnection = knex
}) {
  const [dto] = await knexConnection('localized_challenges').where('id', id).update({
    locale,
    embedUrl,
    status,
  }).returning('*');

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain(dto);
}

function _toDomain(dto) {
  return new LocalizedChallenge(dto);
}

function _toDomainForAttachment(dtos) {
  const fileIds = dtos.map(({ attachmentId }) => attachmentId)
    .filter((attachmentId) => attachmentId);

  const dto = {
    ...dtos[0],
    fileIds,
  };

  return _toDomain(dto);
}
