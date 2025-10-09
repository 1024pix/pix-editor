import { Tag } from '../../domain/models/index.js';
import { tagDatasource } from '../datasources/airtable/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areNullableValuesEqual, compareDtos } from './migration-from-airtable.js';

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
  const datasourceTags = await tagDatasource.getManyByAirtableIds(airtableIds);
  if (!datasourceTags) return [];
  return datasourceTags.map(toDomain);
}

export async function searchByTitle(title) {
  const datasourceTags = await tagDatasource.searchByTitle(title);
  if (!datasourceTags) return [];
  return datasourceTags.map(toDomain);
}

export async function findByTitle(title) {
  const datasourceTag = await tagDatasource.findByTitle(title);
  if (!datasourceTag) return null;
  return toDomain(datasourceTag);
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
