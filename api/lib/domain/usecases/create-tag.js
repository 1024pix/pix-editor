import { TagTitleAlreadyUsedError } from '../errors.js';

export async function createTag(tag, dependencies = { tagRepository }) {
  const tagWithIdenticalTitle = await dependencies.tagRepository.findByTitle(tag.title);
  if (tagWithIdenticalTitle) {
    throw new TagTitleAlreadyUsedError(tag.title);
  }
  return dependencies.tagRepository.create(tag);
}
