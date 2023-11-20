import { knex } from '../../../db/knex-database-connection.js';
import { LocalizedChallenge } from '../../domain/models/index.js';
import _ from 'lodash';

export async function list() {
  const localizedChallengeDtos = await knex('localized_challenges').select();
  return localizedChallengeDtos.map(_toDomain);
}

function _toDomain(dto) {
  return new LocalizedChallenge(dto);
}
