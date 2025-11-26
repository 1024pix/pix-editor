import { tubeRepository, thematicRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';
import { NotFoundError } from '../errors.js';

export async function updateTube(
  tubeAirtableId,
  tubeUpdates,
  dependencies = {
    tubeRepository,
    thematicRepository,
    updatePixApiReleaseCache,
  },
) {
  const tube = await dependencies.tubeRepository.get(tubeAirtableId);
  if (!tube) throw new NotFoundError('unknown tube id');
  const thematic = await dependencies.thematicRepository.get(tubeUpdates.thematicAirtableId);
  tube.update(tubeUpdates, thematic);

  const updatedTube = await dependencies.tubeRepository.update(tube);

  await dependencies.updatePixApiReleaseCache.onTubeUpdated(updatedTube);
  return updatedTube;
}
