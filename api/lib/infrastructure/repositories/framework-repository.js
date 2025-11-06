import { Framework } from '../../domain/models/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import * as idGenerator from '../utils/id-generator.js';

const TABLE_NAME = 'frameworks';

export async function list() {
  const dtos = await knex
    .select(
      '*',
      knex.raw(
        'coalesce((??), \'[]\') as "areaIds"',
        knex
          .select(knex.raw('json_agg(?? order by ??)', ['areas.id', 'areas.id']))
          .from('areas')
          .where('areas.frameworkId', '=', knex.ref(`${TABLE_NAME}.id`)),
      ),
    )
    .from(TABLE_NAME)
    .orderBy('createdAt');

  return dtos.map(toDomain);
}

/**
 * @param {Framework} framework
 */
export async function create(framework) {
  const id = idGenerator.generateNewId('framework');

  await knex
    .insert({
      id,
      name: framework.name,
    })
    .into(TABLE_NAME);

  const dto = await selectFrameworks().where('id', id).first();

  return toDomain(dto);
}

function selectFrameworks() {
  return knex
    .select(
      '*',
      knex.raw(
        'coalesce((??), \'[]\') as "areaIds"',
        knex
          .select(knex.raw('json_agg(??)', knex.ref('areas.id')))
          .from('areas')
          .where('areas.frameworkId', '=', knex.ref(`${TABLE_NAME}.id`)),
      ),
    )
    .from(TABLE_NAME);
}

function toDomain(dto) {
  return new Framework(dto);
}
