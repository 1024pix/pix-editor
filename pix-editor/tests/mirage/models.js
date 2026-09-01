// This file imports and exports all models for explicit registration in config.js

import adminEntity from './models/admin-entity';
import adminSchema from './models/admin-schema';
import api from './models/api';
import area from './models/area';
import attachment from './models/attachment';
import brokenUrl from './models/broken-url';
import challenge from './models/challenge';
import challengeLocale from './models/challenge-locale';
import challengeSummary from './models/challenge-summary';
import changelogEntry from './models/changelog-entry';
import competence from './models/competence';
import competenceOverview from './models/competence-overview';
import config from './models/config';
import country from './models/country';
import draftModule from './models/draft-module';
import framework from './models/framework';
import localizedChallenge from './models/localized-challenge';
import localizedFrameworkTube from './models/localized-framework-tube';
import mission from './models/mission';
import missionSummary from './models/mission-summary';
import module from './models/module';
import note from './models/note';
import searchResult from './models/search-result';
import skill from './models/skill';
import staticCourse from './models/static-course';
import staticCourseSummary from './models/static-course-summary';
import staticCourseTag from './models/static-course-tag';
import tag from './models/tag';
import theme from './models/theme';
import tube from './models/tube';
import tutorial from './models/tutorial';
import user from './models/user';
import whitelistedUrl from './models/whitelisted-url';

export default {
  adminEntity,
  adminSchema,
  api,
  area,
  attachment,
  brokenUrl,
  challengeLocale,
  challengeSummary,
  challenge,
  changelogEntry,
  competenceOverview,
  competence,
  config,
  country,
  draftModule,
  framework,
  localizedChallenge,
  localizedFrameworkTube,
  missionSummary,
  mission,
  module,
  note,
  searchResult,
  skill,
  staticCourseSummary,
  staticCourseTag,
  staticCourse,
  tag,
  theme,
  tube,
  tutorial,
  user,
  whitelistedUrl,
};
