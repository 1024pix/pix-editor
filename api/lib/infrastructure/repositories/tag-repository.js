import { Tag } from '../../domain/models/index.js';
import { tagDatasource } from '../datasources/airtable/tag-datasource.js';
import { generateNewId } from '../utils/id-generator.js';

export async function list() {
  const datasourceTags = await tagDatasource.list();
  return datasourceTags.map(toDomain);
}

export async function create(tag) {
  tag.id = generateNewId('tag');
  const datasourceTag = await tagDatasource.create(tag);
  return toDomain(datasourceTag);
}

function toDomain(datasourceTag) {
  return new Tag(datasourceTag);
}
