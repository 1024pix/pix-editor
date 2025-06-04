import { Tag } from '../../domain/models/index.js';
import { tagDatasource } from '../datasources/airtable/tag-datasource.js';
import { generateNewId } from '../utils/id-generator.js';

export async function create(tag) {
  tag.id = generateNewId('tag');
  const datasourceTag = await tagDatasource.create(tag);
  return toDomain(datasourceTag);
}

export async function getByAirtableId(tagId) {
  const datasourceTag = await tagDatasource.find(tagId);
  if (!datasourceTag) return null;
  return toDomain(datasourceTag);
}

export async function findAllByTitle(title) {
  const datasourceTags = await tagDatasource.searchByTitle(title);
  if (!datasourceTags) return [];
  return datasourceTags.map(toDomain);
}

function toDomain(datasourceTag) {
  return new Tag(datasourceTag);
}
