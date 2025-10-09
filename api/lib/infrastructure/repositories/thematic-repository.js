import _ from 'lodash';
import { thematicDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as thematicTranslations from '../translations/thematic.js';
import { Thematic } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areArrayEquals, areNullableValuesEqual, compareDtos, compareDtosLists } from './migration-from-airtable.js';

const model = 'thematic';
const TABLE_NAME = 'thematics';

export async function list() {
  const [airtableDtos, pgDtos, translations] = await Promise.all([
    thematicDatasource.list(),
    selectThematics().orderBy('id'),
    translationRepository.listByModel(model),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareThematicDtos);

  return toDomainList(airtableDtos, translations);
}

export async function getByAirtableId(airtableId) {
  const airtableDto = await thematicDatasource.find(airtableId);
  if (!airtableDto) return null;

  const [pgDto, translations] = await Promise.all([
    selectThematics().where('id', airtableDto.id).first(),
    translationRepository.listByEntity(model, airtableDto.id),
  ]);

  compareDtos(airtableDto, pgDto, compareThematicDtos);

  return toDomain(airtableDto, translations);
}

export async function getMany(ids) {
  const [airtableDtos, pgDtos, translations] = await Promise.all([
    thematicDatasource.filter({ filter: { ids } }),
    selectThematics().whereIn('id', ids).orderBy('id'),
    translationRepository.listByEntities(model, ids),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareThematicDtos);

  return toDomainList(airtableDtos, translations);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];
  const airtableDtos = await thematicDatasource.getManyByAirtableIds(airtableIds);
  if (!airtableDtos) return [];

  const ids = airtableDtos.map(({ id }) => id);
  const [pgDtos, translations] = await Promise.all([
    selectThematics().whereIn('id', ids).orderBy('id'),
    translationRepository.listByEntities(model, ids),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareThematicDtos);

  return toDomainList(airtableDtos, translations);
}

export async function listByCompetenceId(competenceId) {
  const [airtableDtos, pgDtos] = await Promise.all([
    thematicDatasource.listByCompetenceId(competenceId),
    selectThematics().where('competenceId', competenceId).orderBy('id'),
  ]);
  if (!airtableDtos) return [];

  compareDtosLists(airtableDtos, pgDtos, compareThematicDtos);

  const translations = await translationRepository.listByEntities(model, airtableDtos.map(({ id }) => id));

  return toDomainList(airtableDtos, translations);
}

export async function listByCompetenceAirtableId(competenceAirtableId) {
  const airtableDtos = await thematicDatasource.listByCompetenceAirtableId(competenceAirtableId);
  if (!airtableDtos) return [];

  const ids = airtableDtos.map(({ id }) => id);
  const [pgDtos, translations] = await Promise.all([
    selectThematics().whereIn('id', ids).orderBy('id'),
    translationRepository.listByEntities(model, ids),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareThematicDtos);

  return toDomainList(airtableDtos, translations);
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

function selectThematics(knexConn = knex) {
  return knexConn.select(
    '*',
    knexConn.raw(
      'coalesce((??), \'[]\') as "tubeIds"',
      knexConn
        .select(knexConn.raw('json_agg(??)', knexConn.ref('tubes.id')))
        .from('tubes')
        .where('tubes.thematicId', '=', knexConn.ref(`${TABLE_NAME}.id`)),
    ),
  ).from(TABLE_NAME);
}

function compareThematicDtos(airtableThematic, pgThematic) {
  const diff = [];
  if (airtableThematic.id !== pgThematic.id) diff.push(`thematic airtable id "${airtableThematic.id}" != postgres id "${pgThematic.id}"`);
  if (!areNullableValuesEqual(airtableThematic.index, pgThematic.index)) diff.push(`thematic airtable index "${airtableThematic.index}" != postgres index "${pgThematic.index}"`);
  if (airtableThematic.competenceId !== pgThematic.competenceId) diff.push(`thematic airtable competenceId "${airtableThematic.competenceId}" != postgres competenceId "${pgThematic.competenceId}"`);
  if (!areArrayEquals(airtableThematic.tubeIds, pgThematic.tubeIds)) diff.push(`thematic airtable tubeIds "${airtableThematic.tubeIds}" != postgres tubeIds "${pgThematic.tubeIds}"`);
  return diff;
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
