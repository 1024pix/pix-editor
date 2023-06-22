const { expect, databaseBuilder, generateAuthorizationHeader, airtableBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | static course summaries', () => {
  describe('GET /api/static-course-summaries', () => {
    it('Return the list of static course summaries', async () => {
      // Given
      const server = await createServer();
      const user = databaseBuilder.factory.buildReadonlyUser();
      databaseBuilder.factory.buildStaticCourse({
        id: 'courseid1',
        name: 'static course 1',
        challengeIds: 'challengeid1,challengeid2',
        createdAt: new Date('2021-01-01'),
      });

      databaseBuilder.factory.buildStaticCourse({
        id: 'courseid2',
        name: 'static course 2',
        challengeIds: 'challengeid3,challengeid4,challengeid5',
        createdAt: new Date('2021-01-03'),
      });

      const airtableStaticCourse1 = airtableBuilder.factory.buildCourse({
        id: 'courseid3',
        name: 'static course 3',
        challenges: [],
        createdAt: new Date('2021-01-02'),
      });

      const airtableStaticCourse2 = airtableBuilder.factory.buildCourse({
        id: 'courseid4',
        name: 'static course 4',
        challenges: ['challengeid4'],
        createdAt: new Date('2021-01-04'),
      });
      await databaseBuilder.commit();

      airtableBuilder.mockLists({
        courses: [airtableStaticCourse1, airtableStaticCourse2]
      });
      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/static-course-summaries',
        headers: generateAuthorizationHeader(user)
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'static-course-summaries',
          id: 'courseid4',
          attributes: {
            name: 'static course 4',
            'created-at': new Date('2021-01-04'),
            'challenge-count': 1
          },
        },
        {
          type: 'static-course-summaries',
          id: 'courseid2',
          attributes: {
            name: 'static course 2',
            'created-at': new Date('2021-01-03'),
            'challenge-count': 3
          },
        },
        {
          type: 'static-course-summaries',
          id: 'courseid3',
          attributes: {
            name: 'static course 3',
            'created-at': new Date('2021-01-02'),
            'challenge-count': 0
          },
        },
        {
          type: 'static-course-summaries',
          id: 'courseid1',
          attributes: {
            name: 'static course 1',
            'created-at': new Date('2021-01-01'),
            'challenge-count': 2
          },
        }
      ]);
    });
  });
});
