const { expect, databaseBuilder, generateAuthorizationHeader, airtableBuilder, knex, sinon } = require('../../test-helper');
const createServer = require('../../../server');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');

describe('Acceptance | API | static courses', function() {
  describe('GET /api/static-course-summaries', function() {
    it('Return the list of static course summaries', async function() {
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

  describe('GET /api/static-courses/{id}', function() {
    it('Return the static course', async function() {
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

  describe('POST /api/static-courses', function() {
    let user, clock;

    beforeEach(async function() {
      clock = sinon.useFakeTimers({
        now: new Date('2021-10-29T03:04:00Z'),
        toFake: ['Date'],
      });
      user = databaseBuilder.factory.buildAdminUser();
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
      const airtableChallenge3 = airtableBuilder.factory.buildChallenge({
        id: 'challengeid3',
        instruction: 'instruction for challengeid3',
        skillId: 'skillid3',
        status: 'status for challengeid3',
      });
      const airtableSkill3 = airtableBuilder.factory.buildSkill({
        id: 'skillid3',
        name: '@skillid3',
        hint_i18n: {},
      });
      const airtableChallenge4 = airtableBuilder.factory.buildChallenge({
        id: 'challengeid4',
        instruction: 'instruction for challengeid4',
        skillId: 'skillid4',
        status: 'status for challengeid4',
      });
      const airtableSkill4 = airtableBuilder.factory.buildSkill({
        id: 'skillid4',
        name: '@skillid4',
        hint_i18n: {},
      });
      airtableBuilder.mockLists({
        challenges: [airtableChallenge1, airtableChallenge2, airtableChallenge3, airtableChallenge4],
        skills: [airtableSkill1, airtableSkill2, airtableSkill3, airtableSkill4],
      });
      const getAllIdsInStub = sinon.stub(challengeRepository, 'getAllIdsIn');
      getAllIdsInStub.resolves(['challengeid1', 'challengeid2', 'challengeid3', 'challengeid4']);
    });

    afterEach(function() {
      clock.restore();
      return knex('static_courses').delete();
    });

    it('creates and returns the static course', async function() {
      // given
      const payload = {
        data: {
          attributes: {
            name: 'static course 1',
            description: 'static course description',
            'challenge-ids': ['challengeid3', 'challengeid1'],
          },
        },
      };

      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'POST',
        url: '/api/static-courses',
        headers: generateAuthorizationHeader(user),
        payload,
      });

      // then
      const [ staticCourseId ] = await knex('static_courses').pluck('id');
      expect(response.statusCode).to.equal(201);
      expect(response.result).to.deep.equal({
        data: {
          type: 'static-courses',
          id: staticCourseId,
          attributes: {
            name: 'static course 1',
            description: 'static course description',
            'created-at': new Date('2021-10-29T03:04:00Z'),
            'updated-at': new Date('2021-10-29T03:04:00Z'),
          },
          relationships: {
            'challenge-summaries': {
              data: [
                {
                  type: 'challenge-summaries',
                  id: 'challengeid3',
                },
                {
                  type: 'challenge-summaries',
                  id: 'challengeid1',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'challenge-summaries',
            id: 'challengeid3',
            attributes: {
              index: 0,
              instruction: 'instruction for challengeid3',
              'skill-name': '@skillid3',
              status: 'status for challengeid3',
            },
          },
          {
            type: 'challenge-summaries',
            id: 'challengeid1',
            attributes: {
              index: 1,
              instruction: 'instruction for challengeid1',
              'skill-name': '@skillid1',
              status: 'status for challengeid1',
            },
          }
        ],
      });
    });
  });

  describe('PUT /api/static-courses/{id}', function() {
    let user, clock;
    const staticCourseId = 'myAwesomeCourse66';

    beforeEach(async function() {
      clock = sinon.useFakeTimers({
        now: new Date('2021-10-29T03:04:00Z'),
        toFake: ['Date'],
      });
      user = databaseBuilder.factory.buildAdminUser();
      databaseBuilder.factory.buildStaticCourse({
        id: staticCourseId,
        name: 'some old name',
        description: 'some old description',
        challengeIds: ['challengeid2', 'challengeid3', 'challengeid4'],
        createdAt: new Date('2020-01-01T00:00:10Z'),
        updatedAt: new Date('2020-01-01T00:00:10Z'),
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
      const airtableChallenge3 = airtableBuilder.factory.buildChallenge({
        id: 'challengeid3',
        instruction: 'instruction for challengeid3',
        skillId: 'skillid3',
        status: 'status for challengeid3',
      });
      const airtableSkill3 = airtableBuilder.factory.buildSkill({
        id: 'skillid3',
        name: '@skillid3',
        hint_i18n: {},
      });
      const airtableChallenge4 = airtableBuilder.factory.buildChallenge({
        id: 'challengeid4',
        instruction: 'instruction for challengeid4',
        skillId: 'skillid4',
        status: 'status for challengeid4',
      });
      const airtableSkill4 = airtableBuilder.factory.buildSkill({
        id: 'skillid4',
        name: '@skillid4',
        hint_i18n: {},
      });
      airtableBuilder.mockLists({
        challenges: [airtableChallenge1, airtableChallenge2, airtableChallenge3, airtableChallenge4],
        skills: [airtableSkill1, airtableSkill2, airtableSkill3, airtableSkill4],
      });
      const getAllIdsInStub = sinon.stub(challengeRepository, 'getAllIdsIn');
      getAllIdsInStub.resolves(['challengeid1', 'challengeid2', 'challengeid3', 'challengeid4']);
    });

    afterEach(function() {
      clock.restore();
      return knex('static_courses').delete();
    });

    it('updates and returns the static course', async function() {
      // given
      const payload = {
        data: {
          attributes: {
            name: 'static course 1',
            description: 'static course description',
            'challenge-ids': ['challengeid3', 'challengeid1'],
          },
        },
      };

      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'PUT',
        url: `/api/static-courses/${staticCourseId}`,
        headers: generateAuthorizationHeader(user),
        payload,
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'static-courses',
          id: staticCourseId,
          attributes: {
            name: 'static course 1',
            description: 'static course description',
            'created-at': new Date('2020-01-01T00:00:10Z'),
            'updated-at': new Date('2021-10-29T03:04:00Z'),
          },
          relationships: {
            'challenge-summaries': {
              data: [
                {
                  type: 'challenge-summaries',
                  id: 'challengeid3',
                },
                {
                  type: 'challenge-summaries',
                  id: 'challengeid1',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'challenge-summaries',
            id: 'challengeid3',
            attributes: {
              index: 0,
              instruction: 'instruction for challengeid3',
              'skill-name': '@skillid3',
              status: 'status for challengeid3',
            },
          },
          {
            type: 'challenge-summaries',
            id: 'challengeid1',
            attributes: {
              index: 1,
              instruction: 'instruction for challengeid1',
              'skill-name': '@skillid1',
              status: 'status for challengeid1',
            },
          }
        ],
      });
    });
  });
});
