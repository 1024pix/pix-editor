import { Framework } from '../../domain/models/index.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import * as idGenerator from '../utils/id-generator.js';

const TABLE_NAME = 'frameworks';

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await selectFrameworks(knexConn).orderBy('createdAt');

  return dtos.map(toDomain);
}

/**
 * @param {Framework} framework
 */
export async function create(framework) {
  const knexConn = DomainTransaction.getConnection();
  const id = idGenerator.generateNewId('framework');

  await knexConn
    .insert({
      id,
      name: framework.name,
    })
    .into(TABLE_NAME);

  const dto = await selectFrameworks(knexConn).where('id', id).first();

  return toDomain(dto);
}

function selectFrameworks(knexConn) {
  return knexConn
    .select(
      '*',
      knexConn.raw(
        'coalesce((??), \'[]\') as "areaIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['areas.id', 'areas.code']))
          .from('areas')
          .where('areas.frameworkId', '=', knexConn.ref(`${TABLE_NAME}.id`)),
      ),
    )
    .from(TABLE_NAME);
}

function toDomain(dto) {
  return new Framework(dto);
}
