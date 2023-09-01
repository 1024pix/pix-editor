import Pack from '../../../package.json' assert { type: 'json' };
import * as config from '../../config.js';

export { default as plugin } from 'hapi-sentry';

export const options = {
  client: {
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    release: `v${Pack.version}`,
    maxBreadcrumbs: config.sentry.maxBreadcrumbs,
    debug: config.sentry.debug,
    maxValueLength: config.sentry.maxValueLength,
  },
  scope: {
    tags: [{ name: 'source', value: 'api' }],
  },
};
