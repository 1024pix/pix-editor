import { competenceRepository } from '../../infrastructure/repositories/index.js';
import { NotFoundError } from '../../infrastructure/errors.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function updateCompetence(competenceAirtableId, competenceUpdates) {
  const competence = await competenceRepository.get(competenceAirtableId);

  if (!competence) throw new NotFoundError('unknown competence');

  competence.update(competenceUpdates);

  const updatedCompetence = await competenceRepository.update(competence);
  await updatePixApiReleaseCache.onCompetenceUpdated(updatedCompetence);
  return updatedCompetence;
}
