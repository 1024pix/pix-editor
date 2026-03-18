import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';

/**
 * @param {string} entityName
 * @param {string[]} fields
 * @param {object} pagination
 * @param {number} pagination.size
 * @param {number} pagination.number
 * @param {object} sort
 * @param {string} sort.field
 * @param {'desc' | 'asc'} sort.direction
 * @returns {Promise<{ entities: object[], meta: object }>}
 */
export async function listByEntityName(entityName, fields, pagination, sort) {
  const getEntitiesQuery = knex(entityName).select(fields).orderBy(sort.field, sort.direction);
  const { results: entities, pagination: meta } = await fetchPage(getEntitiesQuery, pagination);

  return { entities, meta };
}

/**
 * @param {string} entityName
 * @param {object} entityToSave
 * @returns {Promise<object>}
 */
export async function save(entityName, entityToSave) {
  const [record] = await knex(entityName).insert(entityToSave, ['*']);
  return record;
}

/**
 * @param {string} entityName
 * @param {string} primaryKeyColumn
 * @param {string | number} id
 * @returns {Promise<object | undefined>}
 */
export async function get(entityName, primaryKeyColumn, id) {
  const record = await knex(entityName).where(primaryKeyColumn, id).first();
  return record;
}

/**
 * @param {string} entityName
 * @param {string} primaryKeyColumn
 * @param {string | number} id
 * @returns {Promise<void>}
 */
export async function destroy(entityName, primaryKeyColumn, id) {
  await knex(entityName).where(primaryKeyColumn, id).del();
}
