import { NotFoundError } from '../errors.js';

export async function updateTutorial(tutorialData, dependencies = { tutorialRepository }) {
  const tutorial = await dependencies.tutorialRepository.getByAirtableId(tutorialData.airtableId);
  if (!tutorial) {
    throw new NotFoundError('unknown tutorial id');
  }
  tutorial.update(tutorialData);
  return dependencies.tutorialRepository.update(tutorial);
}
