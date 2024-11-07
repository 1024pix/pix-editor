import { Framework } from '../../domain/models/index.js';
import { frameworkDatasource } from '../datasources/airtable/index.js';

export async function list() {
  const frameworkDtos = await frameworkDatasource.list();
  return frameworkDtos.map(toDomain);
}

function toDomain(frameworkDto) {
  return new Framework(frameworkDto);
}
