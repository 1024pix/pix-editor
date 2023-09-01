import * as airtableProxyRoute from './application/airtable-proxy.js';
import * as challengesRoute from './application/challenges/index.js';
import * as configRoute from './application/config.js';
import * as fileStorageTokenRoute from './application/file-storage-token/index.js';
import * as healthcheckRoute from './application/healthcheck/index.js';
import * as releasesRoute from './application/releases.js';
import * as replicationDataRoute from './application/replication-data.js';
import * as staticCoursesRoute from './application/static-courses/index.js';
import * as staticRoute from './application/static/index.js';
import * as usersRoute from './application/users.js';

export const routes = [
  airtableProxyRoute,
  challengesRoute,
  configRoute,
  fileStorageTokenRoute,
  healthcheckRoute,
  releasesRoute,
  replicationDataRoute,
  staticCoursesRoute,
  staticRoute,
  usersRoute,
];
