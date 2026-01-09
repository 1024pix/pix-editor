import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';

/**
 * @param {string} entityName
 * @param {string[]} fields
 * @param {object} pagination
 * @param {number} pagination.size
 * @param {number} pagination.number
 * @returns {Promise<{ entities: object[], meta: object }>}
 */
export async function listByEntityName(entityName, fields, pagination) {
  const getEntitiesQuery = knex(entityName).select(fields);
  const { results, pagination: meta } = await fetchPage(getEntitiesQuery, pagination);

  const entities = results.map(toDomain(entityName));

  return { entities, meta };
}

function toDomain(entityName) {
  return (entity) => ({
    entityName,
    ...entity,
  });
}
