import { knex } from '../../../db/knex-database-connection.js';
import { LocalizedChallenge } from '../../domain/models/index.js';

export async function list() {
  const localizedChallengeDtos = await knex('localized_challenges').select();
  return localizedChallengeDtos.map(_toDomain);
}

export async function create({ id, challengeId, locale }) {
  await knex('localized_challenges').insert({
    id,
    challengeId,
    locale,
  });
}

function _toDomain(dto) {
  return new LocalizedChallenge(dto);
}
