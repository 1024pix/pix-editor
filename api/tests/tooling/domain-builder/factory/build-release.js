const buildArea = require('./build-area-airtable-data-object');
const buildCompetence = require('./build-competence-airtable-data-object');
const buildChallenge = require('./build-challenge-airtable-data-object');
const buildTube = require('./build-tube-airtable-data-object');
const buildCourse = require('./build-course-airtable-data-object');
const buildSkill = require('./build-skill-airtable-data-object');
const buildTutorial = require('./build-tutorial-airtable-data-object');

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
    index:  '1.1',
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
