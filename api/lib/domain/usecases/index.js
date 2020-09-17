const _ = require('lodash');
const injectDefaults = require('../../infrastructure/utils/inject-defaults');
const airtableDatasource = require('../../infrastructure/datasources/airtable');

const dependencies = {
  areaDatasource: airtableDatasource.AreaDatasource,
  areaRepository: require('../../infrastructure/repositories/area-repository'),
  challengeDatasource: airtableDatasource.ChallengeDatasource,
  competenceDatasource: airtableDatasource.CompetenceDatasource,
  courseDatasource: airtableDatasource.CourseDatasource,
  skillDatasource: airtableDatasource.SkillDatasource,
  tubeDatasource: airtableDatasource.TubeDatasource,
  tutorialDatasource: airtableDatasource.TutorialDatasource
};

function injectDependencies(usecases) {
  return _.mapValues(usecases, _.partial(injectDefaults, dependencies));
}

module.exports = injectDependencies({
  getAreas: require('./get-areas'),
});
