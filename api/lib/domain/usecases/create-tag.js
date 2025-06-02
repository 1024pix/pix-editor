import { Tag } from '../models/Tag.js';

export async function createTag(tagData, dependencies = {
  tagRepository,
}) {
  const newTag = new Tag(tagData);
  return dependencies.tagRepository.create(newTag);
}
