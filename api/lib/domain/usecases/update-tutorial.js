import { logger } from '../../infrastructure/logger.js';
import { NotFoundError } from '../errors.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function updateTutorial(tutorialData, dependencies = { tutorialRepository }) {
  const tutorial = await dependencies.tutorialRepository.get(tutorialData.airtableId);
  if (!tutorial) {
    throw new NotFoundError('unknown tutorial id');
  }
  tutorial.update(tutorialData);
  if (tutorial.isYoutubeVideoLink) {
    tutorial.rewriteYoutubeVideoLink({ logger });
  }
  const updatedTutorial = await dependencies.tutorialRepository.update(tutorial);
  await updatePixApiReleaseCache.onTutorialUpdated(updatedTutorial);
  return updatedTutorial;
}
