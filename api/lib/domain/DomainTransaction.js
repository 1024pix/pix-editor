import { AsyncLocalStorage } from 'node:async_hooks';

import { knex } from '../../db/knex-database-connection.js';

/**
 * @typedef {import('knex').Knex} Knex
 * @typedef {import('knex').Knex.Transaction} Transaction
 * @typedef {import('knex').Knex.TransactionConfig} TransactionConfig
 */

const asyncLocalStorage = new AsyncLocalStorage();

class DomainTransaction {
  /**
   * @param {Transaction} knexTransaction
   */
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }

  /**
   * @template {Function} Lambda
   * @param {Lambda} lambda
   * @param {TransactionConfig=} transactionConfig
   * @returns {ReturnType<Lambda> | Promise<ReturnType<Lambda>>}
   */
  static execute(lambda, transactionConfig) {
    const existingConn = DomainTransaction.getConnection();
    if (existingConn.isTransaction) {
      return lambda();
    }
    let domainTransaction;
    return knex
      .transaction((trx) => {
        domainTransaction = new DomainTransaction(trx);
        return asyncLocalStorage.run({ transaction: domainTransaction }, lambda, domainTransaction);
      }, transactionConfig);
  }

  /**
   * @returns {Knex | Transaction}
   */
  static getConnection() {
    const store = asyncLocalStorage.getStore();

    if (store?.transaction) {
      const domainTransaction = store.transaction;
      return domainTransaction.knexTransaction;
    }
    return knex;
  }

  static emptyTransaction() {
    return new DomainTransaction(null);
  }
}

export { asyncLocalStorage, DomainTransaction };
