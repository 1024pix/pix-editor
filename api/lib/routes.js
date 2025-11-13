import * as airtableProxyRoute from './application/airtable-proxy.js';
import * as attachmentsRoute from './application/attachments.js';
import * as areasRoute from './application/areas.js';
import * as challengesRoute from './application/challenges/index.js';
import * as changelogEntriesRoute from './application/changelog-entries.js';
import { competenceRoutes } from './application/competences/index.js';
import * as configRoute from './application/config.js';
import * as embedsRoute from './application/embeds.js';
import * as fileStorageTokenRoute from './application/file-storage-token/index.js';
import * as frameworksRoute from './application/frameworks.js';
import * as healthcheckRoute from './application/healthcheck/index.js';
import * as heapdumpRoute from './application/heapdump.js';
import * as localizedChallengesRoute from './application/localized-challenges.js';
import * as missionsRoute from './application/missions/index.js';
import * as notesRoute from './application/notes.js';
import * as phraseRoute from './application/phrase.js';
import * as releasesRoute from './application/releases.js';
import * as replicationDataRoute from './application/replication-data.js';
import * as skillsRoute from './application/skills/index.js';
import * as staticCoursesRoute from './application/static-courses/index.js';
import * as staticCourseTagsRoute from './application/static-course-tags/index.js';
import * as staticRoute from './application/static/index.js';
import * as tagsRoute from './application/tags.js';
import * as thematicsRoutes from './application/thematics.js';
import * as translationsRoute from './application/translations.js';
import * as tutorialsRoute from './application/tutorials.js';
import * as tubesRoutes from './application/tubes.js';
import * as usersRoute from './application/users.js';
import * as whitelistedUrlsRoute from './application/whitelisted-urls/index.js';

export const routes = [
  airtableProxyRoute,
  areasRoute,
  attachmentsRoute,
  challengesRoute,
  changelogEntriesRoute,
  configRoute,
  embedsRoute,
  fileStorageTokenRoute,
  frameworksRoute,
  heapdumpRoute,
  healthcheckRoute,
  localizedChallengesRoute,
  missionsRoute,
  notesRoute,
  phraseRoute,
  releasesRoute,
  replicationDataRoute,
  skillsRoute,
  staticCoursesRoute,
  staticCourseTagsRoute,
  staticRoute,
  tagsRoute,
  thematicsRoutes,
  translationsRoute,
  tutorialsRoute,
  tubesRoutes,
  usersRoute,
  whitelistedUrlsRoute,
  ...competenceRoutes,
];
