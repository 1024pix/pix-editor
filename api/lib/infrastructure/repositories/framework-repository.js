import { Framework } from '../../domain/models/index.js';
import { frameworkDatasource } from '../datasources/airtable/index.js';

export async function list() {
  const frameworkDtos = await frameworkDatasource.list();
  return frameworkDtos.map(toDomain);
}

export async function create(framework) {
  const createdFrameworkDto = await frameworkDatasource.create(framework);
  return toDomain(createdFrameworkDto);
}

function toDomain(frameworkDto) {
  return new Framework(frameworkDto);
}
