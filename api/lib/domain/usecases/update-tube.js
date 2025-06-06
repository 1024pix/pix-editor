import { tubeRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';
import { NotFoundError } from '../errors.js';

export async function updateTube(tubeAirtableId, tubeUpdates, dependencies = { tubeRepository, updatePixApiReleaseCache }) {
  const tube = await dependencies.tubeRepository.getByAirtableId(tubeAirtableId);
  if (!tube) throw new NotFoundError('unknown tube id');

  tube.update(tubeUpdates);

  const updatedTube = await dependencies.tubeRepository.update(tube);

  await dependencies.updatePixApiReleaseCache.onTubeUpdated(updatedTube);

  return updatedTube;
}
