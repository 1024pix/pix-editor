import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import nock from 'nock';

import { disconnect } from '../db/knex-database-connection.js';
import { queues } from '../lib/infrastructure/scheduled-jobs/index.js';
import { cache } from '../lib/infrastructure/cache.js';
import { databaseBuilder } from './test-helper.js';

beforeAll(() => {
  nock.disableNetConnect();
  vi.resetModules();
});

afterEach(async () => {
  await databaseBuilder.clean();
  nock.cleanAll();
  cache.flushAll();
  for (const queue of queues) {
    await queue.obliterate({ force: true }).catch(() => {});
  }
});

afterAll(async () => {
  await disconnect();
});
