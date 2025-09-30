import _ from 'lodash';

import { areaDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as areaTranslations from '../translations/area.js';
import { Area } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areArrayEquals, areNullableValuesEqual, compareDtos, compareDtosLists } from './migration-from-airtable.js';

const TABLE_NAME = 'areas';
const model = 'area';

/**
 * @param {Area} area
 */
export async function create(area) {
  return knex.transaction(async (trx) => {
    area.id = idGenerator.generateNewId('area');

    const translations = areaTranslations.extractFromDomainObject(area);

    const [createdAreaDto] = await Promise.all([
      areaDatasource.create(area),
      trx.insert({
        id: area.id,
        code: area.code,
        frameworkId: area.frameworkId,
      }).into(TABLE_NAME),
      translationRepository.save({ translations, transaction: trx }),
    ]);

    return toDomain(createdAreaDto, translations);
  });
}

export async function list() {
  const [airtableDtos, pgDtos, translations] = await Promise.all([
    areaDatasource.list(),
    selectAreas().orderBy('code'),
    translationRepository.listByModel(model),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareAreaDtos);

  return toDomainList(airtableDtos, translations);
}

export async function listByFrameworkId(frameworkId) {
  const [airtableDtos, pgDtos, translations] = await Promise.all([
    areaDatasource.listByFrameworkId(frameworkId),
    selectAreas().where('frameworkId', frameworkId).orderBy('code'),
    translationRepository.listByModel(model),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareAreaDtos);

  return toDomainList(airtableDtos, translations);
}

export async function getByAirtableId(areaAirtableId) {
  const airtableDto = await areaDatasource.find(areaAirtableId);
  if (!airtableDto) return null;

  const [pgDto, translations] = await Promise.all([
    selectAreas().where('id', airtableDto.id).first(),
    translationRepository.listByEntity(model, airtableDto.id),
  ]);

  compareDtos(airtableDto, pgDto, compareAreaDtos);

  return toDomain(airtableDto, translations);
}

function selectAreas(knexConn = knex) {
  return knexConn.select(
    '*',
    knexConn.raw(
      'coalesce((??), \'[]\') as "competenceIds"',
      knexConn
        .select(knexConn.raw('json_agg(??)', knexConn.ref('competences.id')))
        .from('competences')
        .where('competences.areaId', '=', knexConn.ref(`${TABLE_NAME}.id`)),
    ),
  ).from(TABLE_NAME);
}

function toDomainList(datasourceAreas, translations) {
  const translationsByAreaId = _.groupBy(translations, 'entityId');
  return datasourceAreas.map(
    (datasourceArea) => toDomain(datasourceArea, translationsByAreaId[datasourceArea.id]),
  );
}

export function toDomain(datasourceArea, translations = []) {
  return new Area({
    ...datasourceArea,
    ...areaTranslations.toDomain(translations, datasourceArea),
  });
}

function compareAreaDtos(airtableDto, pgDto) {
  const diff = [];
  if (airtableDto.id !== pgDto.id) diff.push(`airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
  if (airtableDto.code !== pgDto.code) diff.push(`airtable code "${airtableDto.code}" != postgres code "${pgDto.code}"`);
  if (!areNullableValuesEqual(airtableDto.color, pgDto.color)) diff.push(`airtable color "${airtableDto.color}" != postgres color "${pgDto.color}"`);
  if (airtableDto.frameworkId !== pgDto.frameworkId) diff.push(`airtable frameworkId "${airtableDto.frameworkId}" != postgres frameworkId "${pgDto.frameworkId}"`);
  if (!areArrayEquals(airtableDto.competenceIds, pgDto.competenceIds)) diff.push(`airtable competenceIds "${airtableDto.competenceIds}" != postgres competenceIds "${pgDto.competenceIds}"`);
  return diff;
}
