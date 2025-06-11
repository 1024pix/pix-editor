export async function searchTutorials(params, dependencies = { tutorialRepository }) {
  if (params.filter.title) {
    return dependencies.tutorialRepository.searchByTitle(params.filter.title);
  }
  if (params.filter.source) {
    return dependencies.tutorialRepository.searchBySource(params.filter.source);
  }
  if (params.filter.ids) {
    return dependencies.tutorialRepository.getManyByAirtableIds(params.filter.ids);
  }
  return dependencies.tutorialRepository.searchByTagTitles(params.filter.tagTitles);
}
