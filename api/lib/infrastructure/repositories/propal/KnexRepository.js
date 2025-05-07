import { knex } from '../../../../db/knex-database-connection.js';

export class KnexRepository {
  constructor({ knexTransaction } = {}) {
    this.dbConn = knexTransaction || knex;
  }
}
