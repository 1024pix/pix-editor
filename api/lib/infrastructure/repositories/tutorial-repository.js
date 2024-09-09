import { tutorialDatasource } from '../datasources/airtable/index.js';
import { Tutorial } from '../../domain/models/index.js';

export async function getMany(ids) {
  const tutorialsDTO = await tutorialDatasource.filter({ filter: { ids } });
  return toDomainList(tutorialsDTO);
}

function toDomainList(tutorialsDTO) {
  return tutorialsDTO.map(toDomain);
}

function toDomain(datasourceTube) {
  return new Tutorial(datasourceTube);
}
