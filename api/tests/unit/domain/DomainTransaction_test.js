import {
  asyncLocalStorage,
  DomainTransaction,
} from '../../../lib/domain/DomainTransaction.js';
import { describe, expect, it, vi } from 'vitest';
import { knex } from '../../test-helper.js';

describe('API | Infrastructure | DomainTransaction', function() {
  describe('#getConnection', function() {
    it('should return connection from store', function() {
      const transaction = Symbol('transaction');
      const domainTransaction = new DomainTransaction(transaction);
      const storeStub = { transaction: domainTransaction };
      vi.spyOn(asyncLocalStorage, 'getStore').mockReturnValue(storeStub);

      const connection = DomainTransaction.getConnection();

      expect(connection).toBe(transaction);
    });

    it('should return knex connection by default', function() {
      vi.spyOn(asyncLocalStorage, 'getStore').mockReturnValue(undefined);

      const connection = DomainTransaction.getConnection();

      expect(connection).toBe(knex);
    });
  });

  describe('#execute', function() {
    it('should store transaction', async function() {
      const transactionStub = {};
      const domainTransaction = new DomainTransaction(transactionStub);
      vi.spyOn(asyncLocalStorage, 'run').mockImplementation(() => {});
      vi.spyOn(knex, 'transaction').mockImplementation(async (fn) => fn(transactionStub));

      await DomainTransaction.execute(function() {
        // Something
      });

      expect(asyncLocalStorage.run).toHaveBeenCalledWith(
        { transaction: domainTransaction },
        expect.any(Function),
        domainTransaction,
      );
    });

    it('should return function result', async function() {
      const transactionConfiguration = { isolationLevel: 'read committed' };
      vi.spyOn(knex, 'transaction').mockImplementation(async (fn) => fn({}));

      await DomainTransaction.execute(() => {}, transactionConfiguration);

      expect(knex.transaction).toHaveBeenCalledWith(expect.any(Function), transactionConfiguration);
    });

    it('should use configuration for transaction', async function() {
      const transactionStub = {};
      const domainTransaction = new DomainTransaction(transactionStub);
      vi.spyOn(asyncLocalStorage, 'run').mockImplementation(() => {});
      vi.spyOn(knex, 'transaction').mockImplementation(async (fn) => fn(transactionStub));

      await DomainTransaction.execute(function() {
        // Something
      });

      expect(asyncLocalStorage.run).toHaveBeenCalledWith(
        { transaction: domainTransaction },
        expect.any(Function),
        domainTransaction,
      );
    });
  });
});
