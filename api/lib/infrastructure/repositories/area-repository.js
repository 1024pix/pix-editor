import _ from 'lodash';
import { areaDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as areaTranslations from '../translations/area.js';
import { Area } from '../../domain/models/index.js';

const model = 'area';

export async function list() {
  const [datasourceAreas, translations] = await Promise.all([
    areaDatasource.list(),
    translationRepository.listByModel(model),
  ]);
  return toDomainList(datasourceAreas, translations);
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
