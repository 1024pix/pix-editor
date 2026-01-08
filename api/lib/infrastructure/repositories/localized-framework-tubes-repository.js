import { knex } from '../../../db/knex-database-connection.js';
import { LocalizedFrameworkTubes } from '../../domain/models/index.js';

export async function filter({ competenceId, locale }) {
  const localizedFrameworkTubesDtos = await knex
    .select('localized_framework_tubes.*')
    .from('thematics')
    .join('tubes', 'tubes.thematicId', 'thematics.id')
    .join('localized_framework_tubes', 'localized_framework_tubes.tubeId', 'tubes.id')
    .where('thematics.competenceId', competenceId)
    .where('localized_framework_tubes.locale', locale);
  return localizedFrameworkTubesDtos.map(_toDomain);
}

export async function save(localizedFrameworkTubes, { transaction: knexConn = knex, onConflict = 'merge' } = {}) {
  let query = knexConn('localized_framework_tubes')
    .insert(localizedFrameworkTubes.map((localizedFrameworkTube) => ({
      id: localizedFrameworkTube.id,
      tubeId: localizedFrameworkTube.tubeId,
      maxLevel: localizedFrameworkTube.maxLevel,
      locale: localizedFrameworkTube.locale,
    })))
    .onConflict('id');

  if (onConflict === 'merge') {
    query = query.merge();
  } else {
    query = query.ignore();
  }

  query = query.returning('*');

  const insertedLocalizedFrameworkTubes = await query;
  return _toDomainList(insertedLocalizedFrameworkTubes);
}

export async function remove(id) {
  return knex.delete().from('localized_framework_tubes').where('id', id);
}

function _toDomain(dto) {
  return new LocalizedFrameworkTubes(dto);
}

function _toDomainList(dtos) {
  return dtos.map((dto) => _toDomain(dto));
}
