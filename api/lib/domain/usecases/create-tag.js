export async function createTag(tag, dependencies = { tagRepository, ConflictError }) {
  const tagWithIdenticalTitle = await dependencies.tagRepository.findByTitle(tag.title);
  if (tagWithIdenticalTitle) {
    throw new dependencies.ConflictError('Nom de tag déjà pris');
  }
  return dependencies.tagRepository.create(tag);
}
