const { expect, domainBuilder } = require('../../../test-helper');
const { filterCoursesFields } = require('../../../../lib/infrastructure/transformers/course-transformer');

describe('Unit | Infrastructure | course-transformer', function() {

  it('should only keep useful fields', function() {
    const airtableCompetences = [domainBuilder.buildCourseAirtableDataObject()];

    const courses = filterCoursesFields(airtableCompetences);

    expect(courses.length).to.equal(1);
    expect(courses[0].name).to.exist;
    expect(courses[0].adaptive).to.not.exist;
  });
});
