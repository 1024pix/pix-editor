import { Framework } from '../../../domain/models/index.js';
import { frameworkDatasource } from '../../datasources/airtable/index.js';
import { KnexRepository } from './KnexRepository.js';

export class FrameworkRepository extends KnexRepository {
  async list() {
    const frameworkDtos = await frameworkDatasource.list();
    return frameworkDtos.map(toDomain);
  }

  async create(framework) {
    const createdFrameworkDto = await frameworkDatasource.create(framework);
    return toDomain(createdFrameworkDto);
  }
}

function toDomain(frameworkDto) {
  return new Framework(frameworkDto);
}
