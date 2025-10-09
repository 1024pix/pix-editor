import { Tag } from '../../domain/models/index.js';
import { tagDatasource } from '../datasources/airtable/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

export async function create(tag) {
  tag.id = generateNewId('tag');
  const [datasourceTag] = await Promise.all([
    tagDatasource.create(tag),
    knex('tutorial_tags').insert({ id: tag.id, title: tag.title, notes: tag.notes }),
  ]);
  return toDomain(datasourceTag);
}

export async function getByAirtableId(tagId) {
  const datasourceTag = await tagDatasource.find(tagId);
  if (!datasourceTag) return null;
  return toDomain(datasourceTag);
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

function toDomain(datasourceTag) {
  return new Tag(datasourceTag);
}
