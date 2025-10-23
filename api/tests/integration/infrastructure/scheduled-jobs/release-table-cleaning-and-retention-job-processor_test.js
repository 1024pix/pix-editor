import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import releasesTableCleaningAndRetention from '../../../../lib/infrastructure/scheduled-jobs/release-table-cleaning-and-retention-job-processor.js';
import { databaseBuilder, knex } from '../../../test-helper.js';

describe('Integration | Infrastructure | scheduled-jobs | releases-table-cleaning-and-retention-job', function () {
  let logger;
  beforeEach(function () {
    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };
    vi.useFakeTimers({
      now: new Date('2021-02-15T03:04:00Z'),
    });
  });

  afterEach(function () {
    vi.useRealTimers();
  });

  it('keeps all releases within 3 months and first release of each month for the older ones', async function () {
    // given
    // releases within 3 months
    databaseBuilder.factory.buildRelease({ id: 1, createdAt: new Date('2021-02-15T00:00:00Z'), content: {} }); // keep
    databaseBuilder.factory.buildRelease({ id: 2, createdAt: new Date('2021-01-15T00:00:00Z'), content: {} }); // keep
    databaseBuilder.factory.buildRelease({ id: 3, createdAt: new Date('2020-12-15T00:00:00Z'), content: {} }); // keep
    databaseBuilder.factory.buildRelease({ id: 4, createdAt: new Date('2020-11-15T00:00:00Z'), content: {} }); // keep
    // older releases
    databaseBuilder.factory.buildRelease({ id: 5, createdAt: new Date('2020-11-14T00:00:00Z'), content: {} }); // del
    databaseBuilder.factory.buildRelease({ id: 6, createdAt: new Date('2020-11-02T00:00:00Z'), content: {} }); // keep
    databaseBuilder.factory.buildRelease({ id: 7, createdAt: new Date('2020-10-01T00:00:00Z'), content: {} }); // keep
    databaseBuilder.factory.buildRelease({ id: 8, createdAt: new Date('2020-10-01T00:00:01Z'), content: {} }); // del
    databaseBuilder.factory.buildRelease({ id: 9, createdAt: new Date('2020-10-10T00:00:00Z'), content: {} }); // del
    databaseBuilder.factory.buildRelease({ id: 10, createdAt: new Date('2020-10-18T00:00:00Z'), content: {} }); // del
    databaseBuilder.factory.buildRelease({ id: 11, createdAt: new Date('2020-10-30T00:00:00Z'), content: {} }); // del
    await databaseBuilder.commit();

    // when
    await releasesTableCleaningAndRetention({ logger });

    // then
    const idsInDB = await knex('releases').pluck('id').orderBy('id');
    expect(idsInDB).toStrictEqual([1, 2, 3, 4, 6, 7]);
    expect(logger.info).toHaveBeenCalledWith('5 rows deleted');
    expect(logger.error).not.toHaveBeenCalled();
  });
});
