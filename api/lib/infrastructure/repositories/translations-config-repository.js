import { knex } from '../../../db/knex-database-connection.js';
import { TranslationsConfig } from '../../domain/models/index.js';

export async function list() {
  const dtos = await knex.select('*').from('translations_config').orderBy('id');
  return dtos.map(toDomain);
}

/**
 * @param {string} phraseProjectId
 */
export async function getByPhraseProjectId(phraseProjectId) {
  const dto = await knex.select('*').from('translations_config').where('phraseProjectId', phraseProjectId).first();
  if (dto == null) return undefined;
  return toDomain(dto);
}

function toDomain(dto) {
  return new TranslationsConfig(dto);
}
