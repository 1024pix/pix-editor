import { areaDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as areaTranslations from '../translations/area.js';
import _ from 'lodash';
import { Area } from '../../domain/models/index.js';

export async function list() {
  const datasourceAreas = await areaDatasource.list();
  const translations = await translationRepository.listByPrefix(areaTranslations.prefix);
  return toDomainList(datasourceAreas, translations);
}

function toDomainList(datasourceAreas, translations) {
  const translationsByAreaId = _.groupBy(translations, ({ key }) => key.split('.')[1]);
  return datasourceAreas.map(
    (datasourceArea) => toDomain(datasourceArea, translationsByAreaId[datasourceArea.id]),
  );
}

export function toDomain(datasourceArea, translations = []) {
  return new Area({
    ...datasourceArea,
    ...areaTranslations.toDomain(translations),
  });
}
