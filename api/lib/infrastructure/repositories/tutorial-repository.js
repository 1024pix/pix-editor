import { Tutorial } from '../../domain/models/index.js';
import { tutorialDatasource } from '../datasources/airtable/index.js';
import { generateNewId } from '../utils/id-generator.js';

export async function create(tutorial) {
  tutorial.id = generateNewId('tutorial');
  const datasourceTutorial = await tutorialDatasource.create(tutorial);
  return toDomain(datasourceTutorial);
}

export async function update(tutorial) {
  const datasourceTutorial = await tutorialDatasource.update(tutorial);
  return toDomain(datasourceTutorial);
}

export async function getByAirtableId(tutorialId) {
  const datasourceTutorial = await tutorialDatasource.find(tutorialId);
  if (!datasourceTutorial) return null;
  return toDomain(datasourceTutorial);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];
  const datasourceTutorials = await tutorialDatasource.getManyByAirtableIds(airtableIds);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function searchByTitle(title) {
  const datasourceTutorials = await tutorialDatasource.searchByTitle(title);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function searchBySource(source) {
  const datasourceTutorials = await tutorialDatasource.searchBySource(source);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function searchByTagTitles(tagTitles) {
  const datasourceTutorials = await tutorialDatasource.searchByTagTitles(tagTitles);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function getMany(ids) {
  const datasourceTutorials = await tutorialDatasource.filter({ filter: { ids } });
  return datasourceTutorials.map(toDomain);
}

async function _delete(ids) {
  const airtableIds = Object.entries(await tutorialDatasource.getAirtableIdsByIds(ids)).map(([, airtableId]) => airtableId);
  await tutorialDatasource.delete(airtableIds);
}

export { _delete as delete };

function toDomain(datasourceTutorial) {
  return new Tutorial(datasourceTutorial);
}
