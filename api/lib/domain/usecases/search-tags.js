export async function searchTags(params, dependencies = { tagRepository }) {
  if (params.filter.title) {
    return dependencies.tagRepository.searchByTitle(params.filter.title);
  }
  return dependencies.tagRepository.getMany(params.filter.ids);
}
