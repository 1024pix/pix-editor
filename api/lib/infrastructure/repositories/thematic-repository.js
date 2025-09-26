import _ from 'lodash';
import { thematicDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as thematicTranslations from '../translations/thematic.js';
import { Thematic } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

const model = 'thematic';
const TABLE_NAME = 'thematics';

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

export async function getManyByAirtableIds(ids) {
  if (!ids?.length) return [];
  const datasourceThematics = await thematicDatasource.getManyByAirtableIds(ids);
  if (!datasourceThematics) return [];
  const translations = await translationRepository.listByEntities(model, datasourceThematics.map(({ id }) => id));
  return toDomainList(datasourceThematics, translations);
}

export async function listByCompetenceId(competenceId) {
  const datasourceThematics = await thematicDatasource.listByCompetenceId(competenceId);
  if (!datasourceThematics) return [];
  const translations = await translationRepository.listByEntities(model, datasourceThematics.map(({ id }) => id));
  return toDomainList(datasourceThematics, translations);
}

export async function listByCompetenceAirtableId(competenceAirtableId) {
  const datasourceThematics = await thematicDatasource.listByCompetenceAirtableId(competenceAirtableId);
  if (!datasourceThematics) return [];
  const translations = await translationRepository.listByEntities(model, datasourceThematics.map(({ id }) => id));
  return toDomainList(datasourceThematics, translations);
}

export async function create(thematic) {
  return knex.transaction(async (trx) => {
    thematic.id = idGenerator.generateNewId('thematic');

    const createdThematicDTO = await thematicDatasource.create(thematic);

    const translations = thematicTranslations.extractFromDomainObject(thematic);

    await Promise.all([
      trx.insert({
        id: thematic.id,
        index: thematic.index,
        competenceId: createdThematicDTO.competenceId,
      }).into(TABLE_NAME),
      translationRepository.save({ translations, transaction: trx })
    ]);

    return toDomain(createdThematicDTO, translations);
  });
}

export async function update(thematic) {
  return knex.transaction(async (transaction) => {
    const updatedThematicDto = await thematicDatasource.update(thematic);
    const translations = thematicTranslations.extractFromDomainObject(thematic);
    await transaction(TABLE_NAME).update({ index: thematic.index, updatedAt: transaction.fn.now() }).where('id', thematic.id);
    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${thematicTranslations.prefix}${thematic.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    await translationRepository.save({ translations, transaction });
    return toDomain(updatedThematicDto, translations);
  });
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
