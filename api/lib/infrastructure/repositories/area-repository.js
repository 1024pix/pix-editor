import _ from 'lodash';

import { areaDatasource } from '../datasources/airtable/index.js';
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
  const [datasourceAreas, translations] = await Promise.all([
    areaDatasource.list(),
    translationRepository.listByModel(model),
  ]);
  return toDomainList(datasourceAreas, translations);
}

export async function listByFrameworkId(frameworkId) {
  const [datasourceAreas, translations] = await Promise.all([
    areaDatasource.listByFrameworkId(frameworkId),
    translationRepository.listByModel(model),
  ]);
  return toDomainList(datasourceAreas, translations);
}

export async function getByAirtableId(areaAirtableId) {
  const areaDTO = await areaDatasource.find(areaAirtableId);
  if (!areaDTO) return null;
  const translations = await translationRepository.listByEntity(model, areaDTO.id);
  return toDomain(areaDTO, translations);
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
