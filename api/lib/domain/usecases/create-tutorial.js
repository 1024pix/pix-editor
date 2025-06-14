import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function createTutorial(tutorial, dependencies = { tutorialRepository }) {
  const createdTutorial = await dependencies.tutorialRepository.create(tutorial);
  await updatePixApiReleaseCache.onTutorialCreated(createdTutorial);
  return createdTutorial;
}
