import _ from 'lodash';
import { thematicDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as thematicTranslations from '../translations/thematic.js';
import { Thematic } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';

const model = 'thematic';

export async function list() {
  const [datasourceThematics, translations] = await Promise.all([
    thematicDatasource.list(),
    translationRepository.listByModel(model),
  ]);
  return toDomainList(datasourceThematics, translations);
}

export async function getByAirtableId(airtableId) {
  const datasourceThematic = await thematicDatasource.find(airtableId);
  if (!datasourceThematic) return null;

  const translations = await translationRepository.listByEntity(model, datasourceThematic.id);

  return toDomain(datasourceThematic, translations);
}

export async function getMany(ids) {
  const [datasourceThematics, translations] = await Promise.all([
    thematicDatasource.filter({ filter: { ids } }),
    translationRepository.listByEntities(model, ids),
  ]);
  return toDomainList(datasourceThematics, translations);
}

export async function listByCompetenceId(competenceId) {
  const datasourceThematics = await thematicDatasource.listByCompetenceId(competenceId);
  if (!datasourceThematics) return [];
  const translations = await translationRepository.listByEntities(model, datasourceThematics.map(({ id }) => id));
  return toDomainList(datasourceThematics, translations);
}

export async function create(thematic) {
  thematic.id = idGenerator.generateNewId('thematic');
  const createdThematicDTO = await thematicDatasource.create(thematic);
  const translations = thematicTranslations.extractFromDomainObject(thematic);
  await translationRepository.save({ translations });
  return toDomain(createdThematicDTO, translations);
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
