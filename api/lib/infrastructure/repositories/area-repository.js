import * as translationRepository from './translation-repository.js';
import * as areaTranslations from '../translations/area.js';
import { Area } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';

const TABLE_NAME = 'areas';
const model = 'area';

/**
 * @param {Area} area
 */
export async function create(area) {
  return DomainTransaction.execute(async () => {
    area.id = idGenerator.generateNewId('area');

    const translations = areaTranslations.extractFromDomainObject(area);

    const knexConn = DomainTransaction.getConnection();
    await Promise.all([
      knexConn
        .insert({
          id: area.id,
          code: area.code,
          frameworkId: area.frameworkId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations }),
    ]);

    const dto = await selectAreas().where('areas.id', area.id).first();

    return toDomain(dto, translations);
  });
}

export async function list() {
  const [dtos, translations] = await Promise.all([selectAreas().orderBy('code'), translationRepository.listByModel(model)]);

  return toDomainList(dtos, translations);
}

export async function listByFrameworkId(frameworkId) {
  const [dtos, translations] = await Promise.all([selectAreas().where('frameworkId', frameworkId).orderBy('code'), translationRepository.listByModel(model)]);

  return toDomainList(dtos, translations);
}

export async function get(id) {
  const [dto, translations] = await Promise.all([selectAreas().where('id', id).first(), translationRepository.listByEntity(model, id)]);

  if (!dto) return null;

  return toDomain(dto, translations);
}

export async function getByChallengeId(challengeId) {
  const knexConn = DomainTransaction.getConnection();
  const dto = await selectAreas()
    .whereIn(
      'areas.id',
      knexConn.select('competences.areaId')
        .from('challenges')
        .join('skills', 'skills.id', 'challenges.skillId')
        .join('tubes', 'tubes.id', 'skills.tubeId')
        .join('thematics', 'thematics.id', 'tubes.thematicId')
        .join('competences', 'competences.id', 'thematics.competenceId')
        .where('challenges.id', challengeId),
    )
    .first();
  return toDomain(dto);
}

function selectAreas() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select(
      'areas.*',
      knexConn.raw(
        'coalesce((??), \'[]\') as "competenceIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['competences.id', 'competences.id']))
          .from('competences')
          .where('competences.areaId', '=', knexConn.ref(`${TABLE_NAME}.id`)),
      ),
    )
    .from(TABLE_NAME);
}

/**
 * @param {object[]} dtos
 * @param {object[]} translations
 */
function toDomainList(dtos, translations) {
  const translationsByAreaId = Object.groupBy(translations, (translation) => translation.entityId);
  return dtos.map((dto) => toDomain(dto, translationsByAreaId[dto.id]));
}

export function toDomain({ id, competenceIds = [], ...dto }, translations = []) {
  return new Area({
    id,
    airtableId: id,
    competenceIds,
    competenceAirtableIds: competenceIds,
    ...dto,
    ...areaTranslations.toDomain(translations, dto),
  });
}
