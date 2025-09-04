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
      knex
        .select(knex.raw('json_agg(??)', knex.ref('areas.id')))
        .from('areas')
        .where('areas.frameworkId', '=', knex.ref('frameworks.id'))
        .as('areaIds'),
    ).from(TABLE_NAME).orderBy('createdAt'),
  ]);

  compareDtosLists(airtableDtos, pgDtos, (airtableDto, pgDto) => {
    const diff = [];
    if (airtableDto.id !== pgDto.id) diff.push(`airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
    if (airtableDto.name !== pgDto.name) diff.push(`airtable name "${airtableDto.name}" != postgres name "${pgDto.name}"`);
    if (!areArrayEquals(airtableDto.areaIds, pgDto.areaIds)) diff.push(`airtable areaIds "${airtableDto.areaIds}" != postgres areaIds "${pgDto.areaIds}"`);
    return diff;
  });

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

function toDomain(frameworkDto) {
  return new Framework({
    ...frameworkDto,
    areaIds: frameworkDto.areaAirtableIds,
  });
}
