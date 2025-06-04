export async function searchTutorials(params, dependencies = { tutorialRepository }) {
  if (params.filter.title) {
    return dependencies.tutorialRepository.searchByTitle(params.filter.title);
  }
  if (params.filter.source) {
    return dependencies.tutorialRepository.searchBySource(params.filter.source);
  }
  return dependencies.tutorialRepository.searchByTagTitles(params.filter.tagTitles);
}
