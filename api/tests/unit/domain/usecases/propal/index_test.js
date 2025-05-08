import { beforeEach, describe as context, describe, expect, it } from 'vitest';
import { usecases } from '../../../../../lib/domain/usecases/propal/index.js';
import { knex } from '../../../../test-helper.js';

describe('Unit | Domain | Usecases | index', () => {
  beforeEach(function() {
    return knex('users').del();
  });

  it('should have injected usecase properly', async function() {
    const injectedUsecase = usecases.mockUsecaseWithTrx;
    const {
      res: res1,
      mockRepositoryA: mockRepositoryA1,
      mockRepositoryB: mockRepositoryB1,
      logger: logger1,
    } = await injectedUsecase({ someArg1: 1, someArg2: 10, someArg3: 100, shouldThrow: false });
    const {
      res: res2,
      mockRepositoryA: mockRepositoryA2,
      mockRepositoryB: mockRepositoryB2,
      logger: logger2,
    } = await injectedUsecase({ someArg1: 2, someArg2: 20, someArg3: 200, shouldThrow: false });

    expect(res1, 'First instance of usecase should return the expected result').to.equal(111);
    expect(res2, 'Second instance of usecase should return the expected result').to.equal(222);
    expect(mockRepositoryA1, 'Repositories should be different instances between usecases').not.toBe(mockRepositoryA2);
    expect(mockRepositoryB1, 'Repositories should be different instances between usecases').not.toBe(mockRepositoryB2);
    expect(mockRepositoryA1.dbConn, 'Repositories within same usecase should share the knex connection').toBe(mockRepositoryB1.dbConn);
    expect(mockRepositoryA2.dbConn, 'Repositories within same usecase should share the knex connection').toBe(mockRepositoryB2.dbConn);
    expect(mockRepositoryA1.dbConn, 'Same repositories in different usecase should have a different knex connection').not.toBe(mockRepositoryA2.dbConn);
    expect(mockRepositoryB1.dbConn, 'Same repositories in different usecase should have a different knex connection').not.toBe(mockRepositoryB2.dbConn);
    expect(logger1, 'Loggers should be different').not.toBe(logger2);
    expect(logger1.bindings(), 'Logger should have an event name related to the usecase').toStrictEqual({ event: 'mockUsecaseWithTrx' });
    expect(logger1.bindings(), 'Loggers should have the same bindings').toStrictEqual(logger2.bindings());
  });

  context('when usecase requires a DB transaction (NEED_TRX at true)', function() {
    const injectedUsecase = usecases.mockUsecaseWithTrx;

    it('should do usecase and persist in DB when everything is ok', async function() {
      await injectedUsecase({ someArg1: 1, someArg2: 10, someArg3: 100, shouldThrow: false });
      const userNamesInserted = await knex('users').pluck('name').orderBy('name', 'asc');
      expect(userNamesInserted).toStrictEqual(['name in MockRepositoryA', 'name in MockRepositoryB']);
    });

    it('should rollback the transaction when something goes wrong', async function() {
      await expect(injectedUsecase({ someArg1: 1, someArg2: 10, someArg3: 100, shouldThrow: true })).rejects.toThrowError();
      const userNamesInserted = await knex('users').pluck('name').orderBy('name', 'asc');
      expect(userNamesInserted).toStrictEqual([]);
    });
  });

  context('when usecase does not requires a DB transaction (NEED_TRX at false)', function() {
    const injectedUsecase = usecases.mockUsecaseWithoutTrx;

    it('should do usecase and persist in DB when everything is ok', async function() {
      await injectedUsecase({ someArg1: 1, someArg2: 10, someArg3: 100, shouldThrow: false });
      const userNamesInserted = await knex('users').pluck('name').orderBy('name', 'asc');
      expect(userNamesInserted).toStrictEqual(['name in MockRepositoryA', 'name in MockRepositoryB']);
    });

    it('should persist anything executed before the error was thrown', async function() {
      await expect(injectedUsecase({ someArg1: 1, someArg2: 10, someArg3: 100, shouldThrow: true })).rejects.toThrowError();
      const userNamesInserted = await knex('users').pluck('name').orderBy('name', 'asc');
      expect(userNamesInserted).toStrictEqual(['name in MockRepositoryA']);
    });
  });
});
