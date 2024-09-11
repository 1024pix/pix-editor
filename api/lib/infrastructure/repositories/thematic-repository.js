import { thematicDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import _ from 'lodash';
import * as thematicTranslations from '../translations/thematic.js';
import { Thematic } from '../../domain/models/index.js';

export async function list() {
  const [datasourceThematics, translations] = await Promise.all([
    thematicDatasource.list(),
    translationRepository.listByPrefix(thematicTranslations.prefix),
  ]);
  return toDomainList(datasourceThematics, translations);
}

export async function getMany(thematicIds) {
  const thematics = await list();
  return thematics.filter((thematic) => thematicIds.includes(thematic.id));
}

function toDomainList(datasourceThematics, translations) {
  const translationsByThematicId = _.groupBy(translations, 'entityId');
  return _.orderBy(datasourceThematics.map(
    (datasourceThematic) => toDomain(datasourceThematic, translationsByThematicId[datasourceThematic.id]),
  ), ['index', 'name_i18n.fr']);
}

function toDomain(datasourceThematic, translations = []) {
  return new Thematic({
    ...datasourceThematic,
    ...thematicTranslations.toDomain(translations),
  });
}
