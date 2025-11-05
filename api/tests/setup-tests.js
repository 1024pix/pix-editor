import { loadEnvFileIfExists } from '../lib/shared/load-env-file-if-exists.js';
import { disconnect } from '../db/knex-database-connection.js';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { queues } from '../lib/infrastructure/scheduled-jobs/index.js';
import { cache } from '../lib/infrastructure/cache.js';
import { airtableBuilder, databaseBuilder } from './test-helper.js';
import nock from 'nock';

loadEnvFileIfExists();

beforeAll(() => {
  nock.disableNetConnect();
  vi.resetModules();
});

afterEach(async () => {
  airtableBuilder.cleanAll();
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
