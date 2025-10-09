import { Tag } from '../../domain/models/index.js';
import { tagDatasource } from '../datasources/airtable/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areNullableValuesEqual, compareDtos, compareDtosLists } from './migration-from-airtable.js';

const TABLE_NAME = 'tutorial_tags';

export async function create(tag) {
  tag.id = generateNewId('tag');
  const [datasourceTag] = await Promise.all([
    tagDatasource.create(tag),
    knex(TABLE_NAME).insert({ id: tag.id, title: tag.title, notes: tag.notes }),
  ]);
  return toDomain(datasourceTag);
}

export async function getByAirtableId(tagId) {
  const airtableDto = await tagDatasource.find(tagId);
  if (!airtableDto) return null;

  const pgDto = await knex.select('*').from(TABLE_NAME).where('id', airtableDto.id).first();

  compareDtos(airtableDto, pgDto, compareTagDtos);

  return toDomain(airtableDto);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];
  const airtableDtos = await tagDatasource.getManyByAirtableIds(airtableIds);
  if (!airtableDtos) return [];
  const pgDtos = await knex.select('*').from(TABLE_NAME).whereIn('id', airtableDtos.map((tag) => tag.id)).orderBy('id');

  compareDtosLists(airtableDtos, pgDtos, compareTagDtos);

  return airtableDtos.map(toDomain);
}

export async function searchByTitle(title) {
  const [airtableDtos = [], pgDtos] = await Promise.all([
    tagDatasource.searchByTitle(title),
    knex.select('*').from(TABLE_NAME).whereILike('title', `%${title}%`).orderBy('title').limit(4),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareTagDtos);

  return airtableDtos.map(toDomain);
}

export async function findByTitle(title) {
  const [airtableDto, pgDto] = await Promise.all([
    tagDatasource.findByTitle(title),
    knex.select('*').from(TABLE_NAME).where(knex.raw('LOWER(??)', 'title'), title.toLowerCase()).first(),
  ]);

  compareDtos(airtableDto, pgDto, compareTagDtos);

  if (!airtableDto) return null;

  return toDomain(airtableDto);
}

function compareTagDtos(airtableTag, pgTag) {
  const diff = [];
  if (airtableTag.id !== pgTag.id) diff.push(`thematic airtable id "${airtableTag.id}" != postgres id "${pgTag.id}"`);
  if (airtableTag.title !== pgTag.title) diff.push(`thematic airtable title "${airtableTag.title}" != postgres title "${pgTag.title}"`);
  if (!areNullableValuesEqual(airtableTag.notes, pgTag.notes)) diff.push(`thematic airtable notes "${airtableTag.notes}" != postgres notes "${pgTag.notes}"`);
  return diff;
}

function toDomain(datasourceTag) {
  return new Tag(datasourceTag);
}
