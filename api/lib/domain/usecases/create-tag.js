export async function createTag(tag, dependencies = { tagRepository, ConflictError }) {
  const allTags = await dependencies.tagRepository.list();
  if (allTags.some((existingTag) => existingTag.name.localeCompare(tag.name, 'fr', { sensitivity: 'base' }) === 0)) {
    throw new dependencies.ConflictError('Nom de tag déjà pris');
  }
  return dependencies.tagRepository.create(tag);
}
