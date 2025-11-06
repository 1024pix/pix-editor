import * as translationRepository from './translation-repository.js';
import * as areaTranslations from '../translations/area.js';
import { Area } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

const TABLE_NAME = 'areas';
const model = 'area';

/**
 * @param {Area} area
 */
export async function create(area) {
  return knex.transaction(async (transaction) => {
    area.id = idGenerator.generateNewId('area');

    const translations = areaTranslations.extractFromDomainObject(area);

    await Promise.all([
      transaction
        .insert({
          id: area.id,
          code: area.code,
          frameworkId: area.frameworkId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations, transaction }),
    ]);

    const dto = await selectAreas(transaction).where('areas.id', area.id).first();

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

/**
 * @deprecated use {@link get}
 */
export async function getByAirtableId(id) {
  return get(id);
}

export async function get(id) {
  const [dto, translations] = await Promise.all([selectAreas().where('id', id).first(), translationRepository.listByEntity(model, id)]);

  if (!dto) return null;

  return toDomain(dto, translations);
}

function selectAreas(knexConn = knex) {
  return knexConn
    .select(
      '*',
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
