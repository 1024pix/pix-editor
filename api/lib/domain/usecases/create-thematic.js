import { thematicRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function createThematic(thematic, dependencies = { thematicRepository }) {
  const competenceThematics = await dependencies.thematicRepository.listByCompetenceAirtableId(thematic.competenceAirtableId);

  thematic.prepareForCreation(competenceThematics);

  const createdThematic = await dependencies.thematicRepository.create(thematic);
  await updatePixApiReleaseCache.onThematicCreated(createdThematic);
  return createdThematic;
}
