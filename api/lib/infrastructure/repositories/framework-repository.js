import { Framework } from '../../domain/models/index.js';
import { frameworkDatasource } from '../datasources/airtable/index.js';
import { knex } from '../../../db/knex-database-connection.js';

const TABLE_NAME = 'frameworks';

export async function list() {
  const frameworkDtos = await frameworkDatasource.list();
  return frameworkDtos.map(toDomain);
}

/**
 * @param {Framework} framework
 */
export async function create(framework) {
  const createdFrameworkDto = await frameworkDatasource.create(framework);

  await knex.insert({
    id: createdFrameworkDto.id,
    name: framework.name,
  }).into(TABLE_NAME);

  return toDomain(createdFrameworkDto);
}

function toDomain(frameworkDto) {
  return new Framework(frameworkDto);
}
