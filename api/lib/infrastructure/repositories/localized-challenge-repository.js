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
      ...localizedChallenge,
      id: localizedChallenge.id ?? generateId(),
    };
  });
  await knex('localized_challenges').insert(localizedChallengesWithId).onConflict().ignore() ;
}

export async function getByChallengeIdAndLocale({ challengeId, locale }) {
  const dto = await knex('localized_challenges').select().where({ challengeId, locale }).first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain(dto);
}

export async function listByChallengeIds({ challengeIds, transaction: knexConnection = knex }) {
  const dtos = await knexConnection('localized_challenges').select().whereIn('challengeId', challengeIds).orderBy(['challengeId', 'locale']);
  return dtos.map(_toDomain);
}

export async function get({ id, transaction: knexConnection = knex }) {
  const dto = await knexConnection('localized_challenges').select().where('id', id).first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain(dto);
}

export async function update({ localizedChallenge: { id, locale, embedUrl }, transaction: knexConnection = knex }) {
  const [dto] = await knexConnection('localized_challenges').where('id', id).update({ locale, embedUrl }).returning('*');

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  return _toDomain(dto);
}

function _toDomain(dto) {
  return new LocalizedChallenge(dto);
}
