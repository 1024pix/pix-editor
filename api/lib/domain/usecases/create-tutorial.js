import { logger } from '../../infrastructure/logger.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function createTutorial(tutorial, dependencies = { tutorialRepository }) {
  if (tutorial.isYoutubeVideoLink) {
    tutorial.rewriteYoutubeVideoLink({ logger });
  }
  const createdTutorial = await dependencies.tutorialRepository.create(tutorial);
  await updatePixApiReleaseCache.onTutorialCreated(createdTutorial);
  return createdTutorial;
}
