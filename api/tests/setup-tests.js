import { afterEach, beforeAll, afterAll } from 'vitest';
import { loadEnvFileIfExists } from '../lib/shared/load-env-file-if-exists.js';
import { airtableBuilder, databaseBuilder } from './test-helper.js';
import { cache } from '../lib/infrastructure/cache.js';
import nock from 'nock';
import { queues } from '../lib/infrastructure/scheduled-jobs/create-queue.js';
import { disconnect } from '../db/knex-database-connection.js';

loadEnvFileIfExists();

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(async () => {
  airtableBuilder.cleanAll();
  await databaseBuilder.clean();
  cache.flushAll();
  nock.cleanAll();
  for (const queue of queues) {
    await queue.obliterate({ force: true });
  }
});

afterAll(async () => {
  await disconnect();
});
