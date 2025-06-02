import { tagDatasource } from '../datasources/airtable/index.js';
import { Tag } from '../../domain/models/Tag.js';
import * as idGenerator from '../utils/id-generator.js';

export async function create(tag) {
  const createdTagDto = await tagDatasource.create({
    ...tag,
    id: idGenerator.generateNewId('tag'),
  });
  return new Tag(createdTagDto);
}

export async function getById(tagId) {
  // Placeholder: This will need to be implemented.
  // Example:
  // const tagDto = await tagDatasource.findDtoById(tagId); // Assuming a method that returns a DTO
  // return toDomain(tagDto);
  console.log(`getById called with ${tagId}`);
  return null;
}

export async function update(tagDomainObject) {
  // Placeholder: This will need to be implemented.
  // Example:
  // const updatedTagDto = await tagDatasource.updateReturningDto(tagDomainObject); // Assuming a method that returns a DTO
  // return toDomain(updatedTagDto);
  console.log('update called with', tagDomainObject);
  return toDomain(tagDomainObject); // For now, convert the input (which is already a domain object)
}
