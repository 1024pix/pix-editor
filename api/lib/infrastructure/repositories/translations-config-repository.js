import { knex } from '../../../db/knex-database-connection.js';
import { TranslationsConfig } from '../../domain/models/index.js';

export async function list() {
  const dtos = await knex.select('*').from('translations_config').orderBy('id');
  return dtos.map(toDomain);
}

function toDomain(dto) {
  return new TranslationsConfig(dto);
}
