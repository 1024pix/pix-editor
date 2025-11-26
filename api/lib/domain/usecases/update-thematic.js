import { thematicRepository } from '../../infrastructure/repositories/index.js';
import { NotFoundError } from '../errors.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function updateThematic(thematicAirtableId, thematicUpdates, dependencies = { thematicRepository }) {
  const thematic = await dependencies.thematicRepository.get(thematicAirtableId);

  if (!thematic) {
    throw new NotFoundError('unknown thematic id');
  }

  thematic.update(thematicUpdates);
  const updatedThematic = await dependencies.thematicRepository.update(thematic);

  await updatePixApiReleaseCache.onThematicUpdated(updatedThematic);
  return updatedThematic;
}
