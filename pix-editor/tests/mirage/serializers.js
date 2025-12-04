// This file imports and exports all serializers for explicit registration in config.js

import application from './serializers/application';
import challenge from './serializers/challenge';
import missionSummary from './serializers/mission-summary';
import staticCourseSummary from './serializers/static-course-summary';
import staticCourse from './serializers/static-course';

export default {
  application,
  challenge,
  missionSummary,
  staticCourseSummary,
  staticCourse,
};
