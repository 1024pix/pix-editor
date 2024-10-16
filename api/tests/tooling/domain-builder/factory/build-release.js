import { buildAreaDatasourceObject as buildArea } from './datasource-objects/build-area-datasource-object.js';
import {
  buildCompetenceDatasourceObject as buildCompetence
} from './datasource-objects/build-competence-datasource-object.js';
import {
  buildChallengeDatasourceObject as buildChallenge
} from './datasource-objects/build-challenge-datasource-object.js';
import { buildTubeDatasourceObject as buildTube } from './datasource-objects/build-tube-datasource-object.js';
import { buildCoursePostgresDataObject as buildCourse } from './build-course-postgres-data-object.js';
import { buildSkillDatasourceObject as buildSkill } from './datasource-objects/build-skill-datasource-object.js';
import { buildTutorialDatasourceObject as buildTutorial } from './datasource-objects/build-tutorial-datasource-object.js';
import { Area } from '../../../../lib/domain/models/index.js';

export function buildRelease() {
  const area = buildArea({
    code: '1',
    color: Area.COLORS.CERULEAN,
    id: 'recvoGdo7z2z7pXWa',
    name: '1. Information et données',
    title: 'Information et données'
  });
  const competence = buildCompetence({
    id: 'recsvLz0W2ShyfD63',
    index: '1.1',
    skillIds: [],
    area
  });

  return {
    areas: [area],
    competences: [competence],
    challenges: [buildChallenge()], // FIXME datasource object?!
    tubes: [buildTube()],
    courses: [buildCourse()],
    skills: [buildSkill()],
    tutorials: [buildTutorial()],
  };
}
