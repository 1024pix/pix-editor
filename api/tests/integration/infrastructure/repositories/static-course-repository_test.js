const { expect, databaseBuilder, airtableBuilder } = require('../../../test-helper');
const staticCourseRepository = require('../../../../lib/infrastructure/repositories/static-course-repository');

describe('Integration | Repository | static-course-repository', function() {
  describe('#findStaticCourses', function() {
    describe('pagination', function() {
      beforeEach(function() {
        // 4 Static courses PG with even dates
        [new Date('2010-01-01'), new Date('2012-01-01'), new Date('2014-01-01'), new Date('2016-01-01')]
          .map((createdAt, index) => {
            databaseBuilder.factory.buildStaticCourse({
              id: `courseId${index}`,
              createdAt,
            });
          });
        // 4 Static courses Airtable with odd dates
        const airtableStaticCourses = [new Date('2009-01-01'), new Date('2011-01-01'), new Date('2013-01-01'), new Date('2015-01-01')]
          .map((createdAt, index) => {
            const airtableIndex = index + 4;
            return airtableBuilder.factory.buildCourse({
              id: `courseId${airtableIndex}`,
              createdAt,
            });
          });
        airtableBuilder.mockLists({
          courses: airtableStaticCourses,
        });
        return databaseBuilder.commit();
      });

      it('should return the static courses and the appropriate meta pagination data that are within the pagination constraints', async function() {
        // given
        const page = { number: 2, size: 3 };

        // when
        const { results: actualStaticCourses, meta } = await staticCourseRepository.findStaticCourses({ page });

        // then
        const actualStaticCourseIds = actualStaticCourses.map(({ id }) => id);
        expect(actualStaticCourseIds).to.deepEqualArray(['courseId6', 'courseId1', 'courseId5']);
        expect(meta).to.deep.equal({
          page: 2,
          pageSize: 3,
          rowCount: 8,
          pageCount: 3,
        });
      });

      it('should return an empty array and the appropriate meta pagination data when pagination goes over the static courses total count', async function() {
        // given
        const page = { number: 5, size: 3 };

        // when
        const { results: actualStaticCourses, meta } = await staticCourseRepository.findStaticCourses({ page });

        // then
        expect(actualStaticCourses).to.be.deep.equal([]);
        expect(meta).to.deep.equal({
          page: 5,
          pageSize: 3,
          rowCount: 8,
          pageCount: 3,
        });
      });
    });
  });
});
