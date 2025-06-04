export async function createTag(tag, dependencies = { tagRepository, ConflictError }) {
  const tagsWithIdenticalTitle = await dependencies.tagRepository.findAllByTitle(tag.title);
  if (tagsWithIdenticalTitle.length > 0) {
    throw new dependencies.ConflictError('Nom de tag déjà pris');
  }
  return dependencies.tagRepository.create(tag);
}
