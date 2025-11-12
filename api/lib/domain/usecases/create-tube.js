import { thematicRepository, tubeRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

import { NotFoundError } from '../errors.js';

export async function createTube(
  tube,
  dependencies = {
    tubeRepository,
    thematicRepository,
    updatePixApiReleaseCache,
  },
) {
  const thematic = await dependencies.thematicRepository.get(tube.thematicAirtableId);
  if (!thematic) throw new NotFoundError('unknown thematic id');

  tube.prepareForCreation(thematic);

  const createdTube = await dependencies.tubeRepository.create(tube);

  await dependencies.updatePixApiReleaseCache.onTubeCreated(createdTube);

  return createdTube;
}
