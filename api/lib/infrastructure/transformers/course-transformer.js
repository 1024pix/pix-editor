const _ = require('lodash');

function filterCoursesFields(courses) {
  const fieldsToInclude = [
    'id',
    'description',
    'imageUrl',
    'name',
    'challenges',
    'competences',
  ];
  return courses.map((course) => _.pick(course, fieldsToInclude));
}

module.exports = {
  filterCoursesFields
};
