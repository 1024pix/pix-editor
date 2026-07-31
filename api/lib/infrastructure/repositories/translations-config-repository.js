import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { TranslationsConfig } from '../../domain/models/index.js';

export async function listWithPhraseProjectId() {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('*')
    .from('translations_config')
    .whereNotNull('phraseProjectId')
    .orderBy('id');
  return dtos.map(toDomain);
}

export async function listWithWeblateComponent() {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('*')
    .from('translations_config')
    .whereNotNull('weblateComponent')
    .orderBy('id');
  return dtos.map(toDomain);
}

/**
 * @param {string} phraseProjectId
 */
export async function getByPhraseProjectId(phraseProjectId) {
  const knexConn = DomainTransaction.getConnection();
  const dto = await knexConn.select('*').from('translations_config').where('phraseProjectId', phraseProjectId).first();
  if (dto == null) return undefined;
  return toDomain(dto);
}

/**
 * @param {string} competenceId
 */
export async function getByCompetenceId(competenceId) {
  const knexConn = DomainTransaction.getConnection();
  const frameworkDto = await knexConn.select('frameworks.id')
    .from('competences')
    .where('competences.id', competenceId)
    .join('areas', 'areas.id', 'competences.areaId')
    .join('frameworks', 'frameworks.id', 'areas.frameworkId')
    .first();

  if (frameworkDto == null) return undefined;

  const translationConfigDto = await knexConn.select('*').from('translations_config').where('frameworkId', frameworkDto.id).first();
  if (translationConfigDto == null) return undefined;

  return toDomain(translationConfigDto);
}

function toDomain(dto) {
  return new TranslationsConfig(dto);
}
