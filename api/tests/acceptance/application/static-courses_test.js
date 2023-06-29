const { expect, databaseBuilder, generateAuthorizationHeader, airtableBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | static courses', () => {
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
        challenges: null,
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
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result.meta).to.deep.equal({ page: 1, pageSize: 10, rowCount: 4, pageCount: 1 });
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

  describe('GET /api/static-courses/{id}', () => {
    it('Return the static course', async () => {
      // Given
      const server = await createServer();
      const user = databaseBuilder.factory.buildReadonlyUser();
      databaseBuilder.factory.buildStaticCourse({
        id: 'courseid1',
        name: 'static course 1',
        description: 'static course description',
        challengeIds: 'challengeid1,challengeid2',
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date('2021-02-02'),
      });
      await databaseBuilder.commit();
      const airtableChallenge1 = airtableBuilder.factory.buildChallenge({
        id: 'challengeid1',
        instruction: 'instruction for challengeid1',
        skillId: 'skillid1',
        status: 'status for challengeid1',
      });
      const airtableSkill1 = airtableBuilder.factory.buildSkill({
        id: 'skillid1',
        name: '@skillid1',
        hint_i18n: {},
      });
      const airtableChallenge2 = airtableBuilder.factory.buildChallenge({
        id: 'challengeid2',
        instruction: 'instruction for challengeid2',
        skillId: 'skillid2',
        status: 'status for challengeid2',
      });
      const airtableSkill2 = airtableBuilder.factory.buildSkill({
        id: 'skillid2',
        name: '@skillid2',
        hint_i18n: {},
      });
      airtableBuilder.mockLists({
        challenges: [airtableChallenge1, airtableChallenge2],
        skills: [airtableSkill1, airtableSkill2],
      });

      // When
      const response = await server.inject({
        method: 'GET',
        url: '/api/static-courses/courseid1',
        headers: generateAuthorizationHeader(user),
      });

      // Then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'static-courses',
          id: 'courseid1',
          attributes: {
            name: 'static course 1',
            description: 'static course description',
            'created-at': new Date('2021-01-01'),
            'updated-at': new Date('2021-02-02'),
          },
          relationships: {
            'challenge-summaries': {
              data: [
                {
                  type: 'challenge-summaries',
                  id: 'challengeid1',
                },
                {
                  type: 'challenge-summaries',
                  id: 'challengeid2',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'challenge-summaries',
            id: 'challengeid1',
            attributes: {
              index: 0,
              instruction: 'instruction for challengeid1',
              'skill-name': '@skillid1',
              status: 'status for challengeid1',
            },
          },
          {
            type: 'challenge-summaries',
            id: 'challengeid2',
            attributes: {
              index: 1,
              instruction: 'instruction for challengeid2',
              'skill-name': '@skillid2',
              status: 'status for challengeid2',
            },
          }
        ],
      });
    });
  });
});
