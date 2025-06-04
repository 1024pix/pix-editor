export async function createTag(tag, dependencies = { tagRepository, ConflictError }) {
  const tagsWithIdenticalName = await dependencies.tagRepository.findAllByName(tag.name);
  if (tagsWithIdenticalName.length > 0) {
    throw new dependencies.ConflictError('Nom de tag déjà pris');
  }
  return dependencies.tagRepository.create(tag);
}
