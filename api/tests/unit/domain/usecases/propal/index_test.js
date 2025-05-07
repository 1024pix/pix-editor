import { describe, expect, it } from 'vitest';
import { usecases } from '../../../../../lib/domain/usecases/propal/index.js';

describe('Unit | Domain | Usecases | index', () => {
  it('should have injected usecase properly', async function() {
    const injectedUsecase = usecases.mockUsecaseForTestingPurposes;
    const {
      res: res1,
      areaRepository: areaRepository1,
      translationRepository: translationRepository1,
      logger: logger1,
    } = await injectedUsecase({ someArg1: 1, someArg2: 10, someArg3: 100 });
    const {
      res: res2,
      areaRepository: areaRepository2,
      translationRepository: translationRepository2,
      logger: logger2,
    } = await injectedUsecase({ someArg1: 2, someArg2: 20, someArg3: 200 });

    expect(res1, 'First instance of usecase should return the expected result').to.equal(111);
    expect(res2, 'Second instance of usecase should return the expected result').to.equal(222);
    expect(areaRepository1, 'Repositories should be different instances between usecases').not.toBe(areaRepository2);
    expect(translationRepository1, 'Repositories should be different instances between usecases').not.toBe(translationRepository2);
    expect(areaRepository1.dbConn, 'Repositories within same usecase should share the knex connection').toBe(translationRepository1.dbConn);
    expect(areaRepository2.dbConn, 'Repositories within same usecase should share the knex connection').toBe(translationRepository2.dbConn);
    expect(areaRepository1.dbConn, 'Same repositories in different usecase should have a different knex connection').not.toBe(areaRepository2.dbConn);
    expect(translationRepository1.dbConn, 'Same repositories in different usecase should have a different knex connection').not.toBe(translationRepository2.dbConn);
    expect(logger1, 'Loggers should be different').not.toBe(logger2);
    expect(logger1.bindings(), 'Logger should have an event name related to the usecase').toStrictEqual({ event: 'mockUsecaseForTestingPurposes' });
    expect(logger1.bindings(), 'Loggers should have the same bindings').toStrictEqual(logger2.bindings());
  });
});
