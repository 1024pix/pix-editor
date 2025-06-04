// todo patch release
export function createTutorial(tutorial, dependencies = { tutorialRepository }) {
  return dependencies.tutorialRepository.create(tutorial);
}
