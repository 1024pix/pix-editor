const Content = require('../../../../lib/domain/models/release/Content');

module.exports = function buildContentForRelease({
  areas = [],
  challenges = [],
  competences = [],
  courses = [],
  frameworks = [],
  skills = [],
  thematics = [],
  tubes = [],
  tutorials = [],
} = {}) {
  return Content.buildForRelease({
    areas,
    challenges,
    competences,
    courses,
    frameworks,
    skills,
    thematics,
    tubes,
    tutorials,
  });
};
