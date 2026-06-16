import * as translationRepository from './translation-repository.js';
import * as competenceTranslations from '../translations/competence.js';
import { Competence } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';

const model = 'competence';
const TABLE_NAME = 'competences';

export async function list() {
  const [dtos, translations] = await Promise.all([_selectCompetences().orderBy('competences.index'), translationRepository.listByModel(model)]);

  return toDomainList(dtos, translations);
}

export async function getMany(ids) {
  const [dtos, translations] = await Promise.all([_selectCompetences().whereIn('competences.id', ids).orderBy('competences.index'), translationRepository.listByEntities(model, ids)]);

  return toDomainList(dtos, translations);
}

export async function get(id) {
  const [dto, translations] = await Promise.all([_selectCompetences().where('competences.id', id).first(), translationRepository.listByEntity(model, id)]);

  if (!dto) return null;

  return toDomain(dto, translations);
}

export async function create(competence) {
  return DomainTransaction.execute(async () => {
    competence.id = idGenerator.generateNewId('competence');
    const translations = competenceTranslations.extractFromDomainObject(competence);

    const knexConn = DomainTransaction.getConnection();
    await Promise.all([
      knexConn
        .insert({
          id: competence.id,
          index: competence.index,
          areaId: competence.areaAirtableId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations }),
    ]);

    const dto = await _selectCompetences().where('competences.id', competence.id).first();

    return toDomain(dto, translations);
  });
}

export async function update(competence) {
  return DomainTransaction.execute(async () => {
    const translations = competenceTranslations.extractFromDomainObject(competence);

    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${competenceTranslations.prefix}${competence.id}.`,
      locales: ['fr', 'en'],
    });
    await translationRepository.save({ translations });

    return competence;
  });
}

export function _selectCompetences() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select(
      'competences.*',
      'frameworks.name as origin',
      knexConn.raw(
        'coalesce((??), \'[]\') as "thematicIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['thematics.id', 'thematics.id']))
          .from('thematics')
          .where('thematics.competenceId', '=', knexConn.ref('competences.id')),
      ),
      knexConn.raw(
        'coalesce((??), \'[]\') as "tubeIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['tubes.id', 'tubes.id']))
          .from('thematics')
          .join('tubes', 'tubes.thematicId', 'thematics.id')
          .where('thematics.competenceId', '=', knexConn.ref('competences.id')),
      ),
      knexConn.raw(
        'coalesce((??), \'[]\') as "skillIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['skills.id', 'skills.id']))
          .from('thematics')
          .join('tubes', 'tubes.thematicId', 'thematics.id')
          .join('skills', 'skills.tubeId', 'tubes.id')
          .where('thematics.competenceId', '=', knexConn.ref('competences.id')),
      ),
    )
    .from('competences')
    .join('areas', 'areas.id', 'competences.areaId')
    .join('frameworks', 'frameworks.id', 'areas.frameworkId');
}

/**
 * @param {object[]} dtos
 * @param {object[]} translations
 */
function toDomainList(dtos, translations) {
  const translationsByCompetenceId = Object.groupBy(translations, (translation) => translation.entityId);
  return dtos.map((datasourceCompetence) =>
    toDomain(datasourceCompetence, translationsByCompetenceId[datasourceCompetence.id]),
  );
}

function toDomain({ id, areaId, thematicIds = [], tubeIds = [], skillIds = [], ...dto }, translations = []) {
  return new Competence({
    id,
    airtableId: id,
    areaId,
    areaAirtableId: areaId,
    thematicIds,
    thematicAirtableIds: thematicIds,
    tubeIds,
    tubeAirtableIds: tubeIds,
    skillIds,
    ...dto,
    ...competenceTranslations.toDomain(translations),
  });
}
