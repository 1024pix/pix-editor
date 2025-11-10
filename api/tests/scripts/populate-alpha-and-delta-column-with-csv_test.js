import { describe, expect, it, vi } from 'vitest';

import { PopulateAlphaAndDeltaColumnsWithCsv } from '../../scripts/populate-alpha-and-delta-column-with-csv.js';
import { databaseBuilder, createTempFile, knex } from '../test-helper.js';

describe('Script | Populate alpha and delta columns', function () {
  it('should parse input file', async function () {
    const script = new PopulateAlphaAndDeltaColumnsWithCsv();
    const options = script.metaInfo.options;
    const file = 'challenge-calibrations-to-import.csv';
    const data = 'challenge_id;delta;alpha\n123;1;2\n456;4;5\n789;7;8';
    const csvFilePath = await createTempFile(file, data);
    const parsedData = await options.file.coerce(csvFilePath);

    expect(parsedData).to.deep.equals([
      { challenge_id: '123', delta: 1, alpha: 2 },
      { challenge_id: '456', delta: 4, alpha: 5 },
      { challenge_id: '789', delta: 7, alpha: 8 },
    ]);
  });

  it('should update challenges with given calibration', async function () {
    databaseBuilder.factory.buildChallenge({ id: '123', alpha: 4, delta: 5 });
    await databaseBuilder.commit();
    const script = new PopulateAlphaAndDeltaColumnsWithCsv();
    const logger = { info: vi.fn(), debug: vi.fn(), error: vi.fn() };
    const file = [
      { challenge_id: '123', delta: 1, alpha: 2 },
      { challenge_id: '456', delta: 4, alpha: 5 },
      { challenge_id: '789', delta: 7, alpha: 8 },
    ];

    // when
    await script.handle({ logger, options: { file, dryRun: false } });

    // then
    const challenges = await knex.select('id', 'alpha', 'delta').from('challenges');
    expect(challenges).toStrictEqual([{ id: '123', alpha: 2, delta: 1 }]);
  });
});
