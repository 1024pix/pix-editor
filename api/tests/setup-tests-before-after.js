import { beforeEach, afterEach } from 'vitest';
import nock from 'nock';

import { cache } from '../lib/infrastructure/cache.js';
import { queues } from '../lib/infrastructure/scheduled-jobs/index.js';
import './tooling/vitest-custom-matchers/index.js';

import { airtableBuilder, databaseBuilder } from './test-helper.js';

beforeEach(() => {
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
