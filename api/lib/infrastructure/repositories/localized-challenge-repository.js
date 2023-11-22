import { knex } from '../../../db/knex-database-connection.js';
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

function _toDomain(dto) {
  return new LocalizedChallenge(dto);
}
