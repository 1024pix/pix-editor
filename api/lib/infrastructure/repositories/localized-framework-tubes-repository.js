import { knex } from '../../../db/knex-database-connection.js';
import { LocalizedFrameworkTubes } from '../../domain/models/index.js';

export async function findAll() {
  const localizedFrameworkTubesDtos = await knex('localized_framework_tubes').select('*');
  return localizedFrameworkTubesDtos.map(_toDomain);
}

export async function save(localizedFrameworkTube) {
  const [insertedLocalizedFrameworkTubes] = await knex('localized_framework_tubes')
    .insert({
      id: localizedFrameworkTube.id,
      tubeId: localizedFrameworkTube.tubeId,
      maxLevel: localizedFrameworkTube.maxLevel,
      locale: localizedFrameworkTube.locale,
    })
    .onConflict('id')
    .merge()
    .returning('*');

  return _toDomain(insertedLocalizedFrameworkTubes);
}

export async function remove(id) {
  return knex.delete().from('localized_framework_tubes').where('id', id);
}

function _toDomain(dto) {
  return new LocalizedFrameworkTubes(dto);
}
