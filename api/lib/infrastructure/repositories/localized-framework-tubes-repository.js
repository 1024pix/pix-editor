import { knex } from '../../../db/knex-database-connection.js';
import { LocalizedFrameworkTubes } from '../../domain/models/index.js';

export async function findAll() {
  const localizedFrameworkTubesDtos = await knex('localized_framework_tubes').select('*');
  return localizedFrameworkTubesDtos.map(_toDomain);
}

function _toDomain(dto) {
  return new LocalizedFrameworkTubes(dto);
}
