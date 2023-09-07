const buildArea = require('./datasource-objects/build-area-datasource-object');
const buildCompetence = require('./datasource-objects/build-competence-datasource-object');
const buildChallenge = require('./datasource-objects/build-challenge-datasource-object');
const buildTube = require('./datasource-objects/build-tube-datasource-object');
const buildCourse = require('./build-course-postgres-data-object');
const buildSkill = require('./datasource-objects/build-skill-datasource-object');
const buildTutorial = require('./datasource-objects/build-tutorial-datasource-object');

module.exports = function buildRelease() {
  const area = buildArea({
    code: '1',
    color: 'jaffa',
    id: 'recvoGdo7z2z7pXWa',
    name: '1. Information et données',
    title: 'Information et données'
  });
  const competence = buildCompetence({
    id: 'recsvLz0W2ShyfD63',
    name: 'Mener une recherche et une veille d’information',
    index: '1.1',
    description: '1.1 Mener une recherche et une veille d’information',
    skillIds: [],
    area
  });

  return {
    areas: [area],
    competences: [competence],
    challenges: [buildChallenge()],
    tubes: [buildTube()],
    courses: [buildCourse()],
    skills: [buildSkill()],
    tutorials: [buildTutorial()],
  };
};
