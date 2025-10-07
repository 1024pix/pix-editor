import { Framework } from '../../domain/models/index.js';
import { frameworkDatasource } from '../datasources/airtable/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areArrayEquals, compareDtosLists } from './migration-from-airtable.js';

const TABLE_NAME = 'frameworks';

export async function list() {
  const [airtableDtos, pgDtos] = await Promise.all([
    frameworkDatasource.list(),
    knex.select(
      '*',
      knex.raw(
        'coalesce((??), \'[]\') as "areaIds"',
        knex
          .select(knex.raw('json_agg(??)', knex.ref('areas.id')))
          .from('areas')
          .where('areas.frameworkId', '=', knex.ref(`${TABLE_NAME}.id`)),
      ),
    ).from(TABLE_NAME).orderBy('createdAt'),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareFrameworkDtos);

  return airtableDtos.map(toDomain);
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

function compareFrameworkDtos(airtableFramework, pgFramework) {
  const diff = [];
  if (airtableFramework.id !== pgFramework.id) diff.push(`framework airtable id "${airtableFramework.id}" != postgres id "${pgFramework.id}"`);
  if (airtableFramework.name !== pgFramework.name) diff.push(`framework airtable name "${airtableFramework.name}" != postgres name "${pgFramework.name}"`);
  if (!areArrayEquals(airtableFramework.areaIds, pgFramework.areaIds)) diff.push(`framework airtable areaIds "${airtableFramework.areaIds}" != postgres areaIds "${pgFramework.areaIds}"`);
  return diff;
}

function toDomain(frameworkDto) {
  return new Framework({
    ...frameworkDto,
    areaIds: frameworkDto.areaAirtableIds,
  });
}
