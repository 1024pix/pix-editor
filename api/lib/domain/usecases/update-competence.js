import { competenceRepository } from '../../infrastructure/repositories/index.js';
import { NotFoundError } from '../../infrastructure/errors.js';
import * as updatePixApiCache from '../services/update-pix-api-cache.js';

export async function updateCompetence(competenceAirtableId, competenceUpdates) {
  const competence = await competenceRepository.getByAirtableId(competenceAirtableId);

  if (!competence) throw new NotFoundError('unknown competence');

  competence.update(competenceUpdates);

  const updatedCompetence = await competenceRepository.update(competence);
  await updatePixApiCache.updateCompetence({ competence: updatedCompetence, shouldRefreshRelationships: false });
  return updatedCompetence;
}
