const CourseForRelease = require('../../../../lib/domain/models/CourseForRelease');

module.exports = function buildCourseForRelease({
  id = 'recPBOj7JzBcgXEtO',
  description = 'Programmer niveau 1 et 2',
  name = '3.4 niveau 1 et 2',
  challenges = ['recs9uvUWKQ4HDzw6'],
  competences = ['rec8116cdd76088af'],
} = {}) {
  return new CourseForRelease({
    id,
    description,
    name,
    challenges,
    competences,
  });
};
