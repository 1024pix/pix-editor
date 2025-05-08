// TODO what to do
import { BadRequestError } from '../../../infrastructure/errors.js';

const createCompetence = async function({ competence, areaRepository, competenceRepository, competenceTransformer, updatedRecordNotifier, pixApiClient, logger, Sentry }) {
  const [area, competences] = await Promise.all([
    areaRepository.getByAirtableId(competence.areaAirtableId),
    competenceRepository.listByAreaAirtableId(competence.areaAirtableId),
  ]);

  if (!area) {
    throw new BadRequestError('unknown area');
  }

  competence.index = `${area.code}.${(competences?.length ?? 0) + 1}`;

  const createdCompetence = await competenceRepository.create(competence);

  try {
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'competences',
      updatedRecord: competenceTransformer.filterCompetenceFields(createdCompetence),
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdCompetence;
};

createCompetence.NEED_TRX = true;
export { createCompetence };
