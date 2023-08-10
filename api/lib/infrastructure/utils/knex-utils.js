const { knex } = require('../../../db/knex-database-connection');

/**
 * Paginate a knex query with given page parameters
 * @param {*} queryBuilder - a knex query builder
 * @param {Object} page - page parameters
 * @param {Number} page.number - the page number to retrieve
 * @param {Number} page.size - the size of the page
 */
const fetchPage = async (
  queryBuilder,
  { number, size },
) => {
  const page = number < 1 ? 1 : number;
  const offset = (page - 1) * size;

  const clone = queryBuilder.clone();
  // we cannot execute the query and count the total rows at the same time
  // because it would not work when there are DISTINCT selection in the SELECT clause
  const { rowCount } = await knex.count('*', { as: 'rowCount' }).from(clone.as('query_all_results')).first();
  const results = await queryBuilder.limit(size).offset(offset);

  return {
    results,
    pagination: {
      page,
      pageSize: size,
      rowCount,
      pageCount: Math.ceil(rowCount / size),
    },
  };
};

module.exports = { fetchPage };
