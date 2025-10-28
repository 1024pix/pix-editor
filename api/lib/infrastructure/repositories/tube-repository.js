import _ from 'lodash';
import { tubeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as tubeTranslations from '../translations/tube.js';
import { Tube } from '../../domain/models/Tube.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areArrayEquals, areNullableValuesEqual, compareDtos, compareDtosLists } from './migration-from-airtable.js';

const model = 'tube';
const TABLE_NAME = 'tubes';

export async function list() {
  const [airtableDtos, pgDtos, translations] = await Promise.all([
    tubeDatasource.list(),
    selectTubes().orderBy(`${TABLE_NAME}.id`),
    translationRepository.listByModel(model),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareTubeDtos);

  return toDomainList(airtableDtos, translations);
}

export async function get(id) {
  const [[airtableDto], pgDto, translations] = await Promise.all([
    tubeDatasource.filter({ filter: { ids: [id] } }),
    selectTubes().where('tubes.id', id).first(),
    translationRepository.listByEntity(model, id),
  ]);

  compareDtos(airtableDto, pgDto, compareTubeDtos);

  if (!airtableDto) return null;

  return toDomain(airtableDto, translations);
}

export async function listByCompetenceId(competenceId) {
  const [airtableDtos, pgDtos] = await Promise.all([
    tubeDatasource.listByCompetenceId(competenceId),
    selectTubes().where('thematics.competenceId', competenceId).orderBy('tubes.id'),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareTubeDtos);

  if (!airtableDtos) return [];

  const translations = await translationRepository.listByEntities(
    model,
    airtableDtos.map(({ id }) => id),
  );

  return toDomainList(airtableDtos, translations);
}

export async function getByAirtableId(airtableId) {
  const airtableDto = await tubeDatasource.find(airtableId);
  if (!airtableDto) return null;

  const [pgDto, translations] = await Promise.all([
    selectTubes().where('tubes.id', airtableDto.id).first(),
    translationRepository.listByEntity(model, airtableDto.id),
  ]);

  compareDtos(airtableDto, pgDto, compareTubeDtos);

  return toDomain(airtableDto, translations);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];

  const airtableDtos = await tubeDatasource.getManyByAirtableIds(airtableIds);
  if (!airtableDtos) return [];

  const ids = airtableDtos.map(({ id }) => id);

  const [pgDtos, translations] = await Promise.all([
    selectTubes().whereIn('tubes.id', ids).orderBy('tubes.id'),
    translationRepository.listByEntities(model, ids),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareTubeDtos);

  return toDomainList(airtableDtos, translations);
}

export async function create(tube) {
  return knex.transaction(async (transaction) => {
    tube.id = idGenerator.generateNewId('tube');
    const createdTubeDTO = await tubeDatasource.create(tube);
    const translations = tubeTranslations.extractFromDomainObject(tube);
    await Promise.all([
      transaction
        .insert({
          id: tube.id,
          name: tube.name,
          index: tube.index,
          thematicId: createdTubeDTO.thematicId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations, transaction }),
    ]);
    return toDomain(createdTubeDTO, translations);
  });
}

export async function update(tube) {
  return knex.transaction(async (transaction) => {
    const updatedTubeDto = await tubeDatasource.update(tube);
    const translations = tubeTranslations.extractFromDomainObject(tube);
    await transaction(TABLE_NAME)
      .update({
        name: tube.name,
        index: tube.index,
        thematicId: updatedTubeDto.thematicId,
      })
      .where('id', tube.id);
    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${tubeTranslations.prefix}${tube.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    await translationRepository.save({ translations, transaction });
    return toDomain(updatedTubeDto, translations);
  });
}

function selectTubes() {
  return knex
    .select(
      `${TABLE_NAME}.*`,
      'thematics.competenceId',
      knex.raw(
        'coalesce((??), \'[]\') as "skillIds"',
        knex
          .select(knex.raw('json_agg(??)', 'skills.id'))
          .from('skills')
          .where('skills.tubeId', '=', knex.ref(`${TABLE_NAME}.id`)),
      ),
    )
    .from(TABLE_NAME)
    .join('thematics', 'thematics.id', `${TABLE_NAME}.thematicId`);
}

function compareTubeDtos(airtableDto, pgDto) {
  const diff = [];
  if (airtableDto.id !== pgDto.id) diff.push(`tube airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
  if (airtableDto.name !== pgDto.name)
    diff.push(`tube airtable name "${airtableDto.name}" != postgres name "${pgDto.name}"`);
  if (!areNullableValuesEqual(airtableDto.index, pgDto.index))
    diff.push(`tube airtable index "${airtableDto.index}" != postgres index "${pgDto.index}"`);
  if (airtableDto.thematicId !== pgDto.thematicId)
    diff.push(`tube airtable thematicId "${airtableDto.thematicId}" != postgres thematicId "${pgDto.thematicId}"`);
  if (airtableDto.competenceId !== pgDto.competenceId)
    diff.push(
      `tube airtable competenceId "${airtableDto.competenceId}" != postgres competenceId "${pgDto.competenceId}"`,
    );
  if (!areArrayEquals(airtableDto.skillIds, pgDto.skillIds))
    diff.push(`tube airtable skillIds "${airtableDto.skillIds}" != postgres skillIds "${pgDto.skillIds}"`);
  return diff;
}

function toDomainList(datasourceTubes, translations) {
  const translationsByTubeId = _.groupBy(translations, 'entityId');
  return datasourceTubes.map((datasourceTube) => toDomain(datasourceTube, translationsByTubeId[datasourceTube.id]));
}

function toDomain(datasourceTube, translations = []) {
  return new Tube({
    ...datasourceTube,
    ...tubeTranslations.toDomain(translations),
  });
}
