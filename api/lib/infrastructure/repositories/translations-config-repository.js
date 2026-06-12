import { knex } from '../../../db/knex-database-connection.js';
import { TranslationsConfig } from '../../domain/models/index.js';

export async function listWithPhraseProjectId() {
  const dtos = await knex.select('*')
    .from('translations_config')
    .whereNotNull('phraseProjectId')
    .orderBy('id');
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

/**
 * @param {string} competenceId
 */
export async function getByCompetenceId(competenceId) {
  const frameworkDto = await knex.select('frameworks.id')
    .from('competences')
    .where('competences.id', competenceId)
    .join('areas', 'areas.id', 'competences.areaId')
    .join('frameworks', 'frameworks.id', 'areas.frameworkId')
    .first();

  if (frameworkDto == null) return undefined;

  const translationConfigDto = await knex.select('*').from('translations_config').where('frameworkId', frameworkDto.id).first();
  if (translationConfigDto == null) return undefined;

  return toDomain(translationConfigDto);
}

function toDomain(dto) {
  return new TranslationsConfig(dto);
}
