import { Tutorial } from '../../domain/models/index.js';
import { tutorialDatasource } from '../datasources/airtable/index.js';
import { generateNewId } from '../utils/id-generator.js';

export async function create(tutorial) {
  tutorial.id = generateNewId('tutorial');
  const datasourceTutorial = await tutorialDatasource.create(tutorial);
  return toDomain(datasourceTutorial);
}

export async function getByAirtableId(tutorialId) {
  const datasourceTutorial = await tutorialDatasource.find(tutorialId);
  if (!datasourceTutorial) return null;
  return toDomain(datasourceTutorial);
}

function toDomain(datasourceTutorial) {
  return new Tutorial(datasourceTutorial);
}
