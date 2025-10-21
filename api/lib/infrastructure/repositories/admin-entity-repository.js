import { knex } from '../../../db/knex-database-connection.js';

export async function getByType(type) {
  const entities = await knex(type).limit(15);

  return entities;
}
