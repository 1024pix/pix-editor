import { NotFoundError } from '../errors.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function updateTutorial(tutorialData, dependencies = { tutorialRepository }) {
  const tutorial = await dependencies.tutorialRepository.getByAirtableId(tutorialData.airtableId);
  if (!tutorial) {
    throw new NotFoundError('unknown tutorial id');
  }
  tutorial.update(tutorialData);
  const updatedTutorial = await dependencies.tutorialRepository.update(tutorial);
  await updatePixApiReleaseCache.onTutorialUpdated(updatedTutorial);
  return updatedTutorial;
}
