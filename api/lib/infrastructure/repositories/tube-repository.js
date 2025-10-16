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

  compareDtosLists(airtableDtos, pgDtos, compareSkillDtos);

  return toDomainList(airtableDtos, translations);
}

export async function get(id) {
  const [[airtableDto], pgDto, translations] = await Promise.all([
    tubeDatasource.filter({ filter: { ids: [id] } }),
    selectTubes().where('tubes.id', id).first(),
    translationRepository.listByEntity(model, id),
  ]);

  compareDtos(airtableDto, pgDto, compareSkillDtos);

  if (!airtableDto) return null;

  return toDomain(airtableDto, translations);
}

export async function listByCompetenceId(competenceId) {
  const datasourceTubes = await tubeDatasource.listByCompetenceId(competenceId);
  if (!datasourceTubes) return [];
  const translations = await translationRepository.listByEntities(model, datasourceTubes.map(({ id }) => id));
  return toDomainList(datasourceTubes, translations);
}

export async function getByAirtableId(airtableId) {
  const datasourceTube = await tubeDatasource.find(airtableId);
  if (!datasourceTube) return null;
  const translations = await translationRepository.listByEntity(model, datasourceTube.id);
  return toDomain(datasourceTube, translations);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];
  const datasourceTubes = await tubeDatasource.getManyByAirtableIds(airtableIds);
  if (!datasourceTubes) return [];
  const translations = await translationRepository.listByEntities(model, datasourceTubes.map(({ id }) => id));
  return toDomainList(datasourceTubes, translations);
}

export async function create(tube) {
  return knex.transaction(async (transaction) => {
    tube.id = idGenerator.generateNewId('tube');
    const createdTubeDTO = await tubeDatasource.create(tube);
    const translations = tubeTranslations.extractFromDomainObject(tube);
    await Promise.all([
      transaction.insert({
        id: tube.id,
        name: tube.name,
        index: tube.index,
        thematicId: createdTubeDTO.thematicId,
      }).into(TABLE_NAME),
      translationRepository.save({ translations, transaction }),
    ]);
    return toDomain(createdTubeDTO, translations);
  });
}

export async function update(tube) {
  return knex.transaction(async (transaction) => {
    const updatedTubeDto = await tubeDatasource.update(tube);
    const translations = tubeTranslations.extractFromDomainObject(tube);
    await transaction(TABLE_NAME).update({
      name: tube.name,
      index: tube.index,
      thematicId: updatedTubeDto.thematicId,
    }).where('id', tube.id);
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
  return knex.select(
    `${TABLE_NAME}.*`,
    'thematics.competenceId',
    knex.raw(
      'coalesce((??), \'[]\') as "skillIds"',
      knex
        .select(knex.raw('json_agg(??)', 'skills.id'))
        .from('skills')
        .where('skills.tubeId', '=', knex.ref(`${TABLE_NAME}.id`)),
    ),
  ).from(TABLE_NAME).join('thematics', 'thematics.id', `${TABLE_NAME}.thematicId`);
}

function compareSkillDtos(airtableSkill, pgSkill) {
  const diff = [];
  if (airtableSkill.id !== pgSkill.id) diff.push(`tube airtable id "${airtableSkill.id}" != postgres id "${pgSkill.id}"`);
  if (airtableSkill.name !== pgSkill.name) diff.push(`tube airtable name "${airtableSkill.name}" != postgres name "${pgSkill.name}"`);
  if (!areNullableValuesEqual(airtableSkill.index, pgSkill.index)) diff.push(`tube airtable index "${airtableSkill.index}" != postgres index "${pgSkill.index}"`);
  if (airtableSkill.thematicId !== pgSkill.thematicId) diff.push(`tube airtable thematicId "${airtableSkill.thematicId}" != postgres thematicId "${pgSkill.thematicId}"`);
  if (airtableSkill.competenceId !== pgSkill.competenceId) diff.push(`tube airtable competenceId "${airtableSkill.competenceId}" != postgres competenceId "${pgSkill.competenceId}"`);
  if (!areArrayEquals(airtableSkill.skillIds, pgSkill.skillIds)) diff.push(`tube airtable skillIds "${airtableSkill.skillIds}" != postgres skillIds "${pgSkill.skillIds}"`);
  return diff;
}

function toDomainList(datasourceTubes, translations) {
  const translationsByTubeId = _.groupBy(translations, 'entityId');
  return datasourceTubes.map(
    (datasourceTube) => toDomain(datasourceTube, translationsByTubeId[datasourceTube.id]),
  );
}

function toDomain(datasourceTube, translations = []) {
  return new Tube({
    ...datasourceTube,
    ...tubeTranslations.toDomain(translations),
  });
}
